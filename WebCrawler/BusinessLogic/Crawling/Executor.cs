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
            System.Console.WriteLine($"\n\nCRAWLING {task.WebsiteRecordId} {DateTime.Now} \n\n");
            using var scope = scopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<ExecutionsRepository>();

            var executionRecord = await repo.GetRecordFor(task.WebsiteRecordId);
            await repo.SetExecutionStateAsRunning(executionRecord);

            try
            {
                await RunCrawling();
                await repo.SetExecutionStateAsSuccess(executionRecord);
            }
            catch (Exception e)
            {
                await repo.SetExecutionStateAsFailed(executionRecord, e.Message);
            }
        }

        public async Task RunCrawling()
        {
            await Task.Delay(TimeSpan.FromSeconds(5));
        }
    }
}