import { withClientState } from 'apollo-link-state';
import { onError } from 'apollo-link-error';
import { ApolloLink } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { SchemaLink } from 'apollo-link-schema';
import { makeExecutableSchema } from 'graphql-tools';
import typeDefs from './schema.graphql';
import resolvers from './schema.js';
import todosConnector from './todos-connector';

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const createLink = async ({ graphqlUrl, todosUrl, cache }) => {
  const stateLink = withClientState({
    cache,
    resolvers: {
      Mutation: {
        filterTasks(_, { visibility }, { cache }) {
          const data = { visibility, __typename: 'FilterTasks' };
          cache.writeData({ data });
          return data;
        },
        errorMessagesReset(_, __, { cache }) {
          const data = { errorMessages: '', __typename: 'ErrorMessages' };
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
    new SchemaLink({
      schema,
      context: { todos: todosConnector({ todosUrl }) },
    }),
    // new HttpLink({
    //   uri: graphqlUrl || `${url}/graphql`,
    // }),
  ]);
};

export default {
  port: process.env.PORT || 8080,
  todosUrl: process.env.TODOSURL || 'http://34.247.50.10/todos',
  createLink,
  // graphqlUrl: process.env.GRAPHQLURL,
  // shouldPrefetch: false,
};
