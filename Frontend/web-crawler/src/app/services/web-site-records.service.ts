import { Injectable } from '@angular/core';
import { Apollo, MutationResult } from 'apollo-angular';
import gql from 'graphql-tag';
import {
  WebSiteExecutionStatus,
  WebSiteRecord,
} from '../models/web-site-record';
import { Observable, map } from 'rxjs';
import {
  PagingInfo,
  SortingInfo,
  WebSiteFilteringInfo,
} from '../models/paging-sorting-filtering';
import moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class WebSiteRecordsService {
  TAG_SEPARATOR = ',';

  constructor(private apollo: Apollo) {}

  public addWebSiteRecord(newSite: WebSiteRecord): Observable<MutationResult> {
    return this.apollo.mutate({
      mutation: gql`
        mutation AddSiteRecord($input: NewWebSiteDtoInput!) {
          addSiteRecord(input: $input) {
            identifier
          }
        }
      `,
      variables: {
        input: newSite,
      },
    });
  }

  public getTotalNumberOfRecords(): Observable<number> {
    throw new Error();
  }

  public getRecords(
    paging: PagingInfo,
    sorting: SortingInfo<WebSiteRecord>,
    filtering: WebSiteFilteringInfo
  ): Observable<{ result: WebSiteRecord[]; totalCount: number }> {
    return this.apollo
      .query<WebRecordDto>({
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
                lastTimeCrawled
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
      })
      .pipe(
        map((result) => ({
          result: result.data.websitesPagedSorted.items.map((dto) => ({
            id: dto.identifier,
            label: dto.label,
            periodicityMinutes: dto.periodicityMinutes,
            url: dto.url,
            boundaryRegExp: dto.regexp,
            tags: dto.tags ?? [],
            isActive: dto.active,
            lastExecution: dto.lastTimeCrawled
              ? moment(dto.lastTimeCrawled)
              : null,
            executionStatus: WebSiteExecutionStatus.SUCCESS,
          })),
          totalCount: result.data.websitesPagedSorted.totalCount,
        }))
      );
  }

  private getFilterObject(filtering: WebSiteFilteringInfo) {
    return {
      and: [
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
}

interface WebRecordDto {
  websitesPagedSorted: {
    items: {
      identifier: number;
      label: string;
      url: string;
      regexp: string;
      periodicityMinutes: number;
      tags: string[] | null;
      active: boolean;
      lastTimeCrawled: string;
    }[];
    totalCount: number;
  };
}
