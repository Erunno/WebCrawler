using WebCrawler.Dtos;
using WebCrawler.Entities;

namespace WebCrawler.Repositories
{
    public class WebSiteRecordsRepository
    {
        private const string TagsSeparator = ",";

        private readonly AppDbContext context;

        public WebSiteRecordsRepository([Service] AppDbContext context)
        {
            this.context = context;
        }

        public WebSiteRecord Add(NewWebSiteDto recordData)
        {
            var tagsString = string.Join(TagsSeparator, recordData.Tags ?? new List<string>());

            var newWebSiteRecord = new WebSiteRecord
            {
                Label = recordData.Label,
                Url = recordData.Url,
                PeriodicityMinutes = recordData.PeriodicityMinutes,
                BoundaryRegExp = recordData.BoundaryRegExp ?? string.Empty,
                Tags = tagsString,
                IsActive = recordData.IsActive    
            };

            context.WebSiteRecords.Add(newWebSiteRecord);
            context.SaveChanges();

            return newWebSiteRecord;
        }
    }
}
