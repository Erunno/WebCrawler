import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ExecutionRecordsDataSource } from './executions-data-source';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { ExecutionRecord } from 'src/app/models/execution-record';
import { statusToMessage } from 'src/app/models/execution-status';
import {
  ExecutionRecordsFiltering,
  PagingInfo,
} from 'src/app/models/paging-sorting-filtering';

@Component({
  selector: 'app-executions-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatCheckboxModule,
    MatChipsModule,
    MatIconModule,
    MatFormFieldModule,
    MatButtonModule,
  ],
  templateUrl: './executions-table.component.html',
  styleUrls: ['./executions-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExecutionsTableComponent implements OnChanges {
  public readonly statusToMessage = statusToMessage;
  public pagingOptions = [10, 30, 50];

  public innerPaging!: PagingInfo;

  @Input({ required: true }) public paging!: PagingInfo;
  @Input({ required: true }) public filtering!: ExecutionRecordsFiltering;

  @Output() pagingChanged = new EventEmitter<PagingInfo>();

  displayedColumns: (keyof ExecutionRecord)[] = [
    'label',
    'url',
    'start',
    'end',
    'nodesCrawled',
    'executionStatus',
  ];

  constructor(public dataSource: ExecutionRecordsDataSource) {}

  public pagingChangedInner(pageState: PageEvent) {
    const newPaging = {
      ...this.innerPaging,
      pageIndex: pageState.pageIndex,
      pageSize: pageState.pageSize,
    };

    this.pagingChanged.emit(newPaging);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['paging'] || changes['filtering']) {
      this.fetchData();
    }
  }

  public fetchData() {
    this.dataSource
      .fetchData(this.paging, this.filtering)
      .subscribe((totalCount) => {
        this.innerPaging = {
          ...this.innerPaging,
          totalElements: totalCount,
        };
      });
  }
}
