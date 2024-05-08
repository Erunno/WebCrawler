

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

        TaskCompletionSource? cycleFinished = new TaskCompletionSource();

        public void RequestExecutorsRun()
        {
            lock (Lock)
            {
                newRequestForExecutionArrived = true;
                Monitor.PulseAll(Lock);
            }
        }

        public Task RequestExecutorsRunAndGetAwaiter()
        {
            lock (Lock)
            {
                newRequestForExecutionArrived = true;

                Monitor.PulseAll(Lock);

                if (cycleFinished == null)
                    cycleFinished = new TaskCompletionSource();

                return cycleFinished.Task;
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
                    cycleFinished!.SetResult();
                    cycleFinished = null;

                    if (!newRequestForExecutionArrived)
                        Monitor.Wait(Lock, timeToWakeUp);

                    newRequestForExecutionArrived = false;

                    if (cycleFinished == null)
                        cycleFinished = new TaskCompletionSource();
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
            using var scope = scopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<WebSiteRecordsRepository>();

            var taskToBeExecuted = await repo.GetTaskToBeExecutedAndSetToInQueue();
            LaunchExecutors(taskToBeExecuted);

            return await repo.GetNearestWebsiteCrawlExecutionTime();
        }

        private void LaunchExecutors(List<ExecutionTask> taskToBeExecuted)
        {
            foreach (var task in taskToBeExecuted)
            {
                var executor = new CrawlingExecutor(task, scopeFactory);
                var runningTask = Task.Run(async () =>
                {
                    await executor.Crawl();
                    RequestExecutorsRun();
                });
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