'use strict';

const path = require('path');

const { parseSize, normalizeHex, seededIndex } = require('./utils');
const { readSvgInnerFrom, stripInkscapeSodipodiMarkup } = require('./vectorAssetSvg');

const ASSETS_DIR = path.join(__dirname, 'assets', 'dog');

const BG_PRESETS = [
  'c8dce8',
  'e8d8e5',
  'b0c7b6',
  'c2c768',
  'd8c8e8',
  'c8d8e8',
  'e0c8d0',
  'd0dfcc',
  'c8cce8',
  'd8c8e8',
  'c8e8e0',
  'e8d8c8',
  'd0d8e8',
  'c8e0d8',
  '9fc26d',
];

const EYE_PRESETS = [
  {
    id: 'sclera01',
    sclera: 'eyes/sclera-01.svg',
  },
  {
    id: 'sclera02',
    sclera: 'eyes/sclera-02.svg',
  },
];

const MOUTH_FILES = ['mouths/mouth-01.svg', 'mouths/mouth-02.svg', 'mouths/mouth-03.svg'];
const BROW_FILES = ['brows/brow-01.svg', 'brows/brow-02.svg'];

const SCARF_FILL_PRESETS = [
  'da5340',
  '2563eb',
  '16a34a',
  '7c3aed',
  '0d9488',
  'b45309',
  'be123c',
  '0f766e',
  '1d4ed8',
  'c2410c',
];

const ACCESSORY_PRESETS = [
  {
    id: 'paw01',
    rel: 'accessories/paw-01.svg',
    transform: 'translate(750, 780) scale(0.525) rotate(-8) translate(-512, -512)',
  },
  {
    id: 'scarf01',
    rel: 'accessories/scarf-01.svg',
    transform: null,
  },
  {
    id: 'glasses01',
    rel: 'accessories/glasses-01.svg',
    transform: 'translate(0, 18)',
  },
  {
    id: 'headset01',
    rel: 'accessories/headset-01.svg',
    transform: null,
  },
  {
    id: 'cap01',
    rel: 'accessories/cap-01.svg',
    transform: 'translate(256, 140) scale(0.33333335)',
  },
];

function readSvgInner(rel) {
  return readSvgInnerFrom(ASSETS_DIR, rel);
}

function clamp8(n) {
  return Math.max(0, Math.min(255, n));
}

function hex2(n) {
  return n.toString(16).padStart(2, '0');
}

function darkenHex(hex, amount = 38) {
  const h = String(hex || '').replace(/^#/, '').toLowerCase();
  if (!/^[0-9a-f]{6}$/.test(h)) return h;
  const r = clamp8(parseInt(h.slice(0, 2), 16) - amount);
  const g = clamp8(parseInt(h.slice(2, 4), 16) - amount);
  const b = clamp8(parseInt(h.slice(4, 6), 16) - amount);
  return `${hex2(r)}${hex2(g)}${hex2(b)}`;
}

function lightenHex(hex, amount = 38) {
  const h = String(hex || '').replace(/^#/, '').toLowerCase();
  if (!/^[0-9a-f]{6}$/.test(h)) return h;
  const r = clamp8(parseInt(h.slice(0, 2), 16) + amount);
  const g = clamp8(parseInt(h.slice(2, 4), 16) + amount);
  const b = clamp8(parseInt(h.slice(4, 6), 16) + amount);
  return `${hex2(r)}${hex2(g)}${hex2(b)}`;
}

function pickScarfFillHex(seed) {
  return SCARF_FILL_PRESETS[seededIndex(String(seed) + ':dog-scarf-fill', SCARF_FILL_PRESETS.length)];
}

function paintScarfInner(inner, seed) {
  const main = pickScarfFillHex(seed);
  const shadow = darkenHex(main, 42);
  return inner.replace(/fill="#DA5340"/gi, `fill="#${main}"`).replace(/fill="#A4362C"/gi, `fill="#${shadow}"`);
}

function paintCapInner(inner, seed) {
  const main = pickScarfFillHex(seed);
  const dark = darkenHex(main, 70);
  const light = lightenHex(main, 40);
  return inner
    .replace(/fill="#EC2827"/gi, `fill="#${main}"`)
    .replace(/fill="#AB0409"/gi, `fill="#${dark}"`)
    .replace(/fill="#AA0409"/gi, `fill="#${dark}"`)
    .replace(/fill="#F25451"/gi, `fill="#${light}"`);
}

function paintAccessoryInner(accPreset, inner, seed) {
  if (!accPreset) return inner;
  if (accPreset.id === 'scarf01') return paintScarfInner(inner, seed);
  if (accPreset.id === 'glasses01') {
    const fill = pickScarfFillHex(seed);
    return inner.replace(/fill="#53473F"/gi, `fill="#${fill}"`);
  }
  if (accPreset.id === 'cap01') return paintCapInner(inner, seed);
  return inner;
}

function dogBgHex(seed, explicitBg) {
  const fallback = BG_PRESETS[seededIndex(String(seed) + ':dog-bg', BG_PRESETS.length)];
  return normalizeHex(explicitBg, fallback);
}

function buildEyesGroup(preset) {
  const eyesInner = readSvgInner(preset.sclera);
  return `<g id="dog-eyes">${eyesInner}</g>`;
}

function buildBrowsGroup(browRel) {
  const browsInner = readSvgInner(browRel);
  return `<g id="dog-brows">${browsInner}</g>`;
}

function pickAccessoryPreset(seed) {
  // Аксессуар показываем не всегда, и только один за раз.
  const r = seededIndex(String(seed) + ':dog-acc', 100);
  if (r < 55) return null;
  const idx = seededIndex(String(seed) + ':dog-acc-preset', ACCESSORY_PRESETS.length);
  return ACCESSORY_PRESETS[idx];
}

function generateAvatarVectorDog({ size, bg, seed = '' }) {
  const s = parseSize(size, 32, 1024, 128);
  const bgHex = dogBgHex(seed, bg);

  const baseInner = stripInkscapeSodipodiMarkup(readSvgInner('base.svg'));

  const eyePreset = EYE_PRESETS[seededIndex(String(seed) + ':dog-eyes', EYE_PRESETS.length)];
  const eyes = buildEyesGroup(eyePreset);

  const browRel = BROW_FILES[seededIndex(String(seed) + ':dog-brows', BROW_FILES.length)];
  const brows = buildBrowsGroup(browRel);

  const mouthRel = MOUTH_FILES[seededIndex(String(seed) + ':dog-mouth', MOUTH_FILES.length)];
  const mouthInner = readSvgInner(mouthRel);

  const accPreset = pickAccessoryPreset(seed);
  const accInnerRaw = accPreset ? readSvgInner(accPreset.rel) : '';
  const accInner = accInnerRaw ? stripInkscapeSodipodiMarkup(accInnerRaw) : '';
  const accPainted = accPreset && accInner ? paintAccessoryInner(accPreset, accInner, seed) : '';
  const accessoryBlock = accPreset && accPainted
    ? `<g id="dog-accessory"${accPreset.transform ? ` transform="${accPreset.transform}"` : ''}>${accPainted}</g>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#${bgHex}"/>
  <g id="dog-base">${baseInner}</g>
  ${eyes}
  ${brows}
  ${accessoryBlock}
  <g id="dog-mouth">${mouthInner}</g>
</svg>`;
}

module.exports = { generateAvatarVectorDog };

