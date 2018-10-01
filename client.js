import '@babel/polyfill';
import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import { HelmetProvider } from 'react-helmet-async';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { isServer, isProduction } from './index.js';

const helmetContext = {};

(async () => {
  let config = {};
  try {
    config = require('./config').default;
  } catch (e) {}

  const { default: app, link } = await import('./app');
  const components = app && (await app({ config }));
  const cache = global['DATA']
    ? new InMemoryCache().restore(global['DATA'])
    : new InMemoryCache();
  const apolloLink = link && (await link({ config, cache }));

  if (config.graphqlUrl || apolloLink) {
    const client = new ApolloClient({
      ssrMode: isServer,
      connectToDevTools: !isProduction,
      queryDeduplication: true,
      link:
        apolloLink ||
        new HttpLink({
          uri: config.graphqlUrl || `${config.url}/graphql`,
        }),
      cache,
    });

    render(
      React.createElement(
        HelmetProvider,
        { context: helmetContext },
        React.createElement(
          ApolloProvider,
          { client },
          React.createElement(
            BrowserRouter,
            null,
            Array.isArray(components) ? renderRoutes(components) : components,
          ),
        ),
      ),
      document.getElementById('root'),
    );
  } else {
    render(
      React.createElement(
        HelmetProvider,
        { context: helmetContext },
        React.createElement(
          BrowserRouter,
          null,
          Array.isArray(components) ? renderRoutes(components) : components,
        ),
      ),
      document.getElementById('root'),
    );
  }
})();
