namespace WebCrawler.Models
{
    public enum CrawlReportStatus
    {
        Success, Failed
    }
    public record CrawlReport(
        string Url,
        List<string> Links,
        DateTime PageObtainedTime,
        CrawlReportStatus Status
    )
    {
    }
}