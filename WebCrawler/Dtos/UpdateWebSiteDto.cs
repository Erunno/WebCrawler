namespace WebCrawler.Dtos
{
    public class UpdateWebSiteDto
    {
        public required int Id { get; set; }
        public string? Label { get; set; }
        public string? Url { get; set; }
        public int? PeriodicityMinutes { get; set; }
        public string? BoundaryRegExp { get; set; }
        public List<string>? Tags { get; set; }
        public bool? IsActive { get; set; }
    }
}
