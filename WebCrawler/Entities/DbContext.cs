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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Node>(entity =>
            {
                entity.HasMany(e => e.Links)
                .WithMany()
                .UsingEntity<Dictionary<string, object>>(
                    "NodeLink",
                    j => j
                        .HasOne<Node>()
                        .WithMany()
                        .HasForeignKey("NodeId")
                        .OnDelete(DeleteBehavior.Cascade),
                    j => j
                        .HasOne<Node>()
                        .WithMany()
                        .HasForeignKey("LinkedNodeId")
                        .OnDelete(DeleteBehavior.Cascade)
                );
            });

            modelBuilder.Entity<Node>()
                .HasOne(n => n.ExecutionRecord)
                .WithMany(e => e.Nodes)
                .HasForeignKey(n => n.ExecutionRecordId)
                .OnDelete(DeleteBehavior.Cascade);
        }

        public DbSet<WebSiteRecord> WebSiteRecords { get; set; }
        public DbSet<ExecutionRecord> Executions { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<Node> Nodes { get; set; }
    }
}
