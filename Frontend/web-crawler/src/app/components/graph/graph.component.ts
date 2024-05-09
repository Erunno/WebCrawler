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
import { DragType, initDrag } from './d3Helpers/drag';
import { initZoom } from './d3Helpers/zoom';
import { defineArrowMarker } from './d3Helpers/arrow-symbol';
import {
  LinkD3,
  NodeD3,
  adjustPositionsFunction,
} from './d3Helpers/nodes-position';
import {
  initPositionOfUninitializedNodes,
  mergeNodes,
} from './d3Helpers/node-merging';

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
  drag!: DragType;

  public simulation: d3.Simulation<NodeD3, undefined> | undefined;

  usedNodes: NodeD3[] = [];
  usedLinks: LinkD3[] = [];

  private params = {
    nodeRadius: 30,
    enterDuration: 500,
    linkLength: 500,
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

    this.drag = initDrag(this);
    initZoom(this.svgD3);
    defineArrowMarker(this.svgD3);
  }

  public ngOnChanges(): void {
    if (!this.svgElementRef) return;

    this.updateUsedNodesAndLinks();
    this.updateGraph();
  }

  private updateUsedNodesAndLinks() {
    const old = { nodes: this.usedNodes, links: this.usedLinks };
    const incoming = { nodes: this.nodes, links: this.links };

    const merged = mergeNodes(old, incoming);
    const updated = initPositionOfUninitializedNodes(merged);

    this.usedNodes = updated.nodes;
    this.usedLinks = updated.links;
  }

  private updateGraph() {
    this.refreshSimulation();

    const { nodes, links } = this.selectD3LinksAndNodes();

    this.setUpNewNodes(nodes, links);
    this.removeOldNodes(nodes, links);

    this.reStyleNodes();
  }

  private refreshSimulation() {
    const box = this.svgElementRef.nativeElement.getBoundingClientRect();

    if (this.simulation) {
      this.simulation.stop();
    }

    this.simulation = d3
      .forceSimulation(this.usedNodes)
      .force('charge', d3.forceManyBody())
      .force(
        'collide',
        d3.forceCollide((d) => this.params.nodeRadius)
      )
      .force(
        'link',
        d3
          .forceLink(this.usedLinks)
          .id((n: unknown) => (n as GraphNode).id)
          .distance(this.params.linkLength)
      )
      .force('center', d3.forceCenter(box.width / 2, box.height / 2))
      .on('tick', adjustPositionsFunction(this.svgD3))
      .alpha(1)
      .alphaDecay(0.0001)
      .restart();
  }

  private setUpNewNodes(nodeSelection: nodesD3, linksSelection: linksD3) {
    nodeSelection
      .enter()
      .append('circle')
      .call(this.drag)
      .on('dblclick', () => {
        console.log('double');
      })
      .on('mouseenter', (e, d) => {
        const location = this.usedNodes.findIndex((n) => n.id === d.id);
        const tmp = this.usedNodes[location];
        this.usedNodes[location] = this.usedNodes[this.usedNodes.length - 1];
        this.usedNodes[this.usedNodes.length - 1] = tmp;
        this.updateGraph();
      });

    linksSelection
      .enter()
      .append('line')
      .style('stroke', '#ccc')
      .style('stroke-width', 1)
      .attr('marker-end', 'url(#triangle)');
  }

  private removeOldNodes(nodes: nodesD3, links: linksD3) {
    nodes.exit().remove();
    links.exit().remove();
  }

  private selectD3LinksAndNodes() {
    const links = this.linksD3
      .selectAll('line')
      .data(this.usedLinks) as unknown as linksD3;
    const nodes = this.nodesD3
      .selectAll('circle')
      .data(this.usedNodes) as unknown as nodesD3;

    return { links, nodes };
  }

  private reStyleNodes() {
    this.nodesD3
      .selectAll('circle')
      .style('fill', (d, i) => '#FFD740')
      .style('stroke', (d, i) => '#673AB7')
      .style('stroke-width', (d, i) => '3')
      .transition()
      .duration(this.params.enterDuration)
      .attr('r', this.params.nodeRadius);
  }
}
