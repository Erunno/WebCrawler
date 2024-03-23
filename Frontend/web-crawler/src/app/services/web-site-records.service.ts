import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { WebSiteRecord } from '../models/web-site-record';

@Injectable({
  providedIn: 'root',
})
export class WebSiteRecordsService {
  constructor(private apollo: Apollo) {}

  addWebSiteRecord(newSite: WebSiteRecord) {
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
}
