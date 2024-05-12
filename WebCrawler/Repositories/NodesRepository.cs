using Azure.Core;
using HotChocolate.Subscriptions;
using Microsoft.EntityFrameworkCore;
using WebCrawler.Dtos;
using WebCrawler.Entities;
using WebCrawler.Models;

namespace WebCrawler.Repositories
{
    public class NodeTopics
    {
        public static object? NodeAddedToExecution { get; }
        public static object? NodeAddedToWebsite { get; }
    }
    public class NodesRepository
    {

        public static readonly string NodeAddedTopic = nameof(NodeAddedTopic);

        private readonly AppDbContext context;
        private readonly ITopicEventSender sender;

        public NodesRepository(
            [Service] AppDbContext context,
            [Service] ITopicEventSender sender
        )
        {
            this.context = context;
            this.sender = sender;
        }

        public async Task AddCrawledNode(ExecutionRecordHandle executionRecord, CrawlReport report)
        {
            using var transaction = context.Database.BeginTransaction();

            var executionEntity = await context.Executions.FirstAsync(r => r.ExecutionId == executionRecord.Id);
            var computedNodes = await context.Nodes
                .Where(n => n.ExecutionRecordId == executionRecord.Id)
                .ToDictionaryAsync(n => n.Url);

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
            originNode.Title = report.Title;

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

            await sender.SendAsync(nameof(NodeTopics.NodeAddedToExecution), executionRecord.Id);
            await sender.SendAsync(nameof(NodeTopics.NodeAddedToWebsite), executionEntity.SiteRecordId);
            await Task.Delay(3000);
        }

        public async Task<IList<Node>> GetNodesOfWebpages(List<int> webpages)
        {
            using var transaction = context.Database.BeginTransaction();

            var relevantExecutions = await context
                .Executions
                .Where(e => webpages.Contains(e.SiteRecordId))
                .GroupBy(e => e.SiteRecordId)
                .Select(group => group
                    .OrderByDescending(e => e.StartTime)
                    .FirstOrDefault())
                .ToListAsync();

            var relevantExecutionsIds = relevantExecutions
                .Where(e => e is not null)
                .Select(e => e!.ExecutionId)
                .ToList();

            var result = await context.Nodes
                .Where(n => relevantExecutionsIds.Contains(n.ExecutionRecordId))
                .Include(n => n.Links)
                .Include(n => n.ExecutionRecord)
                    .ThenInclude(n => n.SiteRecord)
                .ToListAsync();

            await transaction.CommitAsync();
            return result;
        }
    }
}