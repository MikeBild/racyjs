# Racy

> A blazing fast zero-configuration async server-side React with GraphQL toolbelt.

## Stack

- Babel 7 + Polyfill
- Parcel Bundler
- React
- Styled-Components
- Helmet-Async
- React-Router + React-Router-Config
- Express
- Graphql Apollo React & Apollo Server

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
  "static": "NODE_ENV=production npm run export && static-server ./dist"
}
```

- [How to customize the default configuration?](#how-to-customize-the-default-configuration)
- [How to create a basic React-App?](#how-to-create-a-basic-react-app)
- [How to map components to different routes?](#how-to-map-components-to-different-routes)

## CLI

- `racy dev` - Develop
- `racy build` - Build
- `racy serve` - Serve a build
- `racy export` - Export to static HTML sites
- `racy start` - Build + Serve

## How to create a basic React-App?

Just create a

_`app.js`_

```jsx
import React, { Fragment as F } from 'react';
import Helmet from 'react-helmet';
import styled from 'styled-components';

const Headline = styled.h1`
  color: blue;
`;

export default async ({ config }) => (
  <F>
    <Helmet>
      <meta charSet="utf-8" />
      <title>React-App</title>
    </Helmet>
    <Headline>Racy Basic App Example</Headline>
  </F>
);
```

- [React Basic Example](examples/react-basic/README.md)

## How to customize the default configuration?

Just create a

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

## How to map components to different routes?

```jsx
import React from 'react';
import Home from './components/Home';
import About from './components/About';

export default async ({ config }) => [
  { path: '/', exact: true, component: Home },
  { path: '/about', exact: true, component: About },
];
```

- [React Advanced Example](examples/react-advanced/README.md)
