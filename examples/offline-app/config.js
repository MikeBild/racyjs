import { withClientState } from 'apollo-link-state';
import { onError } from 'apollo-link-error';
import { ApolloLink } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { makeExecutableSchema } from 'graphql-tools';
import typeDefs from './schema.graphql';
import resolvers from './schema.js';
import EventEmitter from 'events';

const eventemitter = new EventEmitter();

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const createLink = async ({ isServer, graphqlUrl, cache }) => {
  if (!isServer) {
    window.addEventListener('online', () => {
      const data = {
        network: { status: 'online', __typename: 'NetworkState' },
      };
      cache.writeData({ data });
      eventemitter.emit('online');
    });
    window.addEventListener('offline', () => {
      const data = {
        network: { status: 'offline', __typename: 'NetworkState' },
      };
      cache.writeData({ data });
      eventemitter.emit('offline');
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
        status: !isServer && navigator.onLine ? 'online' : 'offline',
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
  eventemitter,
};
