import { Injectable } from '@angular/core';
import { ApiNode, ExecutionNodeStatus } from '../models/node-api';
import {
  CrawledNode,
  FailedNode,
  Graph,
  GraphLink,
  GraphNode,
  NodeData,
  NotCrawledNode,
  WebsiteRecordShort,
} from '../models/graph';

@Injectable({
  providedIn: 'root',
})
export class NodesTransformerService {
  private statusToStyle = {
    [ExecutionNodeStatus.CRAWLED]: CrawledNode,
    [ExecutionNodeStatus.NOT_CRAWLED]: NotCrawledNode,
    [ExecutionNodeStatus.FAILED]: FailedNode,
  };

  public getD3Graph(apiNodes: ApiNode[]): Graph {
    const nodesByUrl = this.getNodesByUrl(apiNodes);
    const newestNodes = this.filterNewestNodes(nodesByUrl);

    const nodes: GraphNode[] = Object.keys(newestNodes).map((url) => {
      const node = newestNodes[url];
      return {
        id: node.url,
        style: this.statusToStyle[node.status],
        data: {
          url: node.url,
          label: node.title ?? this.getDomainFrom(node.url),
          allOwners: nodesByUrl[url].map((owner) => ({
            id: owner.ownerWebsite.id,
            url: owner.ownerWebsite.url,
            label: owner.ownerWebsite.label,
            isActive: owner.ownerWebsite.isActive,
          })),
          newestOwner: {
            id: node.ownerWebsite.id,
            url: node.ownerWebsite.url,
            label: node.ownerWebsite.label,
            isActive: node.ownerWebsite.isActive,
          },
          crawlStatus: node.status,
          links: node.links.map((l) => l.url),
        } as NodeData,
      } as GraphNode;
    });

    const links = nodes
      .map((n) =>
        n.data.links.map(
          (l) => ({ source: n.id, target: newestNodes[l].id } as GraphLink)
        )
      )
      .flat();

    return {
      nodes,
      links,
    };
  }

  public getDomainFrom(url: string): string {
    return url
      .replace(/(^\w+:|^)\/\//, '') // Remove protocol (https:// or http://)
      .replace(/\/.*|(\?.*)/, '') // Remove path and query string
      .replace(/#.*$/, '') // Remove hash fragment
      .replace(/^www\./, ''); // Remove 'www' prefix
  }

  private getNodesByUrl(apiNodes: ApiNode[]) {
    const nodesByUrl: { [url: string]: ApiNode[] } = {};

    apiNodes.forEach((n) => {
      if (!nodesByUrl[n.url]) nodesByUrl[n.url] = [];
      nodesByUrl[n.url].push(n);
    });

    return nodesByUrl;
  }

  private filterNewestNodes(nodesByUrl: { [url: string]: ApiNode[] }) {
    const nodeByUrl: { [url: string]: ApiNode } = {};

    Object.keys(nodesByUrl).forEach((url) => {
      const nodes = nodesByUrl[url];

      const newestNode = nodes.reduce((newest, current) => {
        if (!current.crawlTime) return newest;

        if (!newest || current.crawlTime.isAfter(newest.crawlTime))
          return current;

        return newest;
      }, nodes[0]);

      nodeByUrl[url] = newestNode;
    });

    return nodeByUrl;
  }

  public getDomainViewD3Graph({ nodes, links }: Graph): Graph {
    const nodesByDomain: { [domain: string]: GraphNode[] } = {};

    nodes.forEach((n) => {
      const domain = this.getDomainFrom(n.data.url);
      if (!nodesByDomain[domain]) {
        nodesByDomain[domain] = [];
      }
      nodesByDomain[domain].push(n);
    });

    const newLinks = this.filterUniqueLinks(
      links.map(
        (l) =>
          ({
            source: this.getDomainFrom(l.source),
            target: this.getDomainFrom(l.target),
          } as GraphLink)
      )
    );

    const contractedNodes = Object.keys(nodesByDomain).map((domain) => {
      const status = this.getCrawlStatusOfGroup(nodesByDomain[domain]);

      return {
        id: domain,
        data: {
          url: `http://${domain}`,
          label: domain,
          allOwners: this.getAllOwnersOfGroup(nodesByDomain[domain]),
          crawlStatus: status,
        },
        style: this.statusToStyle[status],
      } as GraphNode;
    });

    return {
      nodes: contractedNodes,
      links: newLinks,
    };
  }

  private filterUniqueLinks(links: GraphLink[]) {
    const sources: { [source: string]: Set<string> } = {};

    links.forEach((l) => {
      if (!sources[l.source]) {
        sources[l.source] = new Set();
      }
      sources[l.source].add(l.target);
    });

    const uniqueLinks: GraphLink[] = [];

    Object.keys(sources).forEach((source) => {
      sources[source].forEach((target) => {
        uniqueLinks.push({ source, target });
      });
    });

    return uniqueLinks;
  }

  private getAllOwnersOfGroup(group: GraphNode[]) {
    const allOwners = group.map((node) => node.data.allOwners).flat();
    const ownersById: { [id: number]: WebsiteRecordShort } = {};

    allOwners.forEach((owner) => {
      ownersById[owner.id] = owner;
    });

    return [...Object.values(ownersById)];
  }

  private getCrawlStatusOfGroup(group: GraphNode[]) {
    return group.reduce((currentStatus, node) => {
      if (
        node.data.crawlStatus === ExecutionNodeStatus.CRAWLED ||
        currentStatus === ExecutionNodeStatus.CRAWLED
      )
        return ExecutionNodeStatus.CRAWLED;

      if (node.data.crawlStatus === ExecutionNodeStatus.FAILED)
        return ExecutionNodeStatus.FAILED;

      return currentStatus;
    }, ExecutionNodeStatus.NOT_CRAWLED);
  }
}
