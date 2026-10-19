'use strict';

const fs = require('fs');
const path = require('path');

function readSvgInnerFrom(assetsDir, rel) {
  const full = path.join(assetsDir, rel);
  const raw = fs.readFileSync(full, 'utf8');
  const m = raw.replace(/<\?xml[^?]*\?>\s*/i, '').match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
  return m ? m[1].trim() : '';
}

function stripInkscapeSodipodiMarkup(inner) {
  return inner
    .replace(/<sodipodi:namedview\b[\s\S]*?\/>/gi, '')
    .replace(/<inkscape:[\w:-]+\b[\s\S]*?\/>/gi, '')
    .replace(/<defs\b[^>]*\/>\s*/gi, '')
    .replace(/\s+sodipodi:[^\s=]+="[^"]*"/gi, '')
    .replace(/\s+inkscape:[^\s=]+="[^"]*"/gi, '');
}

function suffixIds(xml, suf) {
  return xml.replace(/\bid="([^"]*)"/g, (_, id) => `id="${id}${suf}"`);
}

function mirrorX1024(inner) {
  return `<g transform="translate(1024,0) scale(-1,1)">${inner}</g>`;
}

function wrapTransform(inner, transform) {
  if (!transform) return inner;
  return `<g transform="${transform}">${inner}</g>`;
}

function buildMirroredScleraGroup({
  idPrefix,
  scleraInner,
  scleraTransform = null,
}) {
  const left = wrapTransform(scleraInner, scleraTransform);
  const right = mirrorX1024(wrapTransform(suffixIds(scleraInner, '-r'), scleraTransform));
  const chunks = [`<g id="${idPrefix}-sclera-left">${left}</g>`, right];
  return `<g id="${idPrefix}-eyes">${chunks.join('\n')}</g>`;
}

module.exports = {
  readSvgInnerFrom,
  stripInkscapeSodipodiMarkup,
  buildMirroredScleraGroup,
};

