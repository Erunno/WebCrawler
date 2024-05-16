import { DataSource } from '@angular/cdk/collections';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { MessageType } from 'src/app/models/message';
import {
  PagingInfo,
  SortingInfo,
  WebSiteFilteringInfo,
} from 'src/app/models/paging-sorting-filtering';
import { WebSiteRecord } from 'src/app/models/web-site-record';
import { MessagesService } from 'src/app/services/messages.service';
import { WebSiteRecordsService } from 'src/app/services/web-site-records.service';

@Injectable({
  providedIn: 'root',
})
export class WebSiteRecordsDataSource implements DataSource<WebSiteRecord> {
  private records = new BehaviorSubject<WebSiteRecord[]>([]);
  public loading = false;

  constructor(
    private recordsService: WebSiteRecordsService,
    private messagesService: MessagesService,
  ) {}

  public connect(): Observable<WebSiteRecord[]> {
    this.records = new BehaviorSubject<WebSiteRecord[]>([]);
    return this.records.asObservable();
  }

  public disconnect(): void {
    this.records.complete();
  }

  public fetchData(
    paging: PagingInfo,
    sorting: SortingInfo<WebSiteRecord>,
    filtering: WebSiteFilteringInfo,
  ): Observable<number> {
    this.loading = true;
    this.records.next([]);

    return this.recordsService.getRecords(paging, sorting, filtering).pipe(
      tap({
        next: (data) => {
          this.records.next(data.result);
          this.loading = false;
        },
        error: (err) => {
          this.messagesService.addMessage({
            type: MessageType.ERROR,
            message: `Unexpected error occurred: ${err}`,
          });
          this.loading = false;
        },
      }),
      map((data) => data.totalCount),
    );
  }
}
