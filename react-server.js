import React from 'react';
import { renderToNodeStream } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { renderRoutes } from 'react-router-config';
import { HelmetProvider } from 'react-helmet-async';
import { ServerStyleSheet } from 'styled-components';
import { ApolloProvider, getDataFromTree } from 'react-apollo';
import reactTreeWalker from 'react-tree-walker';
import { ApolloClient } from 'apollo-client';
import {
  InMemoryCache,
  IntrospectionFragmentMatcher,
} from 'apollo-cache-inmemory';
import { ApolloLink, Observable } from 'apollo-link';
import { isServer, isProduction } from './index.js';
import { HttpLink } from 'apollo-link-http';

class EmptyResultLink extends ApolloLink {
  request(operation, forward) {
    return new Observable(observer => {
      observer.next({ data: {} });
      return () => {};
    });
  }
}

export default async ({ config, app }) => {
  const {
    createLink,
    createFragmentTypes,
    shouldPrefetch,
    ssrMode,
    outFile,
    isPWA,
    name,
    version,
    graphqlUrl,
  } = config;

  const containerElementName = `${name}-${version}`;
  const fragmentTypesConfig = Object.assign({}, config, {
    isServer,
    isProduction,
  });

  const introspectionQueryResultData =
    createFragmentTypes && (await createFragmentTypes(fragmentTypesConfig));
  const cache = introspectionQueryResultData
    ? new InMemoryCache({
        fragmentMatcher: new IntrospectionFragmentMatcher({
          introspectionQueryResultData,
        }),
      })
    : new InMemoryCache();

  const apolloLinkConfig = Object.assign({}, config, {
    cache,
    isServer,
    isProduction,
  });
  const link =
    (createLink && (await createLink(apolloLinkConfig))) ||
    (graphqlUrl && new HttpLink({ uri: graphqlUrl }));

  const client = new ApolloClient({
    ssrMode: isServer,
    link: shouldPrefetch ? link : new EmptyResultLink(),
    cache,
  });

  return async (request, res, next) => {
    const helmetContext = {};
    const routerContext = {};
    const sheet = new ServerStyleSheet();
    const componentConfig = Object.assign({}, config, {
      request,
      isServer,
      isProduction,
    });
    const components = app && (await app(componentConfig));

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

    if (shouldPrefetch) await getDataFromTree(ServerApp);
    else await reactTreeWalker(ServerApp, (element, instance) => ({}));

    const { body, helmet, data = {} } = {
      body: sheet.interleaveWithNodeStream(renderToNodeStream(ServerApp)),
      helmet: helmetContext.helmet,
      data: client.extract(),
    };
    res.setHeader('Content-Type', 'text/html');
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
    ${ssrMode ? '' : `<script src="/${outFile}" defer></script>`}
    ${isPWA ? '<link rel="manifest" href="/manifest.webmanifest" />' : ''}
    ${
      isPWA
        ? '<script>if ("serviceWorker" in navigator) window.addEventListener("load", function() { navigator.serviceWorker.register("/sw.js") });</script>'
        : ''
    }
  </head>
  <body ${helmet.bodyAttributes}>
    <div id="${containerElementName || 'root'}">`,
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
      !ssrMode && data && Object.keys(data).length > 0
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
