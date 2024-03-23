using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebCrawler.Entities
{
    public class ExecutionRecord
    {
        [Key]
        public int ExecutionId { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        public DateTime? EndTime { get; set; }

        public int SitesCrawled { get; set; }

        public int SiteRecordId { get; set; }
        public required WebSiteRecord SiteRecord { get; set; } 
    }
}
