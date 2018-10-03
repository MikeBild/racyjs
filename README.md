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

## How to ...

- [How to create a basic React-App?](#how-to-create-a-basic-react-app)
- [How to customize the default configuration?](#how-to-customize-the-default-configuration)
- [How to map a component to a route?](#How-to-map-a-component-to-a-route)
- [How to use dynamic imports and code splitting?](#how-to-use-dynamic-imports-and-code-splitting)

## CLI

- `racy dev` - Development mode
- `racy build` - Build dynamically
- `racy serve` - Serve dynamically
- `racy export` - Export statically
- `racy static` - Serve statically
- `racy start` - Build + Serve dynamically

## How to create a basic React-App?

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
