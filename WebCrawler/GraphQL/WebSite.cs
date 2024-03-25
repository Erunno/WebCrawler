using WebCrawler.Entities;
using WebCrawler.Dtos;
using WebCrawler.Repositories;
using Microsoft.EntityFrameworkCore;
using HotChocolate.Data.Sorting;

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
            .Resolve(ctx => ctx.Parent<WebSiteRecord>().Tags.Select(t => t.Value));
        descriptor.Field(x => x.IsActive).Name("active");

        descriptor.Field("lastTimeCrawled")
          .Type<DateTimeType>()
          .Resolve(ctx => GetLastTimeCrawled(ctx.Parent<WebSiteRecord>()));

        descriptor.Field(x => x.Executions).Ignore();
    }

    private DateTime? GetLastTimeCrawled(WebSiteRecord webSiteRecord)
    {
        if (webSiteRecord.Executions.Any())
        {
            return webSiteRecord.Executions.Max(execution => execution.StartTime);
        }

        return null;
    }
}

public class WebSiteMutation
{
    public WebSiteRecord AddSiteRecord(
        [Service] AppDbContext dbContext, 
        [Service] WebSiteRecordsRepository webSiteRecordsRepo, 
        NewWebSiteDto input)
    {
        var newRecord = webSiteRecordsRepo.Add(input);

        return newRecord;
    }
}

public class Query
{
    [UseOffsetPaging(IncludeTotalCount = true)]
    [UseSorting]
    [UseFiltering]
    public IQueryable<WebSiteRecord> GetWebsitesPagedSorted([Service] AppDbContext dbContext) => dbContext.WebSiteRecords.Include(x => x.Executions).Include(x => x.Tags);

    public IQueryable<WebSiteRecord> GetWebsites([Service] AppDbContext dbContext) => dbContext.WebSiteRecords.Include(x => x.Executions).Include(x => x.Tags);
}
