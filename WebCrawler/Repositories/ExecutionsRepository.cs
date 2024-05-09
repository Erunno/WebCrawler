using Microsoft.EntityFrameworkCore;
using WebCrawler.Dtos;
using WebCrawler.Entities;
using WebCrawler.Models;

namespace WebCrawler.Repositories
{
    public class ExecutionsRepository
    {
        private readonly AppDbContext context;

        public ExecutionsRepository([Service] AppDbContext context)
        {
            this.context = context;
        }

        public async Task RemoveExecutionsOfInterrupted()
        {
            using var transaction = context.Database.BeginTransaction();

            var interrupted = context.Executions.Where(x =>
                x.ExecutionStatus == ExecutionStatus.Running ||
                x.ExecutionStatus == ExecutionStatus.NotRun ||
                x.ExecutionStatus == ExecutionStatus.InQueue);

            context.Executions.RemoveRange(interrupted);

            await context.SaveChangesAsync();
            await transaction.CommitAsync();
        }

        public async Task<ExecutionRecordHandle> GetRecordFor(int websiteRecordId)
        {
            var record = await context.Executions
                .SingleAsync(e => e.SiteRecordId == websiteRecordId && e.ExecutionStatus == ExecutionStatus.InQueue);

            return new ExecutionRecordHandle(websiteRecordId = record.ExecutionId);
        }

        public Task SetExecutionStateAsRunning(ExecutionRecordHandle executionHandle)
        {
            return SetStatus(executionHandle, ExecutionStatus.Running);
        }


        public Task SetExecutionStateAsSuccess(ExecutionRecordHandle executionHandle)
        {
            return SetStatus(executionHandle, ExecutionStatus.Success, newEndTime: DateTime.Now);
        }

        public Task SetExecutionStateAsFailed(ExecutionRecordHandle executionHandle, string message)
        {
            return SetStatus(executionHandle, ExecutionStatus.Failed, newEndTime: DateTime.Now, message);
        }

        private async Task SetStatus(
            ExecutionRecordHandle executionHandle,
            ExecutionStatus status,
            DateTime? newEndTime = null,
            string? message = null)
        {
            using var transaction = context.Database.BeginTransaction();

            var execution = await context.Executions.SingleAsync(e => e.ExecutionId == executionHandle.Id);
            var websiteRecord = await context.WebSiteRecords.SingleAsync(x => x.Id == execution.SiteRecordId);

            websiteRecord.CurrentExecutionStatus = execution.ExecutionStatus = status;
            websiteRecord.LastUpdateTime = DateTime.Now;

            execution.EndTime = newEndTime;
            execution.LastUpdateTime = DateTime.Now;
            execution.Message = message;

            await context.SaveChangesAsync();
            await transaction.CommitAsync();
        }
    }
}
