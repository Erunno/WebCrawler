namespace WebCrawler.Models
{
    public enum CrawlReportStatus
    {
        Success, Failed
    }
    public record CrawlReport(
        string Url,
        List<string> Links,
        string? Title,
        DateTime PageObtainedTime,
        CrawlReportStatus Status
    )
    {
    }
}