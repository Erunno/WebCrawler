using WebCrawler.Entities;
using Microsoft.EntityFrameworkCore;
using WebCrawler.Repositories;
using WebCrawler.BusinessLogic.Crawling;
using Microsoft.Extensions.DependencyInjection;

var connectionAttempts = 10;
var retryInterval = 5; // seconds

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DbConnection") ?? "ERROR";
var serverName = Environment.GetEnvironmentVariable("DB_SERVER_NAME") ?? "localhost";
connectionString = connectionString.Replace("{server}", serverName);

System.Console.WriteLine($"DB env var: {serverName}, Connection string: {connectionString}");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySQL(connectionString));

builder.Services.AddHttpLogging(o => { });

builder.Services.AddGraphQLServer()
    .AddInMemorySubscriptions()
    .RegisterDbContext<AppDbContext>()
    .AddProjections()
    .AddSorting()
    .AddFiltering()
    .AddQueryType<Query>()
    .AddSubscriptionType<Subscription>()
    .AddMutationType<WebSiteMutation>()
    .AddType<WebSite>()
    .AddType<GraphQLNode>()
    .AddType<Execution>();

builder.Services.AddDbContext<AppDbContext>();
builder.Services.AddTransient<WebSiteRecordsRepository>();
builder.Services.AddTransient<ExecutionsRepository>();
builder.Services.AddTransient<NodesRepository>();
builder.Services.AddTransient<Crawler>();
builder.Services.AddSingleton<ExecutionQueue>();

builder.Services.AddControllers();

var app = builder.Build();
app.UseHttpLogging();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetService<AppDbContext>();

    var attempt = 0;
    while (true)
    {
        try
        {
            dbContext?.Database.EnsureCreated();
            break;
        }
        catch
        {
            if (attempt > connectionAttempts)
                throw;

            attempt++;
            Console.WriteLine($"Cannot connect to DB ... retrying in {retryInterval} seconds");
            Thread.Sleep(retryInterval * 1000);
        }
    }
}

var queue = app.Services.GetService<ExecutionQueue>();
queue?.Execute();

app.UseWebSockets();

app.UseAuthorization();

app.MapControllers();

app.MapGraphQL();
app.Run();

// refresh db: dotnet ef database drop; dotnet ef migrations remove; dotnet ef migrations add init; dotnet ef database update