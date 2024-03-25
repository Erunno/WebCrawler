using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace WebCrawler.Entities
{
    public class WebSiteRecord
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public required string Url { get; set; }

        [Required]
        [MaxLength(255)]
        public required string BoundaryRegExp { get; set; }

        [Required]
        public int PeriodicityMinutes { get; set; }

        [MaxLength(255)]
        public required string Label { get; set; }

        public bool IsActive { get; set; }

        public List<Tag> Tags { get; set; } = new List<Tag>();
        public List<ExecutionRecord> Executions { get; set; } = new List<ExecutionRecord>();
    }
}
