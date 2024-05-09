using WebCrawler.Entities;
using WebCrawler.Dtos;
using WebCrawler.Repositories;
using Microsoft.EntityFrameworkCore;
using HotChocolate.Data.Sorting;
using HotChocolate.Execution;
using WebCrawler.BusinessLogic.Crawling;
using Azure.Core;

// public class Execution : ObjectType<ExecutionRecord>
// {
//     protected override void Configure(IObjectTypeDescriptor<ExecutionRecord> descriptor)
//     {
//         descriptor.Name("Execution");
//         descriptor.BindFieldsExplicitly();

//         descriptor.Field(x => x.ExecutionId).Name("identifier").Type<NonNullType<IdType>>();

//         descriptor.Field(x => x.SiteRecord).Name("siteRecord").UseFiltering();

//         descriptor.Field(x => x.StartTime).Name("start");
//         descriptor.Field(x => x.EndTime).Name("end");
//         descriptor.Field(x => x.SitesCrawled).Name("sitesCrawled");

//         descriptor.Field(x => x.ExecutionStatus).Name("executionStatus");
//     }
// }

public partial class Query
{
    public IQueryable<ExecutionRecord> GetExecutionsNodes([Service] AppDbContext dbContext)
    {
        return dbContext.Executions.Include(x => x.SiteRecord).OrderByDescending(e => e.StartTime);
    }
}
