# Racy

> A blazing fast zero-configuration async server-side React with GraphQL toolbelt.

- Parcel Bundler + Babel + Polyfills
- React
- React-Router
- React-Router-Config
- Styled-Components
- Helmet Async
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

## CLI

- `racy dev` - dev
- `racy build` - build
- `racy export` - export to static HTML sites
- `racy serve` - serve a build
- `racy start` - build + serve
