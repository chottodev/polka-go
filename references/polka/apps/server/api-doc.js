'use strict';

const path = require('path');
const { repoRoot } = require('@polka/config');
const rootPkg = require(path.join(repoRoot, 'package.json'));

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Polka',
    description: 'Placeholder API (SVG)',
    version: rootPkg.version,
  },
  servers: [{ url: '/' }],
  paths: {},
};
