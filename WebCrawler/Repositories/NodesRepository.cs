using Microsoft.EntityFrameworkCore;
using WebCrawler.Dtos;
using WebCrawler.Entities;
using WebCrawler.Models;

namespace WebCrawler.Repositories
{
    public class NodesRepository
    {
        private readonly AppDbContext context;

        public NodesRepository(
            [Service] AppDbContext context
        )
        {
            this.context = context;
        }

        public async Task AddCrawledNode(ExecutionRecordHandle executionRecord, CrawlReport report)
        {
            using var transaction = context.Database.BeginTransaction();

            var executionEntity = context.Executions.First(r => r.ExecutionId == executionRecord.Id);
            var computedNodes = context.Nodes
                .Where(n => n.ExecutionRecordId == executionRecord.Id)
                .ToDictionary(n => n.Url);

            var newNodes = new List<Node>();

            if (!computedNodes.ContainsKey(report.Url))
            {
                computedNodes[report.Url] = new Node()
                {
                    Url = report.Url,
                    Status = NodeStatus.NotCrawled,
                    ExecutionRecordId = executionRecord.Id,
                    ExecutionRecord = executionEntity
                };

                newNodes.Add(computedNodes[report.Url]);
            }

            var originNode = computedNodes[report.Url];

            originNode.TimeCrawled = report.PageObtainedTime;
            originNode.Status = report.Status == CrawlReportStatus.Success
                ? NodeStatus.Crawled
                : NodeStatus.Failed;

            foreach (var link in report.Links)
            {
                if (!computedNodes.ContainsKey(link))
                {
                    computedNodes[link] = new Node()
                    {
                        Url = link,
                        Status = NodeStatus.NotCrawled,
                        ExecutionRecordId = executionRecord.Id,
                        ExecutionRecord = executionEntity
                    };

                    newNodes.Add(computedNodes[link]);
                }

                originNode.Links.Add(computedNodes[link]);
            }

            await context.Nodes.AddRangeAsync(newNodes);
            await context.SaveChangesAsync();

            await transaction.CommitAsync();
        }
    }
}