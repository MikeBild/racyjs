import React from 'react';
import { renderToNodeStream } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { renderRoutes } from 'react-router-config';
import { HelmetProvider } from 'react-helmet-async';
import { ServerStyleSheet } from 'styled-components';
import { ApolloProvider, getDataFromTree } from 'react-apollo';
import reactTreeWalker from 'react-tree-walker';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink, Observable } from 'apollo-link';
import { isServer, isProduction } from './index.js';

class EmptyResultLink extends ApolloLink {
  request(operation, forward) {
    return new Observable(observer => {
      observer.next({ data: {} });
      return () => {};
    });
  }
}

export default async ({ config, app, link }) => {
  const cache = new InMemoryCache();
  const apolloLinkOptions = Object.assign({}, config, {
    cache,
    isServer,
    isProduction,
  });
  const apolloLink = link && (await link(apolloLinkOptions));

  const client = new ApolloClient({
    queryDeduplication: true,
    ssrMode: isServer,
    link:
      config.shouldPrefetch && apolloLink ? apolloLink : new EmptyResultLink(),
    cache,
  });

  return async (request, res, next) => {
    const helmetContext = {};
    const routerContext = {};
    const sheet = new ServerStyleSheet();
    const componentOptions = Object.assign({}, config, {
      request,
      isServer,
      isProduction,
    });
    const components = app && (await app(componentOptions));

    const ServerApp = React.createElement(
      HelmetProvider,
      { context: helmetContext },
      React.createElement(
        ApolloProvider,
        { client },
        React.createElement(
          StaticRouter,
          {
            location: request.url,
            context: routerContext,
          },
          Array.isArray(components) ? renderRoutes(components) : components,
        ),
      ),
    );

    if (config.shouldPrefetch) await getDataFromTree(ServerApp);
    else await reactTreeWalker(ServerApp, (element, instance) => ({}));

    const { body, helmet, data = {} } = {
      body: sheet.interleaveWithNodeStream(renderToNodeStream(ServerApp)),
      helmet: helmetContext.helmet,
      data: client.extract(),
    };

    res.write(
      `<!doctype html>
<html ${helmet.htmlAttributes}>
  <head>
    ${helmet.title}
    ${helmet.meta}
    ${helmet.link}
    ${helmet.noscript}
    ${helmet.script}
    ${helmet.style}
    ${config.ssrMode ? '' : '<script src="/client.js" defer></script>'}
  </head>
  <body ${helmet.bodyAttributes}>
    <div id="root">`,
    );

    body.pipe(
      res,
      { end: false },
    );

    body.on('end', () => {
      res.end(
        `
    </div>
    ${
      !config.ssrMode && data && Object.keys(data).length > 0
        ? `<script>window.DATA=${JSON.stringify(data)};</script>`
        : ''
    }
  </body>
</html>`,
      );
      next();
    });
  };
};
