namespace WebCrawler.Dtos
{
    public class WebSiteEditDto
    {
        public string? Label { get; set; }
        public string? Url { get; set; }
        public string? BoundaryRegExp { get; set; }
        public List<string>? Tags { get; set; }
        public bool? IsActive { get; set; }
    }
}
