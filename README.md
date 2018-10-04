# Racy

> A blazing fast zero-configuration async server-side React with GraphQL toolbelt.

## Stack

- [Babel 7 + Polyfill](https://github.com/babel/babel)
- [Parcel Bundler](https://github.com/parcel-bundler/parcel/blob/master/README.md)
- [React](https://github.com/facebook/react/blob/master/README.md)
- [Styled-Components](https://github.com/styled-components/styled-components/blob/master/README.md)
- [Helmet-Async](https://github.com/staylor/react-helmet-async/blob/master/README.md)
- [React-Router v4](https://github.com/ReactTraining/react-router/blob/master/packages/react-router/README.md) + [React-Router-DOM](https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/README.md) + [React-Router-Config](https://github.com/ReactTraining/react-router/blob/master/packages/react-router-config/README.md)
- [Express](https://github.com/expressjs/express/blob/master/Readme.md)
- [GraphQL](https://github.com/facebook/graphql/blob/master/README.md) [Apollo React](https://github.com/apollographql/react-apollo/blob/master/README.md) & [Apollo Server](https://github.com/apollographql/apollo-server/blob/master/README.md)

## Setup

- `npm init -f`
- `yarn add racy`

_`package.json`_

```json
"scripts": {
  "dev": "racy dev",
  "build": "racy build",
  "serve": "racy serve",
  "export": "racy export",
  "start": "NODE_ENV=production racy build && racy serve",
  "static": "NODE_ENV=production npm run export && racy static"
}
```

## How to

- [How to create a simple React-App?](#how-to-create-a-simple-react-app)
- [How to customize the default configuration?](#how-to-customize-the-default-configuration)
- [How to map a component to a route?](#How-to-map-a-component-to-a-route)
- [How to use dynamic imports and code splitting?](#how-to-use-dynamic-imports-and-code-splitting)
- [How to use GraphQL queries?](#how-to-use-graphql-queries)
- [How to extend Express with additional middleware?](#how-to-extend-express-with-additional-middleware)

## CLI

- `racy dev` - Develop an App
- `racy build` - Build an App for dynamically serving
- `racy serve` - Dynamically serve an App
- `racy export` - Export an App for statically serving
- `racy static` - Statically serve an App
- `racy graphql schema` - Fetch and save GraphQL schema to a file
- `racy graphql fragments` - Fetch and save GraphQL fragment types to a file

## How to create a simple React-App?

Just enter `yarn add react` and create a `App.js` in your project root folder.

_`App.js`_

```jsx
import React, { Fragment as F } from 'react';
import Helmet from 'react-helmet';
import styled from 'styled-components';

const Headline = styled.h1`
  color: blue;
`;

export default async ({ name, version, port }) => (
  <F>
    <Helmet>
      <meta charSet="utf-8" />
      <title>React-App</title>
    </Helmet>
    <Headline>
      Racy Basic App Example {name} {version}
    </Headline>
  </F>
);
```

- [React Basic Example](examples/react-basic/README.md)

## How to customize the default configuration?

Just create a `config.js` in your project root folder.

_`config.js`_

```javascript
export default {
  // Listen on port?
  port: process.env.PORT || 8080,
  // GraphQL prefetch on server?
  shouldPrefetch: false,
  // SSR mode only?
  ssrMode: false,
};
```

- [React Advanced Example](examples/react-advanced/README.md)

## How to map a component to a route?

- [React-Router-Config](https://github.com/ReactTraining/react-router/blob/master/packages/react-router-config/README.md)

_`App.js`_

```jsx
import React from 'react';
import Home from './components/Home';
import About from './components/About';
import NotFound from './components/NotFound';

export default async () => [
  { path: '/', exact: true, component: Home },
  { path: '/about', exact: true, component: About },
  { component: NotFound },
];
```

- [React Advanced Example](examples/react-advanced/README.md)

## How to use dynamic imports and code splitting?

_`App.js`_

```jsx
import React from 'react';

export default async () => {
  const { default: Home } = await import('./components/Home');
  const { default: About } = await import('./components/About');

  return [
    { path: '/', exact: true, component: Home },
    { path: '/about', exact: true, component: About },
  ];
};
```

- [React Advanced Example](examples/react-advanced/README.md)

## How to use GraphQL queries?

_`App.js`_

```jsx
import React, { Fragment as F } from 'react';
import { Query } from 'react-apollo';

import GITHUB_QUERY from './Github.gql';

export default async ({ name, version }) => {
  return (
    <F>
      <h1>
        App: {name} {version}
      </h1>
      <Query query={GITHUB_QUERY}>
        {({ data, error, loading }) => {
          if (loading) return <div>loading ...</div>;
          if (error) return <div>{error.message}</div>;
          return <pre>{JSON.stringify(data, null, 4)}</pre>;
        }}
      </Query>
    </F>
  );
};
```

_`config.js`_

```javascript
export default {
  // Listen on port
  port: process.env.PORT || 8080,
  // GraphQL URL for GraphQL queries
  graphqlUrl: process.env.GRAPHQLURL || 'https://www.graphqlhub.com/graphql',
  // Import fragment types file to resolve union and interface types
  createFragmentTypes: async () => await import('./fragmentTypes.json'),
  // Enable prefetching on server-side
  shouldPrefetch: true,
};
```

- [React GraphQL Example](examples/react-graphql/README.md)

## How to extend Express with additional middleware?

Just create a `express-server.js` in your project root folder.

_`express-server.js`_

```javascript
import morgan from 'morgan';
import cors from 'cors';
import compression from 'compression';
import examples from './examples';

export default ({ config, app }) => {
  app.use(morgan('combined'));
  app.use(cors());
  app.use(compression());

  app.use('/api/examples', examples);
};
```

- [Express Middleware Example](examples/express-server/README.md)
