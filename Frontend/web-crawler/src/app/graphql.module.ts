import { APOLLO_OPTIONS, ApolloModule } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { Kind, OperationTypeNode } from 'graphql';
import { createClient } from 'graphql-ws';
import {
  InMemoryCache,
  split,
  type ApolloClientOptions,
} from '@apollo/client/core';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { NgModule } from '@angular/core';
import { environment } from 'src/environment';

@NgModule({
  exports: [ApolloModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory(httpLink: HttpLink): ApolloClientOptions<unknown> {
        const http = httpLink.create({
          uri: environment.apiUri,
        });

        const ws = new GraphQLWsLink(
          createClient({
            url: `ws://${window.location.host}${environment.websocketUri}`,
          })
        );

        const link = split(
          ({ query }) => {
            const definition = getMainDefinition(query);
            return (
              definition.kind === Kind.OPERATION_DEFINITION &&
              definition.operation === OperationTypeNode.SUBSCRIPTION
            );
          },
          ws,
          http
        );

        return {
          link,
          cache: new InMemoryCache(),
        };
      },
      deps: [HttpLink],
    },
  ],
})
export class GraphQLModule {}
