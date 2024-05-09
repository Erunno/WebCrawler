using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebCrawler.Entities
{
    public enum ExecutionStatus
    {
        Success = 0, Failed = 1, Running = 2, NotRun = 3, InQueue = 4,
    }

    public class ExecutionRecord
    {
        [Key]
        public int ExecutionId { get; set; }

        [Required]
        public DateTime StartTime { get; set; }
        public DateTime LastUpdateTime { get; set; }

        public DateTime? EndTime { get; set; }

        public string? Message { get; set; }

        public ExecutionStatus ExecutionStatus { get; set; } = ExecutionStatus.InQueue;

        public int SiteRecordId { get; set; }
        public required WebSiteRecord SiteRecord { get; set; }

        public List<Node> Nodes { get; set; } = new List<Node>();
    }
}
