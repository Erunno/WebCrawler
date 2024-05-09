using WebCrawler.Entities;
using Microsoft.EntityFrameworkCore;
using WebCrawler.Repositories;
using WebCrawler.BusinessLogic.Crawling;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySQL(builder.Configuration.GetConnectionString("DbConnection") ?? "ERROR"));

builder.Services.AddGraphQLServer()
    .RegisterDbContext<AppDbContext>()
    .AddProjections()
    .AddSorting()
    .AddFiltering()
    .AddQueryType<Query>()
    .AddMutationType<WebSiteMutation>()
    .AddType<WebSite>()
    .AddType<Execution>();

// builder.Services.AddDbContext<AppDbContext>();
builder.Services.AddTransient<WebSiteRecordsRepository>();
builder.Services.AddTransient<ExecutionsRepository>();
builder.Services.AddTransient<NodesRepository>();
builder.Services.AddTransient<Crawler>();
builder.Services.AddSingleton<ExecutionQueue>();

builder.Services.AddControllers();

var app = builder.Build();

var queue = app.Services.GetService<ExecutionQueue>();
queue?.Execute();

app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();

app.MapGraphQL();
app.Run();

// refresh db: dotnet ef database drop; dotnet ef migrations remove; dotnet ef migrations add init; dotnet ef database update