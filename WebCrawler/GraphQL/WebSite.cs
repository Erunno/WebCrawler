﻿using WebCrawler.Entities;
using WebCrawler.Dtos;
using WebCrawler.Repositories;
using Microsoft.EntityFrameworkCore;
using HotChocolate.Data.Sorting;
using HotChocolate.Execution;
using WebCrawler.BusinessLogic.Crawling;

public class WebSite : ObjectType<WebSiteRecord>
{
    protected override void Configure(IObjectTypeDescriptor<WebSiteRecord> descriptor)
    {
        descriptor.Name("WebPage");

        descriptor.Field(x => x.Id).Name("identifier").Type<NonNullType<IdType>>();
        descriptor.Field(x => x.Label).Name("label");
        descriptor.Field(x => x.Url).Name("url");
        descriptor.Field(x => x.BoundaryRegExp).Name("regexp");
        descriptor.Field(x => x.PeriodicityMinutes);
        descriptor.Field(x => x.Tags).Name("tags")
            .IsProjected()
            .Resolve(ctx => ctx.Parent<WebSiteRecord>().Tags.Select(t => t.Value));
        descriptor.Field(x => x.IsActive).Name("active");

        descriptor.Field(x => x.LastUpdateTime).Name("lastExecution");
        descriptor.Field(x => x.CurrentExecutionStatus).Name("lastExecutionStatus");
    }
}

public class WebSiteMutation
{
    public async Task<WebSiteRecord> AddSiteRecord(
        [Service] WebSiteRecordsRepository webSiteRecordsRepo,
        [Service] ExecutionQueue executionQueue,
        NewWebSiteDto input)
    {
        var newRecord = await webSiteRecordsRepo.Add(input);
        executionQueue.RequestExecutorsRun();

        return newRecord;
    }

    public async Task<WebSiteRecord> UpdateSiteRecord(
        [Service] WebSiteRecordsRepository webSiteRecordsRepo,
        [Service] ExecutionQueue executionQueue,
        UpdateWebSiteDto input)
    {
        var newRecord = await webSiteRecordsRepo.Update(input);
        executionQueue.RequestExecutorsRun();

        return newRecord;
    }

    public async Task<int> DeleteSiteRecord(
        [Service] WebSiteRecordsRepository webSiteRecordsRepo,
        WebSiteReferenceDto toDelete)
    {
        await webSiteRecordsRepo.Delete(toDelete.Id);
        return toDelete.Id;
    }

    public async Task<int> RequestExecution(
        [Service] WebSiteRecordsRepository webSiteRecordsRepo,
        [Service] ExecutionQueue executionQueue,
        WebSiteReferenceDto toExecute)
    {
        await webSiteRecordsRepo.SetStateNotRun(toExecute.Id);
        await executionQueue.RequestExecutorsRunAndGetAwaiter();

        return toExecute.Id;
    }
}

public class WebSiteRecordSortType : SortInputType<WebSiteRecord>
{
    protected override void Configure(ISortInputTypeDescriptor<WebSiteRecord> descriptor)
    {
        descriptor.BindFieldsExplicitly();
        descriptor.Field(f => f.Label).Name("label");
        descriptor.Field(f => f.Url).Name("url");
        descriptor.Field(f => f.LastUpdateTime).Name("lastExecution");
    }
}

public partial class Query
{
    [UseOffsetPaging(IncludeTotalCount = true)]
    [UseProjection]
    [UseFiltering]
    [UseSorting<WebSiteRecordSortType>]
    public IQueryable<WebSiteRecord> GetWebsitesPagedSorted([Service] AppDbContext dbContext)
    {
        return dbContext.WebSiteRecords;
    }

    [UseProjection]
    public IQueryable<WebSiteRecord> GetWebsites([Service] AppDbContext dbContext) => dbContext.WebSiteRecords;
}
