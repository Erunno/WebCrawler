using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using AngleSharp.Html.Parser;
using WebCrawler.Models;

namespace WebCrawler.BusinessLogic.Crawling
{
    public class HtmlHarvester
    {
        public async Task<CrawlReport> CrawlPage(string baseUrl)
        {
            try
            {
                return await CrawlPageInner(baseUrl);
            }
            catch
            {
                return GetFailed(baseUrl);
            }
        }

        private async Task<CrawlReport> CrawlPageInner(string baseUrl)
        {
            var httpClient = new HttpClient();

            HttpResponseMessage response = await httpClient.GetAsync(baseUrl); ;

            if (!response.IsSuccessStatusCode)
                return GetFailed(baseUrl);

            string htmlContent = await response.Content.ReadAsStringAsync();

            var (links, title) = ExtractLinksAndTitleFromHtml(htmlContent, baseUrl);

            CrawlReport report = new CrawlReport(baseUrl, links, title, DateTime.Now, CrawlReportStatus.Success);

            return report;
        }

        private (List<string> links, string? title) ExtractLinksAndTitleFromHtml(string htmlContent, string baseUrl)
        {
            var parser = new HtmlParser();
            var document = parser.ParseDocument(htmlContent);

            var title = document.QuerySelector("title")?.TextContent;

            var links = document
                .QuerySelectorAll("a")
                .Select(anchor => anchor.GetAttribute("href")!)
                .Where(href => !string.IsNullOrWhiteSpace(href))
                .Select(href => href.StartsWith("http") ? href : new Uri(new Uri(baseUrl), href).AbsoluteUri)
                .ToList();

            return (links, title);
        }

        private CrawlReport GetFailed(string url)
        {
            return new CrawlReport(
                url,
                new List<string>(), null,
                DateTime.Now, CrawlReportStatus.Failed
            );
        }
    }
}
