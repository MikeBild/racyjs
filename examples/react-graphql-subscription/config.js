import { split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';

export default {
  port: process.env.PORT || 8080,
  createLink,
};

function createLink({ url, isServer }) {
  const httpLink = new HttpLink({
    uri: `http://localhost:8080/graphql`,
  });

  const wsLink = isServer
    ? null
    : new WebSocketLink({
        uri: `ws://localhost:8080/graphql`,
        options: {
          reconnect: true,
        },
      });

  return isServer
    ? httpLink
    : split(
        ({ query }) => {
          const { kind, operation } = getMainDefinition(query);
          return kind === 'OperationDefinition' && operation === 'subscription';
        },
        wsLink,
        httpLink,
      );
}
