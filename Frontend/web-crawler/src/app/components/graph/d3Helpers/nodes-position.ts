import { GraphLink, GraphNode } from 'src/app/models/graph';
import { SimulationLink, getArrowPosition } from './arrow-symbol';

export function adjustPositionsFunction(
  svg: d3.Selection<SVGElement, unknown, null, undefined>
) {
  return () => {
    svg
      .select('g.nodes')
      .selectAll('g.node')
      .attr('transform', function (d) {
        const x = (d as NodeD3).x;
        const y = (d as NodeD3).y;

        return 'translate(' + [x, y] + ')';
      });
    //   .attr('cx', (d) => (d as NodeD3).x ?? 0)
    //   .attr('cy', (d) => (d as NodeD3).y ?? 0);

    svg
      .select('g.links')
      .selectAll('line')
      .attr('x1', (d) => (d as SimulationLink).source.x ?? 0)
      .attr('y1', (d) => (d as SimulationLink).source.y ?? 0)
      .attr('x2', (d) => getArrowPosition(d as SimulationLink).x)
      .attr('y2', (d) => getArrowPosition(d as SimulationLink).y);
  };
}

export type NodeD3 = GraphNode & d3.SimulationNodeDatum;
export type LinkD3 = GraphLink & d3.SimulationLinkDatum<NodeD3>;
