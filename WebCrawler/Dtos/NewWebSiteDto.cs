namespace WebCrawler.Dtos
{
    public class NewWebSiteDto
    {
        public required string Label { get; set; }
        public required string Url { get; set; }
        public int PeriodicityMinutes { get; set; }
        public string? BoundaryRegExp { get; set; }
        public List<string>? Tags { get; set; }
        public bool IsActive { get; set; }
    }
}
