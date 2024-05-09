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
            var httpClient = new HttpClient();
            HttpResponseMessage response = await httpClient.GetAsync(baseUrl);

            if (!response.IsSuccessStatusCode)
                return new CrawlReport(baseUrl, new List<string>(), DateTime.Now, CrawlReportStatus.Failed);

            string htmlContent = await response.Content.ReadAsStringAsync();

            List<string> links = ExtractLinksFromHtml(htmlContent, baseUrl);
            CrawlReport report = new CrawlReport(baseUrl, links, DateTime.Now, CrawlReportStatus.Success);

            return report;
        }

        private List<string> ExtractLinksFromHtml(string htmlContent, string baseUrl)
        {
            var parser = new HtmlParser();
            var document = parser.ParseDocument(htmlContent);

            return document
                .QuerySelectorAll("a")
                .Select(anchor => anchor.GetAttribute("href")!)
                .Where(href => !string.IsNullOrWhiteSpace(href))
                .Select(href => href.StartsWith("http") ? href : new Uri(new Uri(baseUrl), href).AbsoluteUri)
                .ToList();
        }
    }
}
