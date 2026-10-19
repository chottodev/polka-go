'use strict';

const path = require('path');

const { parseSize, normalizeHex, seededIndex } = require('./utils');
const { readSvgInnerFrom, stripInkscapeSodipodiMarkup } = require('./vectorAssetSvg');

const ASSETS_DIR = path.join(__dirname, 'assets', 'cat');

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

const EYE_FILES = ['eyes/sclera-01.svg', 'eyes/sclera-02.svg', 'eyes/sclera-03.svg', 'eyes/sclera-04.svg', 'eyes/sclera-05.svg', 'eyes/sclera-06.svg'];
const MOUTH_FILES = ['mouths/mouth-01.svg', 'mouths/mouth-02.svg', 'mouths/mouth-03.svg', 'mouths/mouth-04.svg', 'mouths/mouth-05.svg'];
const CAT_ART_TRANSFORM = 'translate(20, 60)';

const ACCESSORY_PRESETS = [
  {
    id: 'glasses01',
    rel: 'accessories/glasses-01.svg',
    transform: 'translate(-10, -46)',
    drawAfterFace: true,
  },
  {
    id: 'bowTie01',
    rel: 'accessories/bow-tie-01.svg',
    transform: 'translate(-14, -24)',
    drawAfterFace: true,
  },
  {
    id: 'headphones01',
    rel: 'accessories/headphones-01.svg',
    transform: 'translate(-10, 0)',
    drawAfterFace: true,
  },
  {
    id: 'pawsMug01',
    rel: 'accessories/paws-mug-01.svg',
    transform: null,
    drawAfterFace: true,
  },
  {
    id: 'artistHat01',
    rel: 'accessories/artist-hat-01.svg',
    transform: 'translate(-14, -36) translate(512, 400) scale(1.08) translate(-512, -400)',
    drawAfterFace: true,
  },
  {
    id: 'stripedBeanie01',
    rel: 'accessories/striped-beanie-01.svg',
    transform: null,
  },
  {
    id: 'pirateHat01',
    rel: 'accessories/pirate-hat-01.svg',
    transform: 'translate(-14, -36) translate(512, 400) scale(1.08) translate(-512, -400)',
    drawAfterFace: true,
  },
];

const BEANIE_FILL_PRESETS = [
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

function pickBeanieFillHex(seed) {
  return BEANIE_FILL_PRESETS[seededIndex(String(seed) + ':cat-beanie-fill', BEANIE_FILL_PRESETS.length)];
}

function pickArtistHatFillHex(seed) {
  return BEANIE_FILL_PRESETS[seededIndex(String(seed) + ':cat-artist-hat-fill', BEANIE_FILL_PRESETS.length)];
}

function pickArtistSplatFillHex(seed) {
  return BEANIE_FILL_PRESETS[seededIndex(String(seed) + ':cat-artist-splat-fill', BEANIE_FILL_PRESETS.length)];
}

function pickPawsMugFillHex(seed) {
  return BEANIE_FILL_PRESETS[seededIndex(String(seed) + ':cat-paws-mug-fill', BEANIE_FILL_PRESETS.length)];
}

function pickHeadphonesFillHex(seed) {
  return BEANIE_FILL_PRESETS[seededIndex(String(seed) + ':cat-headphones-fill', BEANIE_FILL_PRESETS.length)];
}

function pickBowTieFillHex(seed) {
  return BEANIE_FILL_PRESETS[seededIndex(String(seed) + ':cat-bow-tie-fill', BEANIE_FILL_PRESETS.length)];
}

function pickGlassesFillHex(seed) {
  return BEANIE_FILL_PRESETS[seededIndex(String(seed) + ':cat-glasses-fill', BEANIE_FILL_PRESETS.length)];
}

function paintStripedBeanieInner(inner, seed) {
  const main = pickBeanieFillHex(seed);
  const darkStrong = darkenHex(main, 44);
  const darkMid = darkenHex(main, 36);
  const darkSoft = darkenHex(main, 28);
  const lightHi = lightenHex(main, 60);
  const lightLo = lightenHex(main, 52);
  return inner
    .replace(/fill="#8D96C9"/gi, `fill="#${darkStrong}"`)
    .replace(/fill="#8D97CA"/gi, `fill="#${darkMid}"`)
    .replace(/fill="#8E98CA"/gi, `fill="#${darkSoft}"`)
    .replace(/fill="#DBE3EF"/gi, `fill="#${lightHi}"`)
    .replace(/fill="#DAE2EF"/gi, `fill="#${lightLo}"`);
}

function paintArtistHatInner(inner, seed) {
  const main = pickArtistHatFillHex(seed);
  const splat = pickArtistSplatFillHex(seed);
  const light = lightenHex(main, 12);
  const mid = darkenHex(main, 10);
  const dark = darkenHex(main, 24);
  return inner
    .replace(/fill="#444C70"/gi, `fill="#${light}"`)
    .replace(/fill="#2D395B"/gi, `fill="#${mid}"`)
    .replace(/fill="#2D3A5B"/gi, `fill="#${dark}"`)
    .replace(/fill="#E59754"/gi, `fill="#${splat}"`);
}

function paintPawsMugInner(inner, seed) {
  const main = pickPawsMugFillHex(seed);
  const mugMain = darkenHex(main, 8);
  const mugLight = lightenHex(main, 14);
  return inner
    .replace(/fill="#63AC54"/gi, `fill="#${mugMain}"`)
    .replace(/fill="#94BE61"/gi, `fill="#${mugLight}"`);
}

function paintHeadphonesInner(inner, seed) {
  const main = pickHeadphonesFillHex(seed);
  return inner.replace(/fill="#46A9A0"/gi, `fill="#${main}"`);
}

function paintBowTieInner(inner, seed) {
  const main = pickBowTieFillHex(seed);
  const light = lightenHex(main, 16);
  const lightSoft = lightenHex(main, 10);
  const dark = darkenHex(main, 14);
  const darkSoft = darkenHex(main, 8);
  return inner
    .replace(/fill="#E75E5D"/gi, `fill="#${light}"`)
    .replace(/fill="#E75E5C"/gi, `fill="#${lightSoft}"`)
    .replace(/fill="#E75F5D"/gi, `fill="#${light}"`)
    .replace(/fill="#D13A47"/gi, `fill="#${dark}"`)
    .replace(/fill="#D03A47"/gi, `fill="#${darkSoft}"`);
}

function paintGlassesInner(inner, seed) {
  const main = pickGlassesFillHex(seed);
  const lens = lightenHex(main, 78);
  return inner
    .replace(/fill="#53473F"/gi, `fill="#${main}"`)
    .replace(/fill:#f6d5ff/gi, `fill:#${lens}`);
}

function paintAccessoryInner(accPreset, inner, seed) {
  if (!accPreset) return inner;
  if (accPreset.id === 'glasses01') return paintGlassesInner(inner, seed);
  if (accPreset.id === 'bowTie01') return paintBowTieInner(inner, seed);
  if (accPreset.id === 'headphones01') return paintHeadphonesInner(inner, seed);
  if (accPreset.id === 'pawsMug01') return paintPawsMugInner(inner, seed);
  if (accPreset.id === 'artistHat01') return paintArtistHatInner(inner, seed);
  if (accPreset.id === 'stripedBeanie01') return paintStripedBeanieInner(inner, seed);
  return inner;
}

function catBgHex(seed, explicitBg) {
  const fallback = BG_PRESETS[seededIndex(String(seed) + ':cat-bg', BG_PRESETS.length)];
  return normalizeHex(explicitBg, fallback);
}

function pickAccessoryPreset(seed) {
  const r = seededIndex(String(seed) + ':cat-acc', 100);
  if (r < 55) return null;
  const idx = seededIndex(String(seed) + ':cat-acc-preset', ACCESSORY_PRESETS.length);
  return ACCESSORY_PRESETS[idx];
}

function generateAvatarVectorCat({ size, bg, seed = '' }) {
  const s = parseSize(size, 32, 1024, 128);
  const bgHex = catBgHex(seed, bg);

  const baseInner = stripInkscapeSodipodiMarkup(readSvgInner('base.svg'));

  const eyeRel = EYE_FILES[seededIndex(String(seed) + ':cat-eyes', EYE_FILES.length)];
  const eyesInner = stripInkscapeSodipodiMarkup(readSvgInner(eyeRel));

  const mouthRel = MOUTH_FILES[seededIndex(String(seed) + ':cat-mouth', MOUTH_FILES.length)];
  const mouthInner = stripInkscapeSodipodiMarkup(readSvgInner(mouthRel));

  const accPreset = pickAccessoryPreset(seed);
  const accInnerRaw = accPreset ? readSvgInner(accPreset.rel) : '';
  const accInner = accInnerRaw ? stripInkscapeSodipodiMarkup(accInnerRaw) : '';
  const accPainted = accPreset && accInner ? paintAccessoryInner(accPreset, accInner, seed) : '';
  const accessoryBlock = accPreset && accPainted
    ? `<g id="cat-accessory"${accPreset.transform ? ` transform="${accPreset.transform}"` : ''}>${accPainted}</g>`
    : '';

  const faceLayers = `<g id="cat-eyes">${eyesInner}</g>
    <g id="cat-mouth">${mouthInner}</g>`;

  const catArtInner = accPreset && accPreset.drawAfterFace
    ? `<g id="cat-base">${baseInner}</g>
    ${faceLayers}
    ${accessoryBlock}`
    : `<g id="cat-base">${baseInner}</g>
    ${accessoryBlock}
    ${faceLayers}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#${bgHex}"/>
  <g id="cat-art" transform="${CAT_ART_TRANSFORM}">
    ${catArtInner}
  </g>
</svg>`;
}

module.exports = { generateAvatarVectorCat };

