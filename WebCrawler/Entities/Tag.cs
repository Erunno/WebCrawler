using System.ComponentModel.DataAnnotations;

namespace WebCrawler.Entities
{
    public class Tag
    {
        [Key]
        public int TagId { get; set; }

        [Required]
        public required string Value { get; set; }

        public int SiteRecordId { get; set; }
        public WebSiteRecord? SiteRecord { get; set; }
    }
}
