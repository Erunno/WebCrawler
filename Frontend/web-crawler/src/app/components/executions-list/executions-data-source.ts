import { DataSource } from '@angular/cdk/collections';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { ExecutionRecord } from 'src/app/models/execution-record';
import { MessageType } from 'src/app/models/message';
import {
  ExecutionRecordsFiltering,
  PagingInfo,
} from 'src/app/models/paging-sorting-filtering';
import { ExecutionRecordsService } from 'src/app/services/execution-records.service';
import { MessagesService } from 'src/app/services/messages.service';

@Injectable({
  providedIn: 'root',
})
export class ExecutionRecordsDataSource implements DataSource<ExecutionRecord> {
  private records = new BehaviorSubject<ExecutionRecord[]>([]);
  public loading = false;

  constructor(
    private recordsService: ExecutionRecordsService,
    private messagesService: MessagesService
  ) {}

  public connect(): Observable<ExecutionRecord[]> {
    this.records = new BehaviorSubject<ExecutionRecord[]>([]);
    return this.records.asObservable();
  }

  public disconnect(): void {
    this.records.complete();
  }

  public fetchData(
    paging: PagingInfo,
    filtering: ExecutionRecordsFiltering
  ): Observable<number> {
    this.loading = true;
    this.records.next([]);

    return this.recordsService.getRecords(paging, filtering).pipe(
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
      map((data) => data.totalCount)
    );
  }
}
