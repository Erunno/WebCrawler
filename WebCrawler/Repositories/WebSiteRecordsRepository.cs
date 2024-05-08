using System.Transactions;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using WebCrawler.BusinessLogic.Crawling;
using WebCrawler.Dtos;
using WebCrawler.Entities;
using WebCrawler.Models;

namespace WebCrawler.Repositories
{
    public class WebSiteRecordsRepository
    {
        private const string TagsSeparator = ",";

        private readonly AppDbContext context;

        public WebSiteRecordsRepository(
            [Service] AppDbContext context)
        {
            this.context = context;
        }

        public async Task<WebSiteRecord> Add(NewWebSiteDto recordData)
        {
            using var transaction = context.Database.BeginTransaction();

            var newWebSiteRecord = new WebSiteRecord
            {
                Label = recordData.Label,
                Url = recordData.Url,
                PeriodicityMinutes = recordData.PeriodicityMinutes,
                CurrentExecutionStatus = ExecutionStatus.NotRun,
                BoundaryRegExp = recordData.BoundaryRegExp ?? string.Empty,
                Tags = recordData.Tags?.Select(t => new Entities.Tag() { Value = t }).ToList() ?? new List<Entities.Tag>(),
                IsActive = recordData.IsActive
            };

            context.WebSiteRecords.Add(newWebSiteRecord);

            await context.SaveChangesAsync();
            await transaction.CommitAsync();

            return newWebSiteRecord;
        }

        public async Task<WebSiteRecord> Update(UpdateWebSiteDto input)
        {
            using var transaction = context.Database.BeginTransaction();

            var websiteRecord = await context.WebSiteRecords
                .Include(wr => wr.Tags)
                .FirstAsync(x => x.Id == input.Id);

            if (input.Label is not null)
                websiteRecord.Label = input.Label;

            if (input.Url is not null)
                websiteRecord.Url = input.Url;

            if (input.PeriodicityMinutes is not null)
                websiteRecord.PeriodicityMinutes = input.PeriodicityMinutes.Value;

            if (input.BoundaryRegExp is not null)
                websiteRecord.BoundaryRegExp = input.BoundaryRegExp;

            if (input.IsActive is not null)
                websiteRecord.IsActive = input.IsActive.Value;

            if (input.Tags is not null)
            {
                var tagsToRemove = websiteRecord.Tags.Where(t => !input.Tags.Contains(t.Value));
                context.Tags.RemoveRange(tagsToRemove);

                var tagsToAdd = input.Tags
                    .Where(inputTag => websiteRecord.Tags
                        .Where(tagEntity => tagEntity.Value == inputTag)
                        .IsNullOrEmpty())
                    .Select(t => new Entities.Tag() { Value = t });

                websiteRecord.Tags.AddRange(tagsToAdd);
            }

            await context.SaveChangesAsync();
            await transaction.CommitAsync();

            return websiteRecord;
        }

        public async Task Delete(int id)
        {
            using var transaction = context.Database.BeginTransaction();

            var websiteRecord = await context.WebSiteRecords
                .Include(wr => wr.Tags)
                .Include(wr => wr.Executions)
                .FirstAsync(x => x.Id == id);

            context.Executions.RemoveRange(websiteRecord.Executions);
            context.Tags.RemoveRange(websiteRecord.Tags);
            context.WebSiteRecords.Remove(websiteRecord);

            await context.SaveChangesAsync();
            await transaction.CommitAsync();
        }

        public async Task SetStateNotRun(int id)
        {
            using var transaction = context.Database.BeginTransaction();

            var websiteRecord = await context.WebSiteRecords
                .FirstAsync(x => x.Id == id);

            if (websiteRecord.CurrentExecutionStatus != ExecutionStatus.Running ||
                websiteRecord.CurrentExecutionStatus != ExecutionStatus.InQueue)
            {
                websiteRecord.CurrentExecutionStatus = ExecutionStatus.NotRun;
                await context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
        }

        public async Task<List<ExecutionTask>> GetTaskToBeExecutedAndSetToInQueue()
        {
            using var transaction = context.Database.BeginTransaction();

            var now = DateTime.Now;

            var websitesToBeExecutedQuery = GetWebsitesToBeCrawled(now);
            var websitesToBeExecutedList = await ToExecutionTasks(websitesToBeExecutedQuery);

            await websitesToBeExecutedQuery
                .ForEachAsync(rec => rec.CurrentExecutionStatus = ExecutionStatus.InQueue);

            await InitExecutionFor(websitesToBeExecutedQuery, now);

            await context.SaveChangesAsync();
            await transaction.CommitAsync();

            return websitesToBeExecutedList;
        }

        private Task<List<ExecutionTask>> ToExecutionTasks(IQueryable<WebSiteRecord> query)
        {
            return ToExecutionTasks(query, DateTime.Now);
        }

        private Task<List<ExecutionTask>> ToExecutionTasks(IQueryable<WebSiteRecord> query, DateTime now)
        {
            return query.Select(rec => new ExecutionTask(
                rec.Id, now, ExecutionStatus.Running, rec.PeriodicityMinutes,
                rec.Url, rec.BoundaryRegExp)
            ).ToListAsync();
        }

        public async Task<TimeSpan> GetNearestWebsiteCrawlExecutionTime()
        {
            using var transaction = context.Database.BeginTransaction();

            var now = DateTime.Now;

            if (!context.WebSiteRecords.Any())
                return TimeSpan.MaxValue;

            if (await GetWebsitesToBeCrawled(now).AnyAsync())
                return TimeSpan.Zero;

            var soonestRecordToExecute = await context.WebSiteRecords
                .Where(rec => rec.IsActive)
                .Where(rec => rec.LastUpdateTime != null)
                .OrderBy(rec => rec.LastUpdateTime!.Value.AddMinutes(rec.PeriodicityMinutes) - now)
                .FirstOrDefaultAsync();

            if (soonestRecordToExecute == null)
                return TimeSpan.MaxValue;

            var lastExecution = soonestRecordToExecute.LastUpdateTime!.Value;
            var periodicity = soonestRecordToExecute.PeriodicityMinutes;

            var nearest = lastExecution.AddMinutes(periodicity) - now;

            if (nearest < TimeSpan.Zero)
                return TimeSpan.Zero;

            return nearest;
        }

        private IQueryable<WebSiteRecord> GetWebsitesToBeCrawled(DateTime time)
        {
            return context
                .WebSiteRecords
                .Where(rec => rec.IsActive)
                .Where(rec => rec.CurrentExecutionStatus != ExecutionStatus.Running)
                .Where(rec => rec.CurrentExecutionStatus != ExecutionStatus.InQueue)
                .Where(rec => rec.CurrentExecutionStatus == ExecutionStatus.NotRun ||
                              rec.LastUpdateTime!.Value.AddMinutes(rec.PeriodicityMinutes) < time);
        }

        public Task<List<ExecutionTask>> GetInterruptedWebsites()
        {
            var query = context.WebSiteRecords
                .Where(rec =>
                    rec.CurrentExecutionStatus == ExecutionStatus.Running ||
                    rec.CurrentExecutionStatus == ExecutionStatus.NotRun ||
                    rec.CurrentExecutionStatus == ExecutionStatus.InQueue);

            return ToExecutionTasks(query);
        }

        public async Task SetInterruptedWebsitesToInQueue()
        {
            using var transaction = context.Database.BeginTransaction();

            var query = context.WebSiteRecords
                .Where(rec => rec.CurrentExecutionStatus == ExecutionStatus.Running ||
                              rec.CurrentExecutionStatus == ExecutionStatus.NotRun ||
                              rec.CurrentExecutionStatus == ExecutionStatus.InQueue);


            await query.ForEachAsync(rec => rec.CurrentExecutionStatus = ExecutionStatus.InQueue);
            await InitExecutionFor(query, DateTime.Now);

            await context.SaveChangesAsync();
            await transaction.CommitAsync();
        }

        public Task<WebSiteRecord?> GetWebSiteRecord(int id)
        {
            return context.WebSiteRecords.Where(rec => rec.Id == id).SingleOrDefaultAsync();
        }

        private Task InitExecutionFor(IQueryable<WebSiteRecord> websites, DateTime now)
        {
            return websites.ForEachAsync(rec => context.Executions.Add(new ExecutionRecord
            {
                StartTime = now,
                SiteRecord = rec,
                ExecutionStatus = ExecutionStatus.InQueue,
            }));

        }
    }
}
