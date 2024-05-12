import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable, map } from 'rxjs';
import { ApiNode } from '../models/node-api';
import { ExecutionNodeDto, toApiNode } from '../models/execution-node-dto';

@Injectable({
  providedIn: 'root',
})
export class NodesProviderService {
  constructor(private apollo: Apollo) {}

  public getNodes(websites: number[]): Observable<ApiNode[] | undefined> {
    return this.apollo
      .subscribe<ExecutionsNodeReposeDto>({
        query: gql`
          subscription WebsitesNodeSub($webpages: [Int!]!) {
            nodes(webpages: $webpages) {
              identifier
              title
              url
              status
              crawlTime
              links {
                identifier
                url
              }
              owner {
                identifier
                label
                url
                active
              }
            }
          }
        `,
        variables: {
          webpages: websites,
        },
        fetchPolicy: 'no-cache',
      })
      .pipe(map((result) => result?.data?.nodes.map(toApiNode)));
  }
}

interface ExecutionsNodeReposeDto {
  nodes: ExecutionNodeDto[];
}
