import { GraphLink, GraphNode } from 'src/app/models/graph';
import { LinkD3, NodeD3 } from './nodes-position';

export function mergeNodes(old: D3Graph, incoming: D3Graph) {
  const newNodes = incoming.nodes.filter((n) => !isInNodes(n, old.nodes));
  const newLinks = incoming.links.filter((l) => !isInLinks(l, old.links));

  const removedNodes = old.nodes.filter((n) => !isInNodes(n, incoming.nodes));
  const removedLinks = old.links.filter((l) => !isInLinks(l, incoming.links));

  const nodes = [
    ...old.nodes.filter((n) => !isInNodes(n, removedNodes)),
    ...newNodes.map((n) => ({ ...n })),
  ];

  const links = [
    ...old.links.filter((l) => !isInLinks(l, removedLinks)),
    ...newLinks.map((l) => ({ ...l })),
  ];

  nodes.forEach((n) => {
    const incomingNode = incoming.nodes.find((incNode) => incNode.id === n.id);
    n.style = incomingNode?.style ?? n.style;
    n.data = incomingNode?.data ?? n.data;
  });

  return { nodes, links };
}

export function initPositionOfUninitializedNodes(graph: D3Graph) {
  const { links, nodes } = graph;

  const initializedNodes = nodes.filter((n) => n.x && n.y);

  const link = (n1: GraphNode, n2: GraphNode) =>
    ({ source: n1.id, target: n2.id }) as GraphLink;

  const areLinked = (n1: GraphNode, n2: GraphNode) =>
    isInLinks(link(n1, n2), links) || isInLinks(link(n2, n1), links);

  nodes
    .filter((n) => !n.x || !n.y)
    .forEach((node) => {
      const neighbors = initializedNodes.filter((nei) => areLinked(node, nei));
      const { x, y } = neighbors.reduce(
        (acc, nei) => ({ x: (nei.x ?? 0) + acc.x, y: (nei.y ?? 0) + acc.y }),
        { x: 0, y: 0 },
      );

      node.x = x / neighbors.length;
      node.y = y / neighbors.length;
    });

  return { links, nodes };
}

function isInNodes(node: GraphNode, nodes: GraphNode[]) {
  return nodes.some((n) => n.id === node.id);
}

function isInLinks(link: GraphLink, links: GraphLink[]) {
  return links.some(
    (l) => l.source === link.source && l.target === link.target,
  );
}

export type D3Graph = {
  nodes: NodeD3[];
  links: LinkD3[];
};
