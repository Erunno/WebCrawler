import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  ExecutionRecordsFiltering,
  PagingInfo,
} from 'src/app/models/paging-sorting-filtering';
import { ActivatedRoute, Router } from '@angular/router';
import { ExecutionsListQuery } from 'src/app/models/executions-list-query';
import { ExecutionsTableComponent } from '../../components/executions-list/executions-table.component';

@Component({
  selector: 'app-executions-list',
  standalone: true,
  templateUrl: './executions-list.component.html',
  styleUrls: ['./executions-list.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
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
    ExecutionsTableComponent,
  ],
})
export class ExecutionsListComponent implements OnInit {
  public websiteForm: FormGroup;
  public pagingOptions = [10, 30, 50];
  private defaultPaging: PagingInfo = {
    pageIndex: 0,
    pageSize: this.pagingOptions[0],
    totalElements: null,
  };

  public currentPaging: PagingInfo = {
    pageIndex: 0,
    pageSize: this.pagingOptions[0],
    totalElements: null,
  };

  public currentFiltering: ExecutionRecordsFiltering = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.websiteForm = this.createForm();
  }

  createForm() {
    return this.fb.group({
      label: [''],
      url: [''],
      tags: [[]],
    });
  }

  public onFilter() {
    const filtering = {
      label: this.websiteForm.get('label')?.value?.trim() ?? '',
      url: this.websiteForm.get('url')?.value?.trim() ?? '',
    };

    this.navigateTo(this.currentPaging, filtering);
  }

  private navigateTo(paging: PagingInfo, filtering: ExecutionRecordsFiltering) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParamsHandling: 'merge',
      queryParams: {
        page: paging.pageIndex.toString(),
        pageSize: paging.pageSize.toString(),
        label: filtering.label,
        url: filtering.url,
      } as ExecutionsListQuery,
    });
  }

  public ngOnInit() {
    this.route.queryParams.subscribe((anyQuery) => {
      const query = anyQuery as ExecutionsListQuery;

      this.currentPaging = {
        pageIndex: query.page
          ? parseInt(query.page)
          : this.defaultPaging.pageIndex,
        pageSize: query.pageSize
          ? parseInt(query.pageSize)
          : this.defaultPaging.pageSize,
        totalElements: null,
      };

      this.currentFiltering = {
        label: query.label ?? '',
        url: query.url ?? '',
      };

      this.updateFormInputs(this.currentFiltering);
    });
  }

  private updateFormInputs(filtering: ExecutionRecordsFiltering) {
    const keys = ['label', 'url'] as (keyof ExecutionRecordsFiltering)[];
    keys.forEach((k) => {
      const control = this.websiteForm.get(k);
      control?.setValue(filtering[k] ?? '');
    });
  }

  public pagingChanged(pageState: PagingInfo) {
    this.currentPaging = {
      ...this.currentPaging,
      pageIndex: pageState.pageIndex,
      pageSize: pageState.pageSize,
    };
  }
}
