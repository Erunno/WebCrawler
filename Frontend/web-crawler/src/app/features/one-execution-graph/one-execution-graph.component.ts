import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { GraphComponent } from '../../components/graph/graph.component';
import { GraphLink, GraphNode } from 'src/app/models/graph';
import { ExecutionRecordsService } from 'src/app/services/execution-records.service';
import { Observable, Subscription } from 'rxjs';
import { ApiNode } from 'src/app/models/node-api';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-one-execution-graph',
  standalone: true,
  templateUrl: './one-execution-graph.component.html',
  styleUrls: ['./one-execution-graph.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, GraphComponent],
})
export class OneExecutionGraphComponent implements OnInit, OnDestroy {
  public nodes: GraphNode[] = [];
  public links: GraphLink[] = [];

  private dataSubscription: Subscription | null = null;

  constructor(
    private executionsService: ExecutionRecordsService,
    private route: ActivatedRoute
  ) {}

  public ngOnDestroy(): void {
    this.dataSubscription?.unsubscribe();
  }

  public ngOnInit(): void {
    this.route.queryParams.subscribe((anyQuery) => {
      const query = anyQuery as { executionId: string };
      const executionId = +query.executionId;
      this.loadData(executionId);
    });
  }

  private loadData(executionId: number) {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    this.dataSubscription = this.executionsService
      .getExecutionNodes(executionId)
      .subscribe({
        next: (d) => {
          console.log(d);
        },
        error: (e) => {
          console.log(e);
        },
      });
  }
}
