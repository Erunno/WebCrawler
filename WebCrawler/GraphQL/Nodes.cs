using WebCrawler.Entities;
using WebCrawler.Dtos;
using WebCrawler.Repositories;
using Microsoft.EntityFrameworkCore;
using HotChocolate.Data.Sorting;
using HotChocolate.Execution;
using WebCrawler.BusinessLogic.Crawling;
using Azure.Core;
using WebCrawler.Models;
using HotChocolate.Subscriptions;
using System.Runtime.CompilerServices;

public class GraphQLNode : ObjectType<Node>
{
    protected override void Configure(IObjectTypeDescriptor<Node> descriptor)
    {
        descriptor.Name("Node");
        descriptor.BindFieldsExplicitly();

        descriptor.Field(x => x.NodeId).Name("identifier").Type<NonNullType<IdType>>();

        descriptor.Field(x => x.Status).Name("status");

        descriptor.Field("title")
            .Resolve(ctx => ctx.Parent<Node>().ExecutionRecord.SiteRecord.Label);

        descriptor.Field("owner")
            .Resolve(ctx => ctx.Parent<Node>().ExecutionRecord.SiteRecord);

        descriptor.Field(x => x.Url).Name("url");
        descriptor.Field(x => x.TimeCrawled).Name("crawlTime");
        descriptor.Field(x => x.Links).Name("links");
    }
}

public partial class Query
{
    public IQueryable<Node> GetExecutionsNodes(
        [Service] AppDbContext dbContext,
        int executionId
    )
    {
        return dbContext.Nodes
            .Include(x => x.Links)
            .Include(x => x.ExecutionRecord)
            .ThenInclude(x => x.SiteRecord)
            .Where(n => n.ExecutionRecordId == executionId);
    }
}

public partial class Subscription
{

    public async IAsyncEnumerable<int> OnNodesOfExecutionUpdatedStream(
        [Service] ITopicEventReceiver eventReceiver,
        [EnumeratorCancellation] CancellationToken cancellationToken,
        int executionRecord)
    {
        var sourceStream = await eventReceiver.SubscribeAsync<int>(nameof(NodesRepository.AddCrawledNode), cancellationToken);
        yield return -1;

        await foreach (var updatedExecution in sourceStream.ReadEventsAsync())
        {
            if (updatedExecution == executionRecord)
                yield return updatedExecution;
        }
    }

    [Subscribe(With = nameof(OnNodesOfExecutionUpdatedStream))]
    public IQueryable<Node> OnNodesOfExecutionUpdated(
        [Service] AppDbContext dbContext,
        [EventMessage] int updatedExecution, int executionRecord
    )
    {
        return dbContext.Nodes
            .Include(x => x.Links)
            .Include(x => x.ExecutionRecord)
            .ThenInclude(x => x.SiteRecord)
            .Where(n => n.ExecutionRecordId == executionRecord);
    }
}
