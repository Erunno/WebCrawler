import { Injectable } from '@angular/core';
import { Apollo, MutationResult } from 'apollo-angular';
import gql from 'graphql-tag';
import {
  WebSiteRecord,
  WebSiteRecordReference,
} from '../models/web-site-record';
import { Observable, map } from 'rxjs';
import {
  PagingInfo,
  SortDirection,
  SortingInfo,
  WebSiteFilteringInfo,
} from '../models/paging-sorting-filtering';
import moment from 'moment';
import { WebSiteExecutionStatus } from '../models/execution-status';

@Injectable({
  providedIn: 'root',
})
export class WebSiteRecordsService {
  TAG_SEPARATOR = ',';

  constructor(private apollo: Apollo) {}

  public addWebSiteRecord(newSite: WebSiteRecord): Observable<WebSiteRecord> {
    return this.apollo
      .mutate<WebRecordMutationRequestDto>({
        mutation: gql`
          mutation AddSiteRecord($input: NewWebSiteDtoInput!) {
            addSiteRecord(input: $input) {
              identifier
              identifier
              label
              url
              regexp
              periodicityMinutes
              tags
              active
              lastExecution
              lastExecutionStatus
            }
          }
        `,
        variables: {
          input: newSite,
        },
      })
      .pipe(
        map((d) =>
          this.mapDtoToRecord(
            (d.data as unknown as WebRecordMutationRequestDto).addSiteRecord
          )
        )
      );
  }

  public updateWebSiteRecord(
    newSite: WebSiteRecord
  ): Observable<MutationResult> {
    return this.apollo.mutate({
      mutation: gql`
        mutation UpdateSiteRecord($input: UpdateWebSiteDtoInput!) {
          updateSiteRecord(input: $input) {
            identifier
          }
        }
      `,
      variables: {
        input: newSite,
      },
    });
  }

  public getRecord(id: number): Observable<WebSiteRecord> {
    return this.getRecords(
      {
        pageIndex: 0,
        pageSize: 1,
        totalElements: 0,
      },
      { property: 'label', direction: SortDirection.ASCENDING },
      {
        id,
      }
    ).pipe(map((data) => data.result[0]));
  }

  public getTotalNumberOfRecords(): Observable<number> {
    throw new Error();
  }

  public delete(recordId: number) {
    return this.apollo.mutate({
      mutation: gql`
        mutation DeleteSiteRecord($input: WebSiteReferenceDtoInput!) {
          deleteSiteRecord(toDelete: $input)
        }
      `,
      variables: {
        input: { id: +recordId },
      },
    });
  }

  public requestExecution(recordId: number) {
    return this.apollo.mutate({
      mutation: gql`
        mutation ExecuteSiteRecord($input: WebSiteReferenceDtoInput!) {
          requestExecution(toExecute: $input)
        }
      `,
      variables: {
        input: { id: +recordId },
      },
    });
  }

  public getRecords(
    paging: PagingInfo,
    sorting: SortingInfo<WebSiteRecord>,
    filtering: WebSiteFilteringInfo
  ): Observable<{ result: WebSiteRecord[]; totalCount: number }> {
    return this.apollo
      .query<WebRecordListRequestDto>({
        query: gql`
          query GetWebSiteRecords(
            $skip: Int!
            $take: Int!
            $orderBy: [WebSiteRecordSortInput!]
            $filter: WebSiteRecordFilterInput!
          ) {
            websitesPagedSorted(
              skip: $skip
              take: $take
              order: $orderBy
              where: $filter
            ) {
              items {
                identifier
                label
                url
                regexp
                periodicityMinutes
                tags
                active
                lastExecution
                lastExecutionStatus
              }
              totalCount
            }
          }
        `,
        variables: {
          skip: paging.pageIndex * paging.pageSize,
          take: paging.pageSize,
          orderBy: [{ [sorting.property]: sorting.direction }],
          filter: this.getFilterObject(filtering),
        },
        fetchPolicy: 'no-cache',
      })
      .pipe(
        map((result) => ({
          result: result.data.websitesPagedSorted.items.map((dto) =>
            this.mapDtoToRecord(dto)
          ),
          totalCount: result.data.websitesPagedSorted.totalCount,
        }))
      );
  }

  private mapDtoToRecord(dto: WebRecordDto) {
    return {
      id: dto.identifier ? +dto.identifier : dto.identifier,
      label: dto.label,
      periodicityMinutes: dto.periodicityMinutes,
      url: dto.url,
      boundaryRegExp: dto.regexp,
      tags: dto.tags ?? [],
      isActive: dto.active,
      lastExecution: dto.lastExecution ? moment(dto.lastExecution) : null,
      executionStatus:
        dto.lastExecutionStatus ?? WebSiteExecutionStatus.NOT_RUN,
    };
  }

  private getFilterObject(filtering: WebSiteFilteringInfo) {
    return {
      and: [
        filtering.id ? { id: { eq: filtering.id } } : null,
        filtering.label ? { label: { contains: filtering.label } } : null,
        filtering.url ? { url: { contains: filtering.url } } : null,
        filtering.tags && filtering.tags.length !== 0
          ? {
              and: filtering.tags.map((tag) => ({
                tags: { some: { value: { eq: tag } } },
              })),
            }
          : null,
      ].filter((x) => x),
    };
  }

  public getAllWebpagesReferences(): Observable<WebSiteRecordReference[]> {
    return this.apollo
      .query<WebRecordListRequestDto>({
        query: gql`
          query GetWebSiteRecords {
            websitesPagedSorted {
              items {
                identifier
                label
              }
            }
          }
        `,
        fetchPolicy: 'no-cache',
      })
      .pipe(
        map((result) =>
          result.data.websitesPagedSorted.items.map(
            (dto) =>
              ({
                id: +dto.identifier,
                label: dto.label,
              } as WebSiteRecordReference)
          )
        )
      );
  }
}

interface WebRecordListRequestDto {
  websitesPagedSorted: {
    items: WebRecordDto[];
    totalCount: number;
  };
}

interface WebRecordMutationRequestDto {
  addSiteRecord: WebRecordDto;
}

interface WebRecordDto {
  identifier: number;
  label: string;
  url: string;
  regexp: string;
  periodicityMinutes: number;
  tags: string[] | null;
  active: boolean;
  lastExecution: string;
  lastExecutionStatus: WebSiteExecutionStatus;
}
