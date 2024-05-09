import { Injectable } from '@angular/core';
import { ApiNode } from '../models/node-api';
import { GraphLink, GraphNode } from '../models/graph';

@Injectable({
  providedIn: 'root',
})
export class NodesTransformerService {
  public getD3Graph(apiNodes: ApiNode[]) {
    const nodesRaw: GraphNode[] = apiNodes.map((n) => ({
      id: n.id,
      url: n.url,
      label: n.title,
    }));

    const nodesDict: { [url: string]: GraphNode } = Object.assign(
      {},
      ...nodesRaw.map((x) => ({ [x.id]: x }))
    );
    const nodes = [...Object.values(nodesDict)];

    const links: GraphLink[] = apiNodes
      .map((n) => n.links.map((l) => ({ source: n.id, target: l.nodeId })))
      .flat();

    return {
      nodes,
      links,
    };
  }
}
