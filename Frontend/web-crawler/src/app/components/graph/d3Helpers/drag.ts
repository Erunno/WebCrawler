import * as d3 from 'd3';
import { GraphComponent } from '../graph.component';
import { NodeD3 } from './nodes-position';

export function initDrag(component: GraphComponent) {
  const dragStarted = (event: DragEvent) => {
    if (!event.active) component.simulation?.alphaTarget(0.3).restart();
  };

  const dragged = (event: DragEvent) => {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  };

  const dragEnded = (event: DragEvent) => {
    event.subject.fx = null;
    event.subject.fy = null;
  };

  return d3
    .drag()
    .on('start', dragStarted)
    .on('drag', dragged)
    .on('end', dragEnded) as unknown as DragType;
}

type Point = { x: number | null; y: number | null };
type PointFixed = { fx: number | null; fy: number | null };
type DragEvent = { subject: PointFixed } & Point & { active: boolean };

export type DragType = (
  selection: d3.Selection<SVGCircleElement, NodeD3, null, undefined>
) => void;
