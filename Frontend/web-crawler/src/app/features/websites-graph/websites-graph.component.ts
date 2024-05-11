import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { GraphComponent } from '../../components/graph/graph.component';
import { GraphLink, GraphNode, NodeData } from 'src/app/models/graph';
import { WebsitesSelectorComponent } from './components/websites-selector/websites-selector.component';
import { PageDetailComponent } from './components/page-detail/page-detail.component';
import { WebSiteRecordsService } from 'src/app/services/web-site-records.service';
import { WebSiteRecordReference } from 'src/app/models/web-site-record';
import { ActivatedRoute, Router } from '@angular/router';
import { GraphPageQuery } from 'src/app/models/graph-page-query';
import { LoadingBarService } from 'src/app/services/loading-bar.service';
import { NodesProviderService } from 'src/app/services/nodes-provider.service';
import { NodesTransformerService } from 'src/app/services/nodes-transformer.service';

@Component({
  selector: 'app-websites-graph',
  standalone: true,
  templateUrl: './websites-graph.component.html',
  styleUrls: ['./websites-graph.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    GraphComponent,
    WebsitesSelectorComponent,
    PageDetailComponent,
  ],
})
export class WebsitesGraphComponent implements OnInit {
  public nodes: GraphNode[] = [];
  public links: GraphLink[] = [];

  public allWebsites: WebSiteRecordReference[] | undefined;
  public selectedWebsites: WebSiteRecordReference[] = [];

  public selectedNode: GraphNode | undefined;

  public constructor(
    private websitesService: WebSiteRecordsService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private loadingService: LoadingBarService,
    private nodesService: NodesProviderService,
    private nodesTransformerService: NodesTransformerService
  ) {}

  public ngOnInit(): void {
    this.route.queryParams.subscribe((anyQuery) => {
      const query = anyQuery as GraphPageQuery;
      const requestedWebsites = this.readRequestedWebsitesFrom(query);

      this.nodes = [];
      this.links = [];

      this.cdr.detectChanges();

      if (!this.allWebsites) {
        this.loadWebsiteSelections(requestedWebsites);
      } else {
        this.setSelectedFromQuery(requestedWebsites);
      }

      if (requestedWebsites.length != 0) {
        this.loadGraph(requestedWebsites);
      }
    });
  }

  public onNodeChanged(node: GraphNode) {
    this.selectedNode = node;
  }

  public onSelectedWebsitesChanged(newSelected: WebSiteRecordReference[]) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParamsHandling: 'merge',
      queryParams: {
        websites: newSelected.map((w) => `${w.id}`),
      } as GraphPageQuery,
    });
  }

  private loadWebsiteSelections(requestedWebsites: number[]) {
    const websitesSelectionsRequest =
      this.websitesService.getAllWebpagesReferences();

    this.loadingService.waitFor(websitesSelectionsRequest, (data) => {
      this.allWebsites = data.sort((a, b) => (a.label > b.label ? 1 : -1));
      this.setSelectedFromQuery(requestedWebsites);

      this.cdr.detectChanges();
    });
  }

  private setSelectedFromQuery(requestedWebsites: number[]) {
    this.selectedWebsites =
      this.allWebsites?.filter((w) =>
        requestedWebsites.some((wId) => wId === w.id)
      ) ?? [];
  }

  private loadGraph(requestedWebsites: number[]) {
    const graphRequest = this.nodesService.getNodes(requestedWebsites);

    this.loadingService.waitFor(graphRequest, (data) => {
      if (!data) return;

      const graph = this.nodesTransformerService.getD3Graph(data);

      this.nodes = graph.nodes;
      this.links = graph.links;

      this.cdr.detectChanges();
    });
  }

  private readRequestedWebsitesFrom(query: GraphPageQuery) {
    let requestedWebsites: number[] = [];

    if (query.websites) {
      if (typeof query.websites === 'string') {
        requestedWebsites = [+query.websites];
      } else if (Array.isArray(query.websites)) {
        requestedWebsites = query.websites.map((id) => +id);
      }
    }

    return requestedWebsites;
  }
}
