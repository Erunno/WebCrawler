using WebCrawler.Entities;
using Microsoft.EntityFrameworkCore;
using WebCrawler.Repositories;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySQL(builder.Configuration.GetConnectionString("DbConnection") ?? "ERROR"));

builder.Services.AddGraphQLServer()
    .RegisterDbContext<AppDbContext>()
    .AddSorting()
    .AddQueryType<Query>()
    .AddMutationType<WebSiteMutation>()
    .AddType<WebSite>();

builder.Services.AddDbContext<AppDbContext>();
builder.Services.AddTransient<WebSiteRecordsRepository>();

builder.Services.AddControllers();

var app = builder.Build();

app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();

app.MapGraphQL();
app.Run();
