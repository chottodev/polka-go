'use strict';

const fs = require('fs');
const path = require('path');

const PANDA_BASE_SVG_PATH = path.join(__dirname, 'assets', 'panda', 'base.svg');

function readPandaBaseSvg() {
  return fs.readFileSync(PANDA_BASE_SVG_PATH, 'utf8');
}

module.exports = {
  PANDA_BASE_SVG_PATH,
  readPandaBaseSvg,
};
