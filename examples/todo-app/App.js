import React from 'react';
import Todos from './components/Todos';
import { withClientState } from 'apollo-link-state';
import { onError } from 'apollo-link-error';
import { ApolloLink } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { SchemaLink } from 'apollo-link-schema';
import { makeExecutableSchema } from 'graphql-tools';
import typeDefs from './schema.graphql';
import resolvers from './schema.js';
import todosConnector from './todos-connector';

export default () => <Todos />;

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export const link = async ({ config, cache }) => {
  const stateLink = withClientState({
    cache,
    resolvers: {
      Mutation: {
        filterTasks(_, { visibility }, { cache }) {
          const data = { visibility, __typename: 'FilterTasks' };
          cache.writeData({ data });
          return data;
        },
      },
    },
    defaults: {
      visibility: 'ALL',
      errorMessages: '',
    },
  });

  const errorLink = onError(({ graphQLErrors = [], networkError = '' }) => {
    const errorMessages = graphQLErrors.reduce(
      (s, e) => (s += `${e.message}\n`),
      networkError,
    );

    cache.writeData({
      data: {
        errorMessages,
        __typename: `ErrorMessages`,
      },
    });
  });

  return ApolloLink.from([
    errorLink,
    stateLink,
    // new SchemaLink({
    //   schema,
    //   context: { todos: todosConnector({ config }), config },
    // }),
    new HttpLink({
      uri: config.graphqlUrl || `${config.url}/graphql`,
    }),
  ]);
};
