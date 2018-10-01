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

- `racy dev` - Develop
- `racy build` - Build
- `racy serve` - Serve a build
- `racy export` - Export to static HTML sites
- `racy start` - Build + Serve
