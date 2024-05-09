import { Injectable } from '@angular/core';
import { Apollo, MutationResult } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable, map } from 'rxjs';
import {
  ExecutionRecordsFiltering,
  PagingInfo,
  SortingInfo,
} from '../models/paging-sorting-filtering';
import moment from 'moment';
import { WebSiteExecutionStatus } from '../models/execution-status';
import { ExecutionRecord } from '../models/execution-record';
import { ApiNode, ExecutionNodeStatus } from '../models/node-api';

@Injectable({
  providedIn: 'root',
})
export class ExecutionRecordsService {
  constructor(private apollo: Apollo) {}

  public getRecords(
    paging: PagingInfo,
    filtering: ExecutionRecordsFiltering
  ): Observable<{ result: ExecutionRecord[]; totalCount: number }> {
    return this.apollo
      .query<ExecutionRecordDto>({
        query: gql`
          query GetExecutionsRecords(
            $skip: Int!
            $take: Int!
            $filter: ExecutionRecordFilterInput!
          ) {
            executionRecordsPaged(skip: $skip, take: $take, where: $filter) {
              items {
                identifier
                start
                end
                executionStatus
                sitesCrawled
                siteRecord {
                  label
                  url
                }
              }
              totalCount
            }
          }
        `,
        variables: {
          skip: paging.pageIndex * paging.pageSize,
          take: paging.pageSize,
          filter: this.getFilterObject(filtering),
        },
        fetchPolicy: 'no-cache',
      })
      .pipe(
        map((result) => ({
          result: result.data.executionRecordsPaged.items.map(
            (dto) =>
              ({
                id: dto.identifier,

                label: dto.siteRecord.label,
                url: dto.siteRecord.url,

                nodesCrawled: dto.sitesCrawled,

                start: moment(dto.start),
                end: dto.end ? moment(dto.end) : null,

                executionStatus: dto.executionStatus,
              } as ExecutionRecord)
          ),
          totalCount: result.data.executionRecordsPaged.totalCount,
        }))
      );
  }

  private getFilterObject(filtering: ExecutionRecordsFiltering) {
    return {
      and: [
        filtering.label
          ? { siteRecord: { label: { eq: filtering.label } } }
          : null,
        filtering.url
          ? { siteRecord: { url: { contains: filtering.url } } }
          : null,
      ].filter((x) => x),
    };
  }

  public getExecutionNodes(
    executionId: number
  ): Observable<ApiNode[] | undefined> {
    return this.apollo
      .subscribe<ExecutionNodeDto>({
        query: gql`
          subscription NodeSub($executionId: Int!) {
            onNodesOfExecutionUpdated(executionRecord: $executionId) {
              identifier
              title
              url
              status
              crawlTime
              links {
                identifier
              }
              owner {
                identifier
                label
                url
              }
            }
          }
        `,
        variables: {
          executionId,
        },
        fetchPolicy: 'no-cache',
      })
      .pipe(
        map((result) =>
          result?.data?.onNodesOfExecutionUpdated.map(
            (dto) =>
              ({
                id: dto.identifier,
                url: dto.url,
                ownerWebsite: {
                  id: dto.owner.identifier,
                  label: dto.owner.label,
                  url: dto.owner.url,
                },
                status: dto.status,
                crawlTime: dto.crawlTime ? moment(dto.crawlTime) : null,
                title: dto.title,
                links: dto.links.map((l) => ({ nodeId: l.identifier })),
              } as ApiNode)
          )
        )
      );
  }
}

interface ExecutionRecordDto {
  executionRecordsPaged: {
    items: {
      identifier: number;
      siteRecord: {
        label: string;
        url: string;
      };
      start: string;
      sitesCrawled: number;
      end?: string;
      executionStatus: WebSiteExecutionStatus;
    }[];
    totalCount: number;
  };
}

interface ExecutionNodeDto {
  onNodesOfExecutionUpdated: {
    identifier: number;
    title: string;
    url: string;
    crawlTime?: string;
    status: ExecutionNodeStatus;
    links: {
      identifier: number;
    }[];
    owner: {
      identifier: number;
      label: string;
      url: string;
    };
  }[];
}
