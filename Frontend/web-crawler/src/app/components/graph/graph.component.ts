import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  ViewChild,
} from '@angular/core';
import { GraphLink, GraphNode } from 'src/app/models/graph';
import * as d3 from 'd3';

type NodeD3 = GraphNode & d3.SimulationNodeDatum;
type LinkD3 = GraphLink & d3.SimulationLinkDatum<NodeD3>;

type nodesD3 = d3.Selection<SVGGElement, NodeD3, null, undefined>;
type linksD3 = d3.Selection<SVGGElement, LinkD3, null, undefined>;

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphComponent implements AfterViewInit, OnChanges {
  @ViewChild('svgContainer') svgElementRef!: ElementRef<SVGElement>;

  @Input() nodes: GraphNode[] = [];
  @Input() links: GraphLink[] = [];

  svgD3!: d3.Selection<SVGElement, unknown, null, undefined>;

  nodesD3!: nodesD3;
  linksD3!: linksD3;
  drag!: d3.DragBehavior<Element, unknown, unknown>;

  simulation: d3.Simulation<NodeD3, undefined> | undefined;

  usedNodes: NodeD3[] = [];
  usedLinks: LinkD3[] = [];

  private params = {
    nodeRadius: 30,
    enterDuration: 500,
    linkLength: 100,
    linkArrowPushBack: 5,
  };

  public ngAfterViewInit(): void {
    this.initView();
    this.updateGraph();
  }

  private initView() {
    this.svgD3 = d3.select(this.svgElementRef.nativeElement);
    this.linksD3 = this.svgD3.append('g').attr('class', 'links') as linksD3;
    this.nodesD3 = this.svgD3.append('g').attr('class', 'nodes') as nodesD3;

    this.usedNodes = this.nodes.map((n) => ({ ...n }));
    this.usedLinks = this.links.map((l) => ({ ...l }));

    const dragStarted = (event: DragEvent) => {
      if (!event.active) this.simulation?.alphaTarget(0.3).restart();
    };

    const dragged = (event: DragEvent) => {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    };

    const dragEnded = (event: DragEvent) => {
      event.subject.fx = null;
      event.subject.fy = null;
    };

    this.drag = d3
      .drag()
      .on('start', dragStarted)
      .on('drag', dragged)
      .on('end', dragEnded);

    const handleZoom = (e: { transform: number }) => {
      this.svgD3.selectAll('g').attr('transform', e.transform);
    };

    this.svgD3
      .call(d3.zoom().on('zoom', handleZoom) as unknown as CallTypeSvg)
      .on('dblclick.zoom', null);

    this.svgD3
      .append('svg:defs')
      .append('svg:marker')
      .attr('id', 'triangle')
      .attr('refX', 6)
      .attr('refY', 6)
      .attr('markerWidth', 30)
      .attr('markerHeight', 30)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 12 6 0 12 3 6')
      .style('fill', 'black');
  }

  public ngOnChanges(): void {
    if (!this.svgElementRef) return;

    this.updateUsedNodesAndLinks();
    this.updateGraph();
  }

  private updateUsedNodesAndLinks() {
    const newNodes = this.nodes.filter((n) => !isInNodes(n, this.usedNodes));
    const newLinks = this.links.filter((l) => !isInLinks(l, this.usedLinks));

    const removedNodes = this.usedNodes.filter(
      (n) => !isInNodes(n, this.nodes)
    );
    const removedLinks = this.usedLinks.filter(
      (l) => !isInLinks(l, this.links)
    );

    this.usedNodes = [
      ...this.usedNodes.filter((n) => !isInNodes(n, removedNodes)),
      ...newNodes.map((n) => ({ ...n })),
    ];

    this.usedLinks = [
      ...this.usedLinks.filter((l) => !isInLinks(l, removedLinks)),
      ...newLinks.map((l) => ({ ...l })),
    ];

    this.initPositionOfNewNodes();
  }

  private initPositionOfNewNodes() {
    const oldNodes = this.usedNodes.filter((n) => n.x && n.y);

    const link = (n1: GraphNode, n2: GraphNode) =>
      ({ source: n1.id, target: n2.id } as GraphLink);
    const areLinked = (n1: GraphNode, n2: GraphNode) =>
      isInLinks(link(n1, n2), this.usedLinks) ||
      isInLinks(link(n2, n1), this.usedLinks);

    this.usedNodes
      .filter((n) => !n.x || !n.y)
      .forEach((node) => {
        const neighbors = oldNodes.filter((nei) => areLinked(node, nei));
        const { x, y } = neighbors.reduce(
          (acc, nei) => ({ x: (nei.x ?? 0) + acc.x, y: (nei.y ?? 0) + acc.y }),
          { x: 0, y: 0 }
        );

        node.x = x / neighbors.length;
        node.y = y / neighbors.length;
      });
  }

  private updateGraph() {
    const box = this.svgElementRef.nativeElement.getBoundingClientRect();

    let firstRun = false;
    if (this.simulation) {
      this.simulation.stop();
      firstRun = true;
    }

    this.simulation = d3
      .forceSimulation(this.usedNodes)
      .force('charge', d3.forceManyBody())
      .force(
        'link',
        d3
          .forceLink(this.usedLinks)
          .id((n: unknown) => (n as GraphNode).id)
          .distance(this.params.linkLength)
      )
      .force('center', d3.forceCenter(box.width / 2, box.height / 2))
      .on('tick', () => this.simulationTicked())
      .restart();

    if (!firstRun) {
      this.simulation.alpha(0.1);
    }

    const linksSelection = this.linksD3.selectAll('line').data(this.usedLinks);
    const nodeSelection = this.nodesD3.selectAll('circle').data(this.usedNodes);

    nodeSelection
      .enter()
      .append('circle')
      .style('fill', (d, i) => 'red')
      .call(this.drag as unknown as CallTypeCircle)
      .on('dblclick', () => {
        console.log('double');
      })
      .transition()
      .duration(this.params.enterDuration)
      .attr('r', this.params.nodeRadius);

    nodeSelection.exit().remove();

    linksSelection
      .enter()
      .append('line')
      .style('stroke', '#ccc')
      .style('stroke-width', 1)
      .attr('marker-end', 'url(#triangle)');

    linksSelection.exit().remove();
  }

  private simulationTicked() {
    this.nodesD3
      .selectAll('circle')
      .attr('cx', (d) => (d as NodeD3).x ?? 0)
      .attr('cy', (d) => (d as NodeD3).y ?? 0);

    this.linksD3
      .selectAll('line')
      .attr('x1', (d) => (d as SimulationLink).source.x ?? 0)
      .attr('y1', (d) => (d as SimulationLink).source.y ?? 0)
      .attr('x2', (d) => this.getArrowPosition(d as SimulationLink).x)
      .attr('y2', (d) => this.getArrowPosition(d as SimulationLink).y);
  }

  private getArrowPosition(d: SimulationLink) {
    const direction = {
      x: d.target.x - d.source.x,
      y: d.target.y - d.source.y,
    };

    const linkLen = Math.sqrt(
      direction.x * direction.x + direction.y * direction.y
    );

    if (linkLen == 0) return d.target;

    const pushBackVector = {
      x:
        (-direction.x / linkLen) *
        (this.params.nodeRadius + this.params.linkArrowPushBack),
      y:
        (-direction.y / linkLen) *
        (this.params.nodeRadius + this.params.linkArrowPushBack),
    };

    return {
      x: d.source.x + direction.x + pushBackVector.x,
      y: d.source.y + direction.y + pushBackVector.y,
    };
  }
}

function isInNodes(node: GraphNode, nodes: GraphNode[]) {
  return nodes.some((n) => n.id === node.id);
}

function isInLinks(link: GraphLink, links: GraphLink[]) {
  return links.some(
    (l) => l.source === link.source && l.target === link.target
  );
}

type Point = { x: number | null; y: number | null };
type PointNoNull = { x: number; y: number };
type PointFixed = { fx: number | null; fy: number | null };

type SimulationLink = { source: PointNoNull; target: PointNoNull };

type DragEvent = { subject: PointFixed } & Point & { active: boolean };

type CallTypeCircle = (
  selection: d3.Selection<SVGCircleElement, NodeD3, SVGGElement, NodeD3>
) => void;
type CallTypeSvg = (
  selection: d3.Selection<SVGElement, unknown, null, undefined>
) => void;
