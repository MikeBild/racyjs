import { withClientState } from 'apollo-link-state';
import { onError } from 'apollo-link-error';
import { ApolloLink } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { makeExecutableSchema } from 'graphql-tools';
import typeDefs from './schema.graphql';
import resolvers from './schema.js';

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const createLink = async ({ isServer, graphqlUrl, cache }) => {
  if (!isServer) {
    window.addEventListener('online', () => {
      console.log('Online');
      const data = {
        network: { status: 'online', __typename: 'NetworkState' },
      };
      cache.writeData({ data });
    });
    window.addEventListener('offline', () => {
      console.log('Offline');
      const data = {
        network: { status: 'offline', __typename: 'NetworkState' },
      };
      cache.writeData({ data });
    });
  }

  const stateLink = withClientState({
    cache,
    resolvers: {
      Mutation: {
        sync(_, __, { cache }) {
          const data = { errorMessages: '', __typename: 'ErrorMessages' };
          cache.writeData({ data });
          return data;
        },
      },
    },
    defaults: {
      network: {
        status: 'pending', //!isServer && navigator.onLine ? 'online' : 'offline',
        __typename: 'NetworkState',
      },
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
    // errorLink,
    stateLink,
    new HttpLink({
      uri: graphqlUrl,
    }),
  ]);
};

export default {
  port: process.env.PORT || 9090,
  graphqlUrl: 'http://localhost:9090/graphql',
  createLink,
};
