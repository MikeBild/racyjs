#!/usr/bin/env node
const argv = require('yargs')
  .usage('Usage: $0 <command>')
  .command('dev', 'Development mode')
  .command('build', 'Build dynamically')
  .command('serve', 'Serve dynamically')
  .command('export', 'Export statically')
  .command('static', 'Serve statically')
  .command('graphql', 'Introspection query of [fragments|schema]', yargs => {
    return yargs
      .usage('Usage: $0 graphql <subcommand>')
      .command('fragments <file>', 'Fragment types introspection query')
      .command('schema <file>', 'Schema introspection query')
      .demandCommand(2);
  })
  .help('h')
  .alias('h', 'help')
  .locale('en')
  .strict()
  .demandCommand(1).argv;

const fetch = require('isomorphic-unfetch');
const { parse } = require('path');
const { writeFile } = require('fs');
const { promisify } = require('util');
const writeToFile = promisify(writeFile);
const { ensureDir, emptyDir } = require('fs-extra');
const Bundler = require('parcel-bundler');
const forkPromise = require('fork-promise');
const updateNotifier = require('update-notifier');
const pkg = require('./package.json');
const { isProduction } = require('./index');

const BUILDDIR = process.env.BUILDDIR || `${process.cwd()}/.racy`;
const PUBLICDIR = process.env.PUBLICDIR || `${process.cwd()}/dist`;
const CACHEDIR = process.env.CACHEDIR || `${process.cwd()}/.cache`;
const CURRENTDIR = parse(require.resolve('./racy.js')).dir;

main()
  .then(({ config: { url, enabledGraphQLServer, enabledMiddleware } = {} }) => {
    console.log(`Server listen on ${url}`);
    console.log(
      `GraphQL-Server: ${enabledGraphQLServer ? 'enabled' : 'disabled'}`,
    );
    console.log(
      `Express-Server: ${enabledMiddleware ? 'enabled' : 'disabled'}`,
    );
  })
  .catch(error => console.error(error));

async function main() {
  updateNotifier({ pkg }).notify();
  const { name = '', version = '' } = tryRequire(
    `${process.cwd()}/package.json`,
  );
  const outFile = name ? `${name}.bundle.js` : '';
  mapConfigToEnvVars({ name, version, outFile });

  switch (argv._[0]) {
    case 'graphql':
      switch (argv._[1]) {
        case 'schema':
          console.log(`Fetching schema to ${argv.file}`);
          console.warn('Not implemented');
          process.exit(1);
          break;
        case 'fragments':
        default:
          console.log(`Fetching fragment types to ${argv.file}`);
          await emptyDir(BUILDDIR);
          await emptyDir(CACHEDIR);

          await forkPromise.fn(buildServer, [CURRENTDIR]);
          const { default: introspectionConfig = {} } = tryRequire(
            `${BUILDDIR}/server/config`,
          );

          try {
            const data = await fetchFragmentTypes(introspectionConfig);
            await writeToFile(`${process.cwd()}/${argv.file}`, data, {
              encoding: 'utf8',
              flag: 'w+',
            });

            console.log(`Fragment type file written to ${argv.file}`);
            process.exit(0);
          } catch (e) {
            console.error(e.message);
            process.exit(1);
          }
          break;
      }

      break;
    case 'build':
      console.log(`Bundling ${outFile}`);

      await emptyDir(BUILDDIR);
      await emptyDir(CACHEDIR);

      await forkPromise.fn(buildServer, [CURRENTDIR]);

      const { default: buildConfig = {} } = tryRequire(
        `${BUILDDIR}/server/config`,
      );
      Object.assign(buildConfig, { name, version, outFile });
      mapConfigToEnvVars(buildConfig);
      await buildClient({ outFile }).bundle();
      console.log('Bundled');
      process.exit(0);
      break;
    case 'serve':
      const { default: serveApp } = require(`${BUILDDIR}/server/App`);

      const { default: serveConfig = {} } = tryRequire(
        `${BUILDDIR}/server/config`,
      );
      Object.assign(serveConfig, { name, version, outFile });

      const { default: serveMiddleware } = tryRequire(
        `${BUILDDIR}/server/express-server`,
      );

      const { default: serveGraphql } = tryRequire(
        `${BUILDDIR}/server/graphql-server`,
      );

      const {
        app: serveExpress,
        express: serveExpressExpress,
      } = await startExpress(serveConfig, serveGraphql, serveMiddleware);

      mapConfigToEnvVars(serveConfig);

      if (serveApp) {
        serveExpress.use(serveExpressExpress.static(`${BUILDDIR}/client`));
        const serveHandler = await require(`${BUILDDIR}/server/react-server`).default(
          { config: serveConfig, app: serveApp },
        );
        serveExpress.use((req, res, next) => serveHandler(req, res, next));
      }
      return { config: serveConfig };
      break;
    case 'export':
      await emptyDir(BUILDDIR);
      await emptyDir(PUBLICDIR);
      await emptyDir(CACHEDIR);

      const fetch = require('isomorphic-unfetch');
      console.log(`Bundling ${outFile}`);
      await buildClient({ outFile, outDir: PUBLICDIR }).bundle();
      await forkPromise.fn(buildServer, [CURRENTDIR]);
      console.log('Bundled');
      console.log('Serve ...');
      const { default: exportApp } = require(`${BUILDDIR}/server/App`);

      const { default: exportConfig = {} } = tryRequire(
        `${BUILDDIR}/server/config`,
      );
      Object.assign(exportConfig, { name, version, outFile });

      const { default: exportMiddleware } = tryRequire(
        `${BUILDDIR}/server/express-server`,
      );

      const { default: exportGraphql } = tryRequire(
        `${BUILDDIR}/server/graphql-server`,
      );

      const {
        app: exportExpress,
        express: exportExpressExpress,
      } = await startExpress(exportConfig, exportGraphql, exportMiddleware);

      mapConfigToEnvVars(exportConfig);

      exportExpress.use(exportExpressExpress.static(`${BUILDDIR}/client`));
      const exportHandler = await require(`${BUILDDIR}/server/react-server`).default(
        { config: exportConfig, app: exportApp },
      );

      exportExpress.use((req, res, next) => exportHandler(req, res, next));
      console.log('Serving');
      console.log('Exporting ...');

      const components = await exportApp({ config: exportConfig });

      const allRoutes = Array.isArray(components)
        ? components.reduce((s, e) => {
            if (e.routes) return s.concat(e.routes);
            return s.concat([e]);
          }, [])
        : [{ component: components, path: '/' }];

      const fetcher = allRoutes
        .map(async ({ path }) => {
          const response = path
            ? await fetch(`${exportConfig.url}${path}`)
            : await fetch(`${exportConfig.url}/404`);

          return { path, html: await response.text() };
        })
        .map(async res => {
          const { path, html } = await res;

          if (!path) {
            await writeToFile(`${PUBLICDIR}/404.html`, html, {
              encoding: 'utf8',
              flag: 'w+',
            });
          } else {
            await ensureDir(`${PUBLICDIR}${path}`);
            await writeToFile(`${PUBLICDIR}${path}/index.html`, html, {
              encoding: 'utf8',
              flag: 'w+',
            });
          }

          return { path, html };
        });
      await Promise.all(fetcher);
      console.log('Exported');
      process.exit(0);
      break;
    case 'static':
      const { default: staticConfig = {} } = tryRequire(
        `${BUILDDIR}/server/config`,
      );
      mapConfigToEnvVars(staticConfig);
      const {
        app: staticExpress,
        express: staticExpressExpress,
      } = await startExpress(staticConfig);

      staticExpress.use(staticExpressExpress.static(PUBLICDIR));
      staticExpress.use(
        '*',
        staticExpressExpress.static(`${PUBLICDIR}/404.html`),
      );
      return { config: staticConfig };
      break;
    case 'dev':
    default:
      await emptyDir(BUILDDIR);
      await emptyDir(PUBLICDIR);
      await emptyDir(CACHEDIR);

      const clientBundler = buildClient({ outFile });
      await forkPromise.fn(buildServer, [CURRENTDIR]);
      const { default: devApp } = tryRequire(`${BUILDDIR}/server/App`);

      const { default: devConfig = {} } = tryRequire(
        `${BUILDDIR}/server/config`,
      );
      Object.assign(devConfig, { name, version, outFile });

      const { default: devMiddleware } = tryRequire(
        `${BUILDDIR}/server/express-server`,
      );

      const { default: devGraphql } = tryRequire(
        `${BUILDDIR}/server/graphql-server`,
      );

      const { app: devExpress } = await startExpress(
        devConfig,
        devGraphql,
        devMiddleware,
      );

      mapConfigToEnvVars(devConfig);

      let devHandler = await require(`${BUILDDIR}/server/react-server`).default(
        { config: devConfig, app: devApp },
      );

      clientBundler.on('bundled', async bundle => {
        await forkPromise.fn(buildServer, [CURRENTDIR]);
        devHandler = await requireUncached(
          `${BUILDDIR}/server/react-server`,
        ).default({ config: devConfig, app: devApp });
      });

      devApp && devExpress.use(clientBundler.middleware());
      devApp && devExpress.use((req, res, next) => devHandler(req, res, next));

      return { config: devConfig };
      break;
  }
}

function mapConfigToEnvVars(config) {
  Object.keys(config || {}).forEach(key => {
    const valueType = typeof config[key];
    if (
      valueType === 'string' ||
      valueType === 'number' ||
      valueType === 'boolean'
    ) {
      process.env[key.toUpperCase()] = config[key];
    }
  });
}

function requireUncached(module) {
  delete require.cache[require.resolve(module)];
  return require(module);
}

function tryRequire(module) {
  try {
    return require(module);
  } catch (e) {
    return { default: undefined };
  }
}

function buildClient({ outDir, outFile = 'bundle.js' }) {
  return new Bundler(`${__dirname}/react-client.js`, {
    watch: !isProduction,
    minify: isProduction,
    sourceMaps: !isProduction,
    outDir: outDir || `${BUILDDIR}/client`,
    outFile,
    target: 'browser',
    cache: true,
    cacheDir: CACHEDIR,
    logLevel: 0,
    autoInstall: false,
  });
}

async function buildServer(path, done) {
  const Bundler = require('parcel-bundler');
  const { isProduction } = require(`${path}/index`);
  const BUILDDIR = process.env.BUILDDIR || `${process.cwd()}/.racy`;
  const CACHEDIR = process.env.CACHEDIR || `${process.cwd()}/.cache`;

  const serverAppBundler = new Bundler(
    [`${process.cwd()}/config.js`, `${process.cwd()}/App.js`],
    {
      watch: false,
      minify: isProduction,
      sourceMaps: !isProduction,
      outDir: `${BUILDDIR}/server`,
      target: 'node',
      cache: true,
      cacheDir: CACHEDIR,
      logLevel: 0,
      autoInstall: false,
    },
  );

  try {
    await serverAppBundler.bundle();
    console.log('React-App: enabled');
  } catch (e) {
    console.warn('React-App: disabled');
    if (!e.message.includes('No entries found')) console.error(e);
  }

  const reactServerBundler = new Bundler(`${path}/react-server.js`, {
    watch: false,
    minify: isProduction,
    sourceMaps: !isProduction,
    outDir: `${BUILDDIR}/server`,
    cacheDir: CACHEDIR,
    target: 'node',
    cache: true,
    logLevel: 0,
    autoInstall: false,
  });

  try {
    await reactServerBundler.bundle();
    console.log('React-Server: enabled');
  } catch (e) {
    console.warn('React-Server: disabled');
    if (!e.message.includes('No entries found')) console.error(e);
  }

  const graphQLServerBundler = new Bundler(
    `${process.cwd()}/graphql-server.js`,
    {
      watch: false,
      minify: isProduction,
      sourceMaps: !isProduction,
      outDir: `${BUILDDIR}/server`,
      target: 'node',
      cache: true,
      cacheDir: CACHEDIR,
      logLevel: 0,
      autoInstall: false,
    },
  );

  try {
    await graphQLServerBundler.bundle();
    console.log('GraphQL-Server: enabled');
  } catch (e) {
    console.warn('GraphQL-Server: disabled');
    if (!e.message.includes('No entries found')) console.error(e);
  }

  const expressServerBundler = new Bundler(
    `${process.cwd()}/express-server.js`,
    {
      watch: false,
      minify: isProduction,
      sourceMaps: !isProduction,
      outDir: `${BUILDDIR}/server`,
      target: 'node',
      cache: true,
      cacheDir: CACHEDIR,
      logLevel: 0,
      autoInstall: false,
    },
  );

  try {
    await expressServerBundler.bundle();
    console.log('Express-Server: enabled');
  } catch (e) {
    console.warn('Express-Server: disabled');
    if (!e.message.includes('No entries found')) console.error(e);
  }

  done();
}

async function startExpress(config = {}, graphql, middleware) {
  const express = require('express');
  const graphqlServer = graphql && (await graphql({ config }));
  const app = express();
  app.disable('x-powered-by');

  if (graphqlServer) {
    const { ApolloServer } = require('apollo-server-express');
    const apolloServer = new ApolloServer(graphqlServer);
    apolloServer.applyMiddleware({ app, cors: config.cors });
  }
  if (middleware) await middleware({ app, config });

  return new Promise(resolve => {
    const server = app.listen(config.port || null, () => {
      const address = server.address();
      const port = address.port;
      const host = address.address === '::' ? 'localhost' : address.address;

      const url = process.env.URL || `http://${host}:${port}`;
      const graphqlUrl = config.graphqlUrl || `${url}/graphql`;

      Object.assign(config, {
        port,
        host,
        url,
        graphqlUrl,
        enabledGraphQLServer: Boolean(graphql),
        enabledMiddleware: Boolean(middleware),
      });

      const stop = () => {
        return new Promise(resolve => {
          server.abort(() => resolve());
        });
      };

      resolve({ app, express, config });
    });
  });
}

async function fetchFragmentTypes({ graphqlUrl }) {
  const query = `__schema {
          types {
            kind
            name
            possibleTypes {
              name
            }
          }
        }
    `;
  const response = await fetch(graphqlUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!response.ok) throw new Error(response.statusText);
  return (await response.json()).data;
}
