'use strict';

const path = require('path');
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const { initialize } = require('express-openapi');
const { generatePlaceholder, generateAvatarInitials, generateAvatarVector } = require('@polka/generator');
const { config, repoRoot } = require('@polka/config');
const stockCache = require('./lib/stock/cache');
const stockResize = require('./lib/stock/resize');
const stockFreepik = require('./lib/stock/providers/freepik');
const stockFallback = require('./lib/stock/fallback');

const rootPkg = require(path.join(repoRoot, 'package.json'));

async function main() {
  const app = express();
  app.use(cors());
  app.disable('x-powered-by');

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'polka', version: rootPkg.version });
  });

  if (process.platform === 'win32') {
    // Win32 workaround: express-openapi can derive URLs with backslashes from filesystem
    // paths (e.g. /wxh\{width}\{height}). For local Windows dev, mount the API
    // routes explicitly as plain Express handlers.
    const wxhPlain = require('./routes/wxh/{width}/{height}');
    const wxhText = require('./routes/wxh/{width}/{height}/{text}');
    const avatarInitials = require('./routes/avatars/initials/{text}');
    const avatarVector = require('./routes/avatars/vector/{kind}');
    const stockRoute = require('./routes/stock/{width}/{height}/{query}');

    app.get('/wxh/:width/:height', wxhPlain(generatePlaceholder, config).GET);
    app.get('/wxh/:width/:height/:text', wxhText(generatePlaceholder, config).GET);
    app.get('/avatars/initials/:text', avatarInitials(generateAvatarInitials).GET);
    app.get('/avatars/vector/:kind', avatarVector(generateAvatarVector).GET);
    app.get(
      '/stock/:width/:height/:query',
      stockRoute(config, generatePlaceholder, stockCache, stockResize, stockFreepik, stockFallback).GET,
    );
  }

  const framework = await initialize({
    app,
    apiDoc: path.join(__dirname, 'api-doc.js'),
    paths:
      process.platform === 'win32'
        ? path.join(__dirname, 'routes').replace(/\\/g, '/')
        : path.join(__dirname, 'routes'),
    dependencies: {
      generatePlaceholder,
      generateAvatarInitials,
      generateAvatarVector,
      stockCache,
      stockResize,
      stockFreepik,
      stockFallback,
      config,
    },
    exposeApiDocs: false,
    promiseMode: true,
    errorMiddleware(err, req, res, _next) {
      res.status(err.status || 500).json({
        message: err.message,
        errors: err.errors,
      });
    },
  });

  app.get('/openapi.json', (_req, res) => {
    res.json(framework.apiDoc);
  });

  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(null, { swaggerOptions: { url: '/openapi.json' } }),
  );

  const publicDir = path.join(__dirname, 'public');
  app.use(express.static(publicDir));

  app.get('*', (req, res, next) => {
    if (req.method !== 'GET') return next();
    const p = req.path;
    if (p.startsWith('/docs') || p === '/openapi.json' || p === '/health') return next();
    /* Let express-openapi handle API paths; base tabs stay SPA. */
    if (
      /^\/wxh\/\d+\/\d+/.test(p) ||
      /^\/avatars\/(initials|vector)\//.test(p) ||
      /^\/stock\/\d+\/\d+\//.test(p)
    ) return next();
    res.sendFile(path.join(publicDir, 'index.html'), (err) => {
      if (err) next(err);
    });
  });

  app.listen(config.port, () => {
    console.log(`polka http://localhost:${config.port}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
