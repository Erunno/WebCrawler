using System.Transactions;
using Microsoft.EntityFrameworkCore;
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

            var tagsString = string.Join(TagsSeparator, recordData.Tags ?? new List<string>());

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

            context.SaveChanges();
            await transaction.CommitAsync();

            return newWebSiteRecord;
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
