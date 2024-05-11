using AngleSharp.Common;
using WebCrawler.Entities;
using WebCrawler.Repositories;

namespace WebCrawler.BusinessLogic.Nodes
{
    public class NodesReducer
    {
        private readonly NodesRepository repo;

        public NodesReducer(
            [Service] NodesRepository repo
        )
        {
            this.repo = repo;
        }

        public async Task<IList<Node>> GetReducedNodes(List<int> webpages)
        {
            var allNodes = await repo.GetNodesOfWebpages(webpages);
            var get = new Dictionary<int, Node>();
            throw new NotImplementedException();
        }

        public Dictionary<string, List<Node>> ToDictionaryByUrl(IList<Node> nodes)
        {
            return nodes
                .GroupBy(n => n.Url)
                .ToDictionary(
                    group => group.Key,
                    group => group
                        .OrderByDescending(n => n.TimeCrawled)
                        .ToList()
                );
        }
    }
}