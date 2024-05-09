using WebCrawler.Models;
using WebCrawler.Repositories;

namespace WebCrawler.BusinessLogic.Crawling
{
    public class CrawlingExecutor
    {
        private readonly ExecutionTask task;
        private readonly IServiceScopeFactory scopeFactory;

        public CrawlingExecutor(
            ExecutionTask task,
            IServiceScopeFactory scopeFactory)
        {
            this.task = task;
            this.scopeFactory = scopeFactory;
        }

        public async Task Crawl()
        {
            using var scope = scopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<ExecutionsRepository>();

            var executionRecord = await repo.GetRecordFor(task.WebsiteRecordId);
            await repo.SetExecutionStateAsRunning(executionRecord);

            try
            {
                await RunCrawling(scope, executionRecord);
                await repo.SetExecutionStateAsSuccess(executionRecord);
            }
            catch (Exception e)
            {
                await repo.SetExecutionStateAsFailed(executionRecord, e.Message);
            }
        }

        public Task RunCrawling(IServiceScope scope, ExecutionRecordHandle executionRecord)
        {
            var crawler = scope.ServiceProvider.GetRequiredService<Crawler>();
            return crawler.Crawl(executionRecord, task.StartUrl, task.Boundary);
        }
    }
}