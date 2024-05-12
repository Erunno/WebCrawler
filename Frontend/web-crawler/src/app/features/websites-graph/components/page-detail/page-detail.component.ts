import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faComputerMouse, faSpider } from '@fortawesome/free-solid-svg-icons';
import { GraphNode } from 'src/app/models/graph';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { WebsiteRecordInDetailComponent } from '../website-record-in-detail/website-record-in-detail.component';
import { LoadingBarService } from 'src/app/services/loading-bar.service';
import { WebSiteRecordsService } from 'src/app/services/web-site-records.service';

@Component({
  selector: 'app-page-detail',
  standalone: true,
  templateUrl: './page-detail.component.html',
  styleUrls: ['./page-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FontAwesomeModule,
    MatButtonModule,
    MatCardModule,
    WebsiteRecordInDetailComponent,
  ],
})
export class PageDetailComponent implements OnChanges {
  faMouse = faComputerMouse;
  faSpider = faSpider;

  @Input() node: GraphNode | undefined;
  @Input() allNodes: GraphNode[] | undefined;

  displayedNode: GraphNode | undefined;

  constructor(
    private loadingService: LoadingBarService,
    private websiteService: WebSiteRecordsService
  ) {}

  public ngOnChanges(): void {
    if (this.allNodes?.some((n) => this.node?.id === n.id)) {
      this.displayedNode = this.node;
    } else {
      this.displayedNode = undefined;
    }

    console.log(this.displayedNode);
  }

  public requestExecution(websiteId: number) {
    const request = this.websiteService.requestExecution(websiteId);

    this.loadingService.waitFor(request);
  }
}
