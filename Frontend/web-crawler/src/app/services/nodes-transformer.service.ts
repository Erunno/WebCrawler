import { Injectable } from '@angular/core';
import { ApiNode, ExecutionNodeStatus } from '../models/node-api';
import {
  CrawledNode,
  FailedNode,
  GraphLink,
  GraphNode,
  NotCrawledNode,
} from '../models/graph';
import moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class NodesTransformerService {
  private statusToStyle = {
    [ExecutionNodeStatus.CRAWLED]: CrawledNode,
    [ExecutionNodeStatus.NOT_CRAWLED]: NotCrawledNode,
    [ExecutionNodeStatus.FAILED]: FailedNode,
  };

  public getD3Graph(apiNodes: ApiNode[]) {
    const nodesByUrl = this.getNodesByUrl(apiNodes);
    const newestNodes = this.filterNewestNodes(nodesByUrl);

    const nodes: GraphNode[] = Object.keys(newestNodes).map((url) => {
      const node = newestNodes[url];
      return {
        id: node.id,
        style: this.statusToStyle[node.status],
        data: {
          url: node.url,
          label: this.getLabelFromUrl(node.url),
          allOwners: nodesByUrl[url].map((owner) => ({
            id: owner.id,
            url: owner.url,
          })),
          newestOwner: {
            id: node.id,
            url: node.url,
          },
          links: node.links.map((l) => l.url),
        },
      };
    });

    const links = nodes
      .map((n) =>
        n.data.links.map((l) => ({ source: n.id, target: newestNodes[l].id }))
      )
      .flat();

    return {
      nodes,
      links,
    };

    // const nodesRaw = apiNodes.map((n) => ({
    //   id: n.id,
    //   data: {
    //     url: n.url,
    //     label: this.getLabelFromUrl(n.url),
    //   },
    //   style: this.statusToStyle[n.status],
    // }));

    // const nodesDict: { [url: number]: GraphNode } = Object.assign(
    //   {},
    //   ...nodesRaw.map((x) => ({ [x.id]: x }))
    // );

    // const nodes = [...Object.values(nodesDict)];

    // const links: GraphLink[] = apiNodes
    //   .map((n) => n.links.map((l) => ({ source: n.id, target: l.nodeId })))
    //   .flat();

    // return {
    //   nodes,
    //   links,
    // };
  }

  public getLabelFromUrl(url: string): string {
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
}
