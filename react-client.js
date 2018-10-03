import '@babel/polyfill';

import React from 'react';
import { render, hydrate } from 'react-dom';
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
  Object.assign(config, {
    name: process.env.NAME,
    version: process.env.VERSION,
  });
  const { default: app, link } = await import('./App');
  const cache = global['DATA']
    ? new InMemoryCache().restore(global['DATA'])
    : new InMemoryCache();
  const apolloLink =
    link && (await link({ ...config, cache, isServer, isProduction }));
  const components = app && (await app({ ...config, isServer, isProduction }));
  const show = isProduction ? hydrate : render;

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

    show(
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
    show(
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
