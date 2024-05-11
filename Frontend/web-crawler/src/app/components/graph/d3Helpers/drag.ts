import * as d3 from 'd3';
import { GraphComponent } from '../graph.component';
import { NodeD3 } from './nodes-position';

export function initDrag(component: GraphComponent) {
  function dragStarted(event: DragEvent) {
    if (!event.active) component.simulation?.alpha(1).restart();

    event.subject.fx = event.subject.x ?? 0;
    event.subject.fy = event.subject.y ?? 0;
  }

  function dragged(event: DragEvent) {
    event.subject.fx = (event.subject.fx ?? 0) + event.dx;
    event.subject.fy = (event.subject.fy ?? 0) + event.dy;
  }

  function dragEnded(event: DragEvent) {
    event.subject.fx = null;
    event.subject.fy = null;
  }

  return d3
    .drag()
    .on('start', dragStarted)
    .on('drag', dragged)
    .on('end', dragEnded) as unknown as DragType;
}

type Point = { x: number; y: number };
type DeltaPoint = { dx: number; dy: number };
type PointFixed = { fx: number | null; fy: number | null };
type DragEvent = { subject: PointFixed & Point } & Point & {
    active: boolean;
  } & DeltaPoint;

export type DragType = (
  selection: d3.Selection<SVGGElement, NodeD3, null, undefined>
) => void;
