

using Microsoft.EntityFrameworkCore;
using WebCrawler.Entities;
using WebCrawler.Models;
using WebCrawler.Repositories;

namespace WebCrawler.BusinessLogic.Crawling
{
    public class ExecutionQueue
    {
        private readonly IServiceScopeFactory scopeFactory;
        private object Lock { get; } = new object();
        private bool newRequestForExecutionArrived = false;
        private Thread? jobThread;

        private static readonly TimeSpan MaxWaitTime = TimeSpan.FromMinutes(420);

        public ExecutionQueue(IServiceScopeFactory scopeFactory)
        {
            this.scopeFactory = scopeFactory;
        }

        public void RequestExecutorsRun()
        {
            lock (Lock)
            {
                newRequestForExecutionArrived = true;
                Monitor.PulseAll(Lock);
            }
        }

        private async Task RunExecutionLoop()
        {
            await ReLaunchInterruptedTasks();

            while (true)
            {
                var timeToWakeUp = await ScheduleTasks();

                if (timeToWakeUp > MaxWaitTime)
                    timeToWakeUp = MaxWaitTime;

                lock (Lock)
                {
                    if (newRequestForExecutionArrived)
                    {
                        newRequestForExecutionArrived = false;
                        continue;
                    }

                    Monitor.Wait(Lock, timeToWakeUp);
                }
            }
        }

        private async Task ReLaunchInterruptedTasks()
        {
            using var scope = scopeFactory.CreateScope();
            var websitesRepo = scope.ServiceProvider.GetRequiredService<WebSiteRecordsRepository>();
            var executionsRepo = scope.ServiceProvider.GetRequiredService<ExecutionsRepository>();

            await executionsRepo.RemoveExecutionsOfInterrupted();
            var interruptedTasks = await websitesRepo.GetInterruptedWebsites();

            await websitesRepo.SetInterruptedWebsitesToInQueue();

            LaunchExecutors(interruptedTasks);
        }

        private async Task<TimeSpan> ScheduleTasks()
        {
            System.Console.WriteLine($"\n\nSCHEDULING\n\n");
            using var scope = scopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<WebSiteRecordsRepository>();

            var taskToBeExecuted = await repo.GetTaskToBeExecutedAndSetToInQueue();
            LaunchExecutors(taskToBeExecuted);

            System.Console.WriteLine($"\n\nTask To be executed: {taskToBeExecuted.Count()}\n\n");
            foreach (var task in taskToBeExecuted)
            {
                System.Console.WriteLine($"  --> id: {task.WebsiteRecordId}\n\n");
            }

            return await repo.GetNearestWebsiteCrawlExecutionTime();
        }

        private void LaunchExecutors(List<ExecutionTask> taskToBeExecuted)
        {
            foreach (var task in taskToBeExecuted)
            {
                var executor = new CrawlingExecutor(task, scopeFactory);
                System.Console.WriteLine($"Launching Crawling... {task.WebsiteRecordId} {DateTime.Now}");
                var runningTask = Task.Run(() => executor.Crawl().Wait());
            }
        }

        public void Execute()
        {
            if (jobThread is not null)
                return;

            jobThread = new Thread(() => RunExecutionLoop().Wait());
            jobThread.Start();
        }
    }
}