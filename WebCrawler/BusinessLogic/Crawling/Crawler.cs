using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using AngleSharp.Html.Parser;
using WebCrawler.Models;
using WebCrawler.Repositories;

namespace WebCrawler.BusinessLogic.Crawling
{
    public class Crawler
    {
        private readonly NodesRepository nodesRepository;
        private static int MaxCrawlDepth { get; } = 5;

        public Crawler(
            [Service] NodesRepository nodesRepository
        )
        {
            this.nodesRepository = nodesRepository;
        }

        private Queue<QueueRecord> Queue { get; } = new Queue<QueueRecord>();

        private class QueueRecord
        {
            public required string Url { get; init; }
            public required int Depth { get; init; }

        }

        public async Task Crawl(
            ExecutionRecordHandle executionRecord,
            string baseUrl,
            Regex boundary)
        {
            var htmlHarvester = new HtmlHarvester();
            var visitedPages = new HashSet<string>();

            Queue.Enqueue(new QueueRecord()
            {
                Url = baseUrl,
                Depth = 0,
            });

            while (Queue.Count > 0)
            {
                var toCrawl = Queue.Dequeue();

                if (visitedPages.Contains(toCrawl.Url))
                    continue;

                visitedPages.Add(toCrawl.Url);

                if (boundary.IsMatch(toCrawl.Url))
                {
                    var report = await htmlHarvester.CrawlPage(toCrawl.Url);
                    EnqueueReport(report, toCrawl);

                    await nodesRepository.AddCrawledNode(executionRecord, report);
                }
            }
        }

        private void EnqueueReport(CrawlReport report, QueueRecord origin)
        {
            if (origin.Depth >= MaxCrawlDepth)
                return;

            foreach (var link in report.Links)
                Queue.Enqueue(new QueueRecord()
                {
                    Url = link,
                    Depth = origin.Depth + 1,
                });
        }
    }
}
