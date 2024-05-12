using System.ComponentModel.DataAnnotations;

namespace WebCrawler.Entities
{
    public enum NodeStatus
    {
        Crawled = 0, NotCrawled = 1, Failed = 2,
    }

    public class Node
    {
        [Key]
        public int NodeId { get; set; }

        [Required]
        public required string Url { get; set; }

        public string? Title { get; set; }

        [Required]
        public required NodeStatus Status { get; set; }

        public DateTime? TimeCrawled { get; set; }

        [Required]
        public int ExecutionRecordId { get; set; }

        public required ExecutionRecord ExecutionRecord { get; set; }

        public List<Node> Links { get; set; } = new List<Node>();
    }
}

