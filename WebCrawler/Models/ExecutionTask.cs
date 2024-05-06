
using System.Text.RegularExpressions;
using WebCrawler.Entities;

namespace WebCrawler.Models
{
    public record ExecutionTask
    {
        public int WebsiteRecordId { get; init; }
        public DateTime? LastExecution { get; init; }
        public ExecutionStatus? ExecStatus { get; init; }
        public int PeriodicityInMin { get; init; }
        public string StartUrl { get; init; }
        public Regex Boundary { get; init; }

        public ExecutionTask(
            int websiteRecordId,
            DateTime? lastExecution,
            ExecutionStatus? execStatus,
            int periodicityInMin,
            string startUrl,
            string boundaryLink)
        {
            WebsiteRecordId = websiteRecordId;
            LastExecution = lastExecution;
            ExecStatus = execStatus;
            PeriodicityInMin = periodicityInMin;
            StartUrl = startUrl;
            Boundary = new Regex(boundaryLink);
        }

        public bool ShouldExecute(DateTime currentTime)
        {
            if (!LastExecution.HasValue)
                return true;

            return LastExecution.Value.AddMinutes(PeriodicityInMin) <= currentTime;
        }
    }

}