'use strict';

const fs = require('fs');
const path = require('path');

const { parseSize, normalizeHex, seededIndex } = require('./utils');

const ASSETS_DIR = path.join(__dirname, 'assets', 'panda');

const GLASSES_TRANSFORM = 'translate(512, 488) scale(1.50) translate(-256, -256)';

const GLASSES_FILL_PRESETS = [
  '0cc6c2',
  'e86b9a',
  '6b8ce8',
  'c9a227',
  '5a7d5a',
  '8b5cf6',
  'f97316',
  '14b8a6',
  '64748b',
  'dc2626',
  '7c3aed',
  '059669',
];

const HAT_TRANSFORM = 'translate(500, 245) scale(0.75) rotate(4) translate(-256, -256)';

const HAT_FILL_PRESETS = [
  '6468e8',
  'b45309',
  '0d9488',
  'be185d',
  '4f46e5',
  'ca8a04',
  '15803d',
  'c2410c',
  '7e22ce',
  '0369a1',
  'a16207',
  '9f1239',
];

const MOUTH_FILES = ['mouths/mouth-02.svg', 'mouths/mouth-03.svg', 'mouths/mouth-04.svg'];

const EYE_PRESETS = [
  {
    id: 'sclera02',
    sclera: 'eyes/sclera-02.svg',
    scleraTransform: null,
  },
  {
    id: 'sclera01',
    sclera: 'eyes/sclera-01.svg',
    scleraTransform: 'translate(354, 458)',
  },
];

const BG_PRESETS = [
  'c8dce8',
  'e8d8e5',  
  'b0c7b6',  
  'e8e0c6',  
  'd8c8e8',  
  'c8d8e8',  
  'e0c8d0',  
  'd0dfcc',  
  'c8cce8',  
  'e8d8c6',  
  'd8c8e8',  
  'c8e8e0',  
  'e8d8c8',  
  'd0d8e8',  
  'c8e0d8',  
  'e0d8c8',  
];

function readSvgInner(rel) {
  const full = path.join(ASSETS_DIR, rel);
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

function mirrorX(inner) {
  return `<g transform="translate(1024,0) scale(-1,1)">${inner}</g>`;
}

function wrapScleraTo1024(inner, transform) {
  if (!transform) return inner;
  return `<g transform="${transform}">${inner}</g>`;
}

function buildEyesGroup(preset) {
  const scleraInner = readSvgInner(preset.sclera);
  const t = preset.scleraTransform;
  const left = wrapScleraTo1024(scleraInner, t);
  const right = mirrorX(wrapScleraTo1024(suffixIds(scleraInner, '-r'), t));
  const chunks = [`<g id="panda-sclera-left">${left}</g>`, right];
  return `<g id="panda-eyes">${chunks.join('\n')}</g>`;
}

function pandaBgHex(seed, explicitBg) {
  const fallback = BG_PRESETS[seededIndex(String(seed) + ':panda-bg', BG_PRESETS.length)];
  return normalizeHex(explicitBg, fallback);
}

function pickAccessoryRel(seed) {
  const r = seededIndex(String(seed) + ':panda-acc', 100);
  if (r < 48) return null;
  if (r < 58) return 'accessories/blush-01.svg';
  if (r < 68) return 'accessories/leaf-01.svg';
  if (r < 78) return 'accessories/glasses-01.svg';
  return 'accessories/hat-01.svg';
}

function pickGlassesFillHex(seed) {
  return GLASSES_FILL_PRESETS[seededIndex(String(seed) + ':panda-glasses-fill', GLASSES_FILL_PRESETS.length)];
}

function paintGlassesInner(inner, fillHex) {
  return inner.replace(/fill="#[^"]*"/, `fill="#${fillHex}"`);
}

function pickHatFillHex(seed) {
  return HAT_FILL_PRESETS[seededIndex(String(seed) + ':panda-hat-fill', HAT_FILL_PRESETS.length)];
}

function paintHatInner(inner, fillHex) {
  return inner.replace(/fill="#6468e8"/gi, `fill="#${fillHex}"`);
}

function generateAvatarVectorPanda({ size, bg, seed = '' }) {
  const s = parseSize(size, 32, 1024, 128);
  const bgHex = pandaBgHex(seed, bg);

  const baseInner = stripInkscapeSodipodiMarkup(readSvgInner('base.svg'));

  const eyePreset = EYE_PRESETS[seededIndex(String(seed) + ':panda-eyes', EYE_PRESETS.length)];
  const eyes = buildEyesGroup(eyePreset);

  const mouthRel = MOUTH_FILES[seededIndex(String(seed) + ':panda-mouth', MOUTH_FILES.length)];
  const mouthInner = readSvgInner(mouthRel);

  const accRel = pickAccessoryRel(seed);
  const accInner = accRel ? readSvgInner(accRel) : '';
  const isBlush = accRel === 'accessories/blush-01.svg';
  const isLeaf = accRel === 'accessories/leaf-01.svg';
  const isGlasses = accRel === 'accessories/glasses-01.svg';
  const isHat = accRel === 'accessories/hat-01.svg';

  const blushBlock = isBlush && accInner ? `<g id="panda-blush">${accInner}</g>` : '';
  const glassesInner = isGlasses && accInner ? paintGlassesInner(accInner, pickGlassesFillHex(seed)) : '';
  const glassesBlock = glassesInner
    ? `<g id="panda-glasses" transform="${GLASSES_TRANSFORM}">${glassesInner}</g>`
    : '';
  const leafBlock = isLeaf && accInner ? `<g id="panda-accessory">${accInner}</g>` : '';
  const hatInner = isHat && accInner ? paintHatInner(accInner, pickHatFillHex(seed)) : '';
  const hatBlock = hatInner ? `<g id="panda-hat" transform="${HAT_TRANSFORM}">${hatInner}</g>` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#${bgHex}"/>
  <g id="panda-base">${baseInner}</g>
  ${blushBlock}
  ${eyes}
  ${glassesBlock}
  <g id="panda-mouth">${mouthInner}</g>
  ${leafBlock}
  ${hatBlock}
</svg>`;
}

module.exports = { generateAvatarVectorPanda };
