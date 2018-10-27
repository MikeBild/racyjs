#!/usr/bin/env node
const argv = require('yargs')
  .usage('Usage: $0 <command>')
  .command('dev', 'Develop an App')
  .command('build', 'Build an App for dynamically serving')
  .command('serve', 'Dynamically serve an App')
  .command('export', 'Export an App for statically serving')
  .command('static', 'Statically serve an App')
  .command('graphql', 'Fetch and save [fragments|schema] files', yargs => {
    return yargs
      .usage('Usage: $0 graphql <subcommand>')
      .command('schema <file>', 'Fetch and save GraphQL schema to a file')
      .command(
        'fragments <file>',
        'Fetch and save GraphQL fragment types to a file',
      )
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
const { ensureDir, emptyDir, copy, remove, writeJson } = require('fs-extra');
const readDirRecursive = require('fs-readdir-recursive');
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
      `GraphQL-Server : ${enabledGraphQLServer ? 'enabled' : 'disabled'}`,
    );
    console.log(
      `Express-Server : ${enabledMiddleware ? 'enabled' : 'disabled'}`,
    );
  })
  .catch(error => console.error(error));

async function main() {
  updateNotifier({ pkg }).notify();
  const { name = '', version = '' } = tryRequire(
    `${process.cwd()}/package.json`,
  );
  const isPWA = await copyWebManifest();
  const outFile =
    name && version ? `${name}.${version}.bundle.js` : 'bundle.js';
  mapConfigToEnvVars({ name, version, outFile, isPWA });

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
      Object.assign(buildConfig, { name, version, outFile, isPWA });
      mapConfigToEnvVars(buildConfig);

      try {
        await buildClient({ outFile, isPWA }).bundle();
        await copyCacheManifest({
          isPWA,
          workDir: `${BUILDDIR}/client`,
        });
      } catch (e) {}
      console.log('Bundled');
      process.exit(0);
      break;
    case 'serve':
      const { default: serveApp } = tryRequire(`${BUILDDIR}/server/App`);

      const { default: serveConfig = {} } = tryRequire(
        `${BUILDDIR}/server/config`,
      );
      Object.assign(serveConfig, { name, version, outFile, isPWA });

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
      await buildClient({ outFile, outDir: PUBLICDIR, isPWA }).bundle();
      await copyCacheManifest({
        isPWA,
        workDir: PUBLICDIR,
      });
      await forkPromise.fn(buildServer, [CURRENTDIR]);
      console.log('Bundled');
      console.log('Serve ...');
      const { default: exportApp } = require(`${BUILDDIR}/server/App`);

      const { default: exportConfig = {} } = tryRequire(
        `${BUILDDIR}/server/config`,
      );
      Object.assign(exportConfig, { name, version, outFile, isPWA });

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

      const clientBundler = buildClient({ outFile, isPWA });

      await forkPromise.fn(buildServer, [CURRENTDIR]);

      let devConfig = tryRequire(`${BUILDDIR}/server/config`).default || {};
      Object.assign(devConfig, { name, version, outFile, isPWA });

      let devMiddleware = tryRequire(`${BUILDDIR}/server/express-server`)
        .default;
      let devGraphql = tryRequire(`${BUILDDIR}/server/graphql-server`).default;
      let devApp = tryRequire(`${BUILDDIR}/server/App`).default;
      let devHandler = await tryRequire(
        `${BUILDDIR}/server/react-server`,
      ).default({ config: devConfig, app: devApp });

      const { app: devExpress } = await startExpress(
        devConfig,
        devGraphql,
        devMiddleware,
      );

      mapConfigToEnvVars(devConfig);
      clientBundler.on('bundled', async bundle => {
        await copyCacheManifest({
          isPWA,
          workDir: `${BUILDDIR}/client`,
        });
        await forkPromise.fn(buildServer, [CURRENTDIR]);

        devConfig =
          tryRequireUncached(`${BUILDDIR}/server/config`).default || {};
        Object.assign(devConfig, { name, version, outFile, isPWA });
        devMiddleware = tryRequireUncached(`${BUILDDIR}/server/express-server`)
          .default;
        devGraphql = tryRequireUncached(`${BUILDDIR}/server/graphql-server`)
          .default;
        devApp = tryRequireUncached(`${BUILDDIR}/server/App`).default;
        devHandler = await tryRequireUncached(
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

function tryRequireUncached(module) {
  try {
    delete require.cache[require.resolve(module)];
    return require(module);
  } catch (e) {
    if (
      !e.message.includes('Cannot find module') &&
      !e.message.includes('express-server') &&
      !e.message.includes('graphql-server') &&
      !e.message.includes('config') &&
      !e.message.includes('App')
    )
      console.error(e);
    return { default: undefined };
  }
}

function tryRequire(module) {
  try {
    return require(module);
  } catch (e) {
    if (
      !e.message.includes('Cannot find module') &&
      !e.message.includes('express-server') &&
      !e.message.includes('graphql-server') &&
      !e.message.includes('config') &&
      !e.message.includes('App')
    )
      console.error(e);
    return { default: undefined };
  }
}

function buildClient({ outDir, outFile, isPWA }) {
  return new Bundler(
    isPWA
      ? [
          `${__dirname}/react-client.js`,
          `${__dirname}/manifest.webmanifest`,
          `${__dirname}/sw.js`,
        ]
      : `${__dirname}/react-client.js`,
    {
      watch: !isProduction,
      minify: isProduction,
      sourceMaps: !isProduction,
      outDir: outDir || `${BUILDDIR}/client`,
      outFile,
      contentHash: true,
      target: 'browser',
      scopeHoist: false,
      cache: true,
      cacheDir: CACHEDIR,
      logLevel: 0,
      autoinstall: false,
    },
  );
}

async function buildServer(path, done) {
  const Bundler = require('parcel-bundler');
  const { isProduction } = require(`${path}/index`);
  const BUILDDIR = process.env.BUILDDIR || `${process.cwd()}/.racy`;
  const CACHEDIR = process.env.CACHEDIR || `${process.cwd()}/.cache`;
  const bundleResults = new Set();

  const serverBundler = new Bundler(
    [
      `${process.cwd()}/config.js`,
      `${process.cwd()}/App.js`,
      `${process.cwd()}/graphql-server.js`,
      `${process.cwd()}/express-server.js`,
    ],
    {
      watch: !isProduction,
      minify: isProduction,
      sourceMaps: !isProduction,
      outDir: `${BUILDDIR}/server`,
      contentHash: false,
      target: 'node',
      cache: true,
      cacheDir: CACHEDIR,
      logLevel: 0,
      autoinstall: false,
    },
  );

  try {
    const bundleResult = await serverBundler.bundle();
    bundleResult.childBundles.forEach(x => bundleResults.add(x));
  } catch (e) {
    if (!e.message.includes('No entries found')) console.error(e);
  }

  const reactServerBundler = new Bundler(`${path}/react-server.js`, {
    watch: !isProduction,
    minify: isProduction,
    sourceMaps: !isProduction,
    outDir: `${BUILDDIR}/server`,
    cacheDir: CACHEDIR,
    target: 'node',
    cache: true,
    logLevel: 0,
    autoinstall: false,
  });

  try {
    const bundleResult = await reactServerBundler.bundle();
    bundleResults.add(bundleResult);
  } catch (e) {
    if (!e.message.includes('No entries found')) console.error(e);
  }
  bundleResults.forEach(x => {
    if (x.name.includes('config.js')) console.log(`Configure      : rebuild`);
    if (x.name.includes('App.js')) console.log(`App            : rebuild`);
    if (x.name.includes('graphql-server.js'))
      console.log(`GraphQL-Server : rebuild`);
    if (x.name.includes('react-server.js'))
      console.log(`React-Server   : rebuild`);
    if (x.name.includes('express-server.js'))
      console.log(`Express-Server : rebuild`);
  });
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
    apolloServer.applyMiddleware({ app });
  }
  if (middleware) await middleware({ app, config });

  return new Promise(resolve => {
    const server = app.listen(config.port || null, () => {
      const address = server.address();
      const port = address.port;
      const host = address.address === '::' ? 'localhost' : address.address;

      const url = process.env.URL || `http://${host}:${port}`;
      const graphqlUrl = config.graphqlUrl || (url && `${url}/graphql`) || null;

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

async function copyWebManifest() {
  try {
    await remove(`${__dirname}/manifest.webmanifest`);
    await copy(
      `${process.cwd()}/manifest.webmanifest`,
      `${__dirname}/manifest.webmanifest`,
      { overwrite: true },
    );
    return true;
  } catch (e) {
    return false;
  }
}

async function copyCacheManifest({ isPWA, workDir }) {
  if (!isPWA) return;

  const assets = await readDirRecursive(workDir).filter(
    x => !x.includes('sw.js'),
  );
  await writeJson(`${workDir}/manifest.json`, assets, {
    spaces: 2,
  });
}
