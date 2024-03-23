using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace WebCrawler.Entities
{

    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<WebSiteRecord> WebSiteRecords { get; set; }
        public DbSet<ExecutionRecord> Executions { get; set; }
    }
}
