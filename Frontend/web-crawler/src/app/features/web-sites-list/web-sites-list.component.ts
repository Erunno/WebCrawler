import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { ViewChild } from '@angular/core';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import {
  PagingInfo,
  SortDirection,
  SortingInfo,
  WebSiteFilteringInfo,
  toSortDirection,
} from 'src/app/models/paging-sorting-filtering';
import { WebSiteRecordsDataSource } from './records-data-source';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { WebSiteRecord } from 'src/app/models/web-site-record';
import { WebSiteRecordsService } from 'src/app/services/web-site-records.service';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { WebSiteListQuery } from 'src/app/models/web-site-list-query';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { pushToTheEndOfEventQueue } from 'src/app/utils/push-to-end-of-event-queue';
import { MessagesService } from 'src/app/services/messages.service';
import { statusToMessage } from 'src/app/models/execution-status';
import {
  faGears,
  faPenToSquare,
  faSpider,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ConfirmWebsiteDeleteComponent } from './components/confirm-website-delete/confirm-website-delete.component';
import { LoadingBarService } from 'src/app/services/loading-bar.service';
import { MessageType } from 'src/app/models/message';

@Component({
  selector: 'app-web-sites-list',
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
    FontAwesomeModule,
    RouterModule,
    MatDialogModule,
  ],
  templateUrl: './web-sites-list.component.html',
  styleUrls: ['./web-sites-list.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class WebSitesListComponent implements OnInit {
  websiteForm: FormGroup;
  public pagingOptions = [10, 30, 50];
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  public readonly statusToMessage = statusToMessage;
  public faSpider = faSpider;
  public faEdit = faPenToSquare;
  public faGears = faGears;
  public faDelete = faTrash;

  private defaultPaging: PagingInfo = {
    pageIndex: 0,
    pageSize: this.pagingOptions[0],
    totalElements: null,
  };

  private defaultSorting: SortingInfo<WebSiteRecord> = {
    direction: SortDirection.ASCENDING,
    property: 'label',
  };

  public currentPaging: PagingInfo = {
    pageIndex: 0,
    pageSize: this.pagingOptions[0],
    totalElements: null,
  };

  public currentSorting: SortingInfo<WebSiteRecord> = {
    direction: SortDirection.ASCENDING,
    property: 'label',
  };

  public currentFiltering: WebSiteFilteringInfo = {};

  displayedColumns: (keyof WebSiteRecord | 'actions')[] = [
    'isActive',
    'label',
    'url',
    'periodicityMinutes',
    'tags',
    'lastExecution',
    'executionStatus',
    'actions',
  ];

  constructor(
    public dataSource: WebSiteRecordsDataSource,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private webSiteRecordsService: WebSiteRecordsService,
    private loadingService: LoadingBarService,
    private messagesService: MessagesService,
    private cdr: ChangeDetectorRef,
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

  public ngOnInit() {
    this.route.queryParams.subscribe((anyQuery) => {
      const query = anyQuery as WebSiteListQuery;

      this.currentPaging = {
        pageIndex: query.page
          ? parseInt(query.page)
          : this.defaultPaging.pageIndex,
        pageSize: query.pageSize
          ? parseInt(query.pageSize)
          : this.defaultPaging.pageSize,
        totalElements: null,
      };

      this.currentSorting = {
        property: query.sort ?? this.defaultSorting.property,
        direction: query.sortDirection ?? this.defaultSorting.direction,
      };

      this.currentFiltering = {
        label: query.label ?? '',
        tags: query.tags?.split(',').filter((x) => x.trim()) ?? [],
        url: query.url ?? '',
      };
      this.updateFormInputs(this.currentFiltering);

      this.refreshTable();
    });
  }

  private refreshTable() {
    this.dataSource
      .fetchData(this.currentPaging, this.currentSorting, this.currentFiltering)
      .subscribe((totalCount) => {
        this.currentPaging = {
          ...this.currentPaging,
          totalElements: totalCount,
        };
        this.cdr.detectChanges();
      });
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  public sortChanged(sortState: Sort) {
    this.currentSorting = {
      direction: toSortDirection(sortState.direction),
      property: sortState.active as keyof WebSiteRecord,
    };

    this.navigateTo(
      this.currentPaging,
      this.currentSorting,
      this.currentFiltering,
    );
  }

  public pagingChanged(pageState: PageEvent) {
    this.currentPaging = {
      ...this.currentPaging,
      pageIndex: pageState.pageIndex,
      pageSize: pageState.pageSize,
    };

    this.navigateTo(
      this.currentPaging,
      this.currentSorting,
      this.currentFiltering,
    );
  }

  public onFilter() {
    this.currentFiltering = {
      label: this.websiteForm.get('label')?.value?.trim() ?? '',
      url: this.websiteForm.get('url')?.value?.trim() ?? '',
      tags: this.websiteForm.get('tags')?.value ?? [],
    };

    this.navigateTo(
      this.currentPaging,
      this.currentSorting,
      this.currentFiltering,
    );
  }

  private navigateTo(
    paging: PagingInfo,
    sorting: SortingInfo<WebSiteRecord>,
    filtering: WebSiteFilteringInfo,
  ) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParamsHandling: 'merge',
      queryParams: {
        page: paging.pageIndex.toString(),
        pageSize: paging.pageSize.toString(),
        sort: sorting.property,
        sortDirection: sorting.direction,
        label: filtering.label,
        tags: filtering.tags?.join(','),
        url: filtering.url,
      } as WebSiteListQuery,
    });
  }

  public deleteWebsiteRecord(website: WebSiteRecord) {
    const dialog = this.dialog.open(ConfirmWebsiteDeleteComponent, {
      width: '20rem',
      height: 'fit-content',
      data: website,
    });

    dialog.afterClosed().subscribe((result: { deleteConfirmed: boolean }) => {
      if (result?.deleteConfirmed) {
        const result = this.webSiteRecordsService.delete(website.id ?? -1);

        this.loadingService.waitFor(
          result,
          () => {
            this.messagesService.addSuccess(
              'Successfully removed web site record',
            );
            this.refreshTable();
          },
          (err) => {
            this.messagesService.addMessage({
              type: MessageType.ERROR,
              message: `An error occurred: ${err}`,
            });
          },
        );
      }
    });
  }

  public requestExecution(website: WebSiteRecord) {
    const result = this.webSiteRecordsService.requestExecution(
      website.id ?? -1,
    );

    this.loadingService.waitFor(
      result,
      () => {
        this.messagesService.addSuccess(
          'Successfully requested execution of the web site record',
        );
        this.refreshTable();
      },
      (err) => {
        this.messagesService.addMessage({
          type: MessageType.ERROR,
          message: `An error occurred: ${err}`,
        });
      },
    );
  }

  public addTag(event: MatChipInputEvent): void {
    const input = event.chipInput.inputElement;
    const newValue = (event.value || '').trim();

    if (newValue) {
      const tagsControl = this.websiteForm.get('tags');
      const currentTags = tagsControl?.value;

      tagsControl?.setValue([...currentTags, newValue]);
    }

    if (input) {
      input.value = '';
    }
  }

  removeTag(index: number) {
    const tagsControl = this.websiteForm.get('tags');
    const currentTags = tagsControl?.value as string[];

    currentTags.splice(index, 1);

    tagsControl?.setValue(currentTags);
  }

  private updateFormInputs(filtering: WebSiteFilteringInfo) {
    const keys = ['label', 'url'] as (keyof WebSiteFilteringInfo)[];
    keys.forEach((k) => {
      const control = this.websiteForm.get(k);
      control?.setValue(filtering[k] ?? '');
    });

    pushToTheEndOfEventQueue(() => {
      const tagsControl = this.websiteForm.get('tags');
      tagsControl?.setValue(filtering.tags ?? []);
    });
  }
}
