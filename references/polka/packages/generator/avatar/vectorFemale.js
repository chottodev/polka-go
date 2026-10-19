'use strict';

const path = require('path');

const { parseSize, normalizeHex, seededIndex } = require('./utils');
const { readSvgInnerFrom, stripInkscapeSodipodiMarkup } = require('./vectorAssetSvg');

const ASSETS_DIR = path.join(__dirname, 'assets', 'female');

const BG_PRESETS = [
  'f5e6f0',
  'e8d8f5',
  'f5e8d8',
  'd8f0e8',
  'f0d8e8',
  'e8f0d8',
  'f5d8e8',
  'd8e8f5',
  'f0e8d8',
  'e8d8f0',
  'fce4ec',
  'e8eaf6',
  'e0f2f1',
  'fff8e1',
  'f3e5f5',
];

const EYES_FILES = [
  'eyes/eye-01.svg',
  'eyes/eye-02.svg',
  'eyes/eye-03.svg',
  'eyes/eye-04.svg',
  'eyes/eye-05.svg',
];

const BROWS_FILES = [
  'brows/brow-01.svg',
  'brows/brow-02.svg',
];

const HAIR_FILES = [
  'hairs/hair-01.svg',
  'hairs/hair-02.svg',
  'hairs/hair-03.svg',
  'hairs/hair-04.svg',
  'hairs/hair-05.svg',
  'hairs/hair-06.svg',
];

const CLOTH_FILES = [
  'cloth/cloth-01.svg',
  'cloth/cloth-02.svg',
  'cloth/cloth-03.svg',
  'cloth/cloth-04.svg',
];

// Cloth color presets: base (main), shade (shadow), dark (darker shadow)
const CLOTH_FILL_PRESETS = [
  { base: 'c34132', shade: 'a9392b', dark: '8a2d22' },
  { base: '2f6db3', shade: '24528a', dark: '1a3d6b' },
  { base: '2f8f5b', shade: '226a43', dark: '174d30' },
  { base: '7d4bb3', shade: '5f3889', dark: '452868' },
  { base: 'b36a2f', shade: '8a5123', dark: '663c1a' },
  { base: '4a4a4a', shade: '2f2f2f', dark: '1a1a1a' },
  { base: 'b03060', shade: '8a2449', dark: '661833' },
  { base: '2f8fa0', shade: '226a78', dark: '174d58' },
];

const MOUTH_FILES = [
  'mouths/mouth-01.svg',
  'mouths/mouth-02.svg',
  'mouths/mouth-03.svg',
  'mouths/mouth-04.svg',
  'mouths/mouth-05.svg',
];

const NOSE_FILES = [
  'noses/nose-01.svg',
  'noses/nose-02.svg',
];

const BLUSH_FILE = 'blush/blush-01.svg';

const ACCESSORY_PRESETS = [
  {
    id: 'earrings01',
    rel: 'accessories/earrings-01.svg',
    transform: null,
    drawAfterFace: true,
  },
  {
    id: 'earrings02',
    rel: 'accessories/earrings-02.svg',
    transform: null,
    drawAfterFace: true,
  },
  {
    id: 'necklace01',
    rel: 'accessories/necklace-01.svg',
    transform: null,
    drawAfterFace: true,
  },
  {
    id: 'hairband01',
    rel: 'accessories/hairband-01.svg',
    transform: null,
    drawAfterFace: true,
  },
  {
    id: 'glasses01',
    rel: 'accessories/glasses-01.svg',
    transform: null,
    drawAfterFace: false,
    drawBeforeHair: true,
  },
];

const ACCESSORY_COLOR_PRESETS = [
  '1b8cff',
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
  'ec4899',
  'f59e0b',
];

// Hair color presets — same warm palette as man
const HAIR_FILL_PRESETS = [
  '1f1a17',
  '2b211d',
  '3a2a22',
  '4a3428',
  '5a4130',
  '6a4d38',
  '7a5a42',
  'cc931f',
  'a84f2a',
  'c35521',
  '8b4513',
  'd2691e',
];

function readSvgInner(rel) {
  return readSvgInnerFrom(ASSETS_DIR, rel);
}

function paintFemaleAccessoryInner(inner, seed, accId) {
  const color = ACCESSORY_COLOR_PRESETS[seededIndex(String(seed) + ':female-acc-color', ACCESSORY_COLOR_PRESETS.length)];
  const [r, g, b] = [parseInt(color.slice(0,2),16), parseInt(color.slice(2,4),16), parseInt(color.slice(4,6),16)];
  const lighten = (c, a) => Math.min(255, c + a).toString(16).padStart(2,'0');
  const colorLight = `${lighten(r,40)}${lighten(g,40)}${lighten(b,40)}`;
  const colorMid   = `${lighten(r,20)}${lighten(g,20)}${lighten(b,20)}`;

  if (accId === 'necklace01') {
    // pick independent colors for each element of the necklace
    const chain  = ACCESSORY_COLOR_PRESETS[seededIndex(String(seed) + ':necklace-chain',  ACCESSORY_COLOR_PRESETS.length)];
    const drop   = ACCESSORY_COLOR_PRESETS[seededIndex(String(seed) + ':necklace-drop',   ACCESSORY_COLOR_PRESETS.length)];
    const center = ACCESSORY_COLOR_PRESETS[seededIndex(String(seed) + ':necklace-center', ACCESSORY_COLOR_PRESETS.length)];
    const bead1  = ACCESSORY_COLOR_PRESETS[seededIndex(String(seed) + ':necklace-bead1',  ACCESSORY_COLOR_PRESETS.length)];
    const bead2  = ACCESSORY_COLOR_PRESETS[seededIndex(String(seed) + ':necklace-bead2',  ACCESSORY_COLOR_PRESETS.length)];
    return inner
      .replace(/fill:#5A482E/gi,  `fill:#${chain}`)   // chain/cord
      .replace(/fill:#53E7D3/gi,  `fill:#${drop}`)    // teardrop outer
      .replace(/fill:#37C4B3/gi,  `fill:#${center}`)  // teardrop inner circle
      .replace(/fill:#FDF276/gi,  `fill:#${center}`)  // center pendant circle
      .replace(/fill:#E28883/gi,  `fill:#${bead1}`)   // side beads
      .replace(/fill:#E3DAB3/gi,  `fill:#${bead2}`);  // corner beads
  }

  if (accId === 'glasses01') {
    const frame = ACCESSORY_COLOR_PRESETS[seededIndex(String(seed) + ':glasses-frame', ACCESSORY_COLOR_PRESETS.length)];
    const lens  = ACCESSORY_COLOR_PRESETS[seededIndex(String(seed) + ':glasses-lens',  ACCESSORY_COLOR_PRESETS.length)];
    return inner
      .replace(/fill="#31373D"/gi, `fill="#${frame}"`)
      .replace(/fill:#70687b/gi,   `fill:#${lens}`);
  }

  if (accId === 'hairband01') {
    const main  = ACCESSORY_COLOR_PRESETS[seededIndex(String(seed) + ':hairband-main',  ACCESSORY_COLOR_PRESETS.length)];
    const shade = ACCESSORY_COLOR_PRESETS[seededIndex(String(seed) + ':hairband-shade', ACCESSORY_COLOR_PRESETS.length)];
    return inner
      .replace(/fill="#EA839E"/gi, `fill="#${main}"`)
      .replace(/fill="#B93A3C"/gi, `fill="#${shade}"`);
  }

  return inner
    // earrings-01 colors
    .replace(/stroke="#1b8cff"/gi, `stroke="#${color}"`)
    .replace(/fill="#1b8cff"/gi,   `fill="#${color}"`)
    // earrings-02 style attribute colors
    .replace(/fill:#16786C/gi, `fill:#${color}`)
    .replace(/fill:#36E3CC/gi, `fill:#${colorLight}`)
    .replace(/fill:#37C4B3/gi, `fill:#${colorMid}`)
    .replace(/fill:#53E7D3/gi, `fill:#${colorLight}`)
    .replace(/fill:#EFBA50/gi, `fill:#${colorLight}`)
    .replace(/fill:#FDF276/gi, `fill:#${colorLight}`)
    .replace(/fill:#E28883/gi, `fill:#${colorMid}`)
    .replace(/fill:#E3DAB3/gi, `fill:#${colorMid}`)
    .replace(/fill:#16786c/gi, `fill:#${color}`)
    .replace(/fill:#36e3cc/gi, `fill:#${colorLight}`)
    .replace(/fill:#37c4b3/gi, `fill:#${colorMid}`)
    .replace(/fill:#53e7d3/gi, `fill:#${colorLight}`)
    .replace(/fill:#efba50/gi, `fill:#${colorLight}`)
    .replace(/fill:#fdf276/gi, `fill:#${colorLight}`)
    .replace(/fill:#e28883/gi, `fill:#${colorMid}`)
    .replace(/fill:#e3dab3/gi, `fill:#${colorMid}`);
}

function pickFemaleAccessoryPreset(seed) {
  const r = seededIndex(String(seed) + ':female-acc', 100);
  if (r < 50) return null;
  const idx = seededIndex(String(seed) + ':female-acc-preset', ACCESSORY_PRESETS.length);
  return ACCESSORY_PRESETS[idx];
}

function femaleBgHex(seed, explicitBg) {
  const fallback = BG_PRESETS[seededIndex(String(seed) + ':female-bg', BG_PRESETS.length)];
  return normalizeHex(explicitBg, fallback);
}

function pickFemaleHairFillHex(seed) {
  return HAIR_FILL_PRESETS[seededIndex(String(seed) + ':female-hair-fill', HAIR_FILL_PRESETS.length)];
}

// --- HSL color helpers for multi-shade hair painting ---

function hexToRgb(hex) {
  const h = hex.replace(/^#/, '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `${f(0)}${f(8)}${f(4)}`;
}

function buildHairShades(baseHex) {
  const [r, g, b] = hexToRgb(baseHex);
  const [h, s, l] = rgbToHsl(r, g, b);
  return {
    base:  baseHex,
    mid:   hslToHex(h, s, l + 3),
    light: hslToHex(h, s, l + 18),
    dark:  hslToHex(h, s, Math.max(0, l - 8)),
  };
}

/**
 * Paint female brow SVG — replaces the original color with the hair color.
 * Original color in brow-01.svg: #A13818
 */
function paintFemaleBrowInner(inner, fillHex) {
  return inner
    .replace(/fill="#A13818"/gi, `fill="#${fillHex}"`);
}

/**
 * Paint female hair SVG — replaces the original orange/brown tones
 * from hair-01.svg with the chosen seed-based color.
 * Original colors in the asset: #C35521, #C35420, #C45521, #A13618, #A23618, #A23718
 */
function paintFemaleHairInner(inner, fillHex) {
  const shades = buildHairShades(fillHex);
  return inner
    .replace(/fill="#C35521"/gi, `fill="#${shades.base}"`)
    .replace(/fill="#C35420"/gi, `fill="#${shades.base}"`)
    .replace(/fill="#C45521"/gi, `fill="#${shades.base}"`)
    .replace(/fill="#A13618"/gi, `fill="#${shades.dark}"`)
    .replace(/fill="#A23618"/gi, `fill="#${shades.dark}"`)
    .replace(/fill="#A23718"/gi, `fill="#${shades.dark}"`)
    .replace(/fill="#A03618"/gi, `fill="#${shades.dark}"`)
    // hair-02 colors
    .replace(/fill="#261815"/gi, `fill="#${shades.base}"`)
    .replace(/fill="#3C2923"/gi, `fill="#${shades.base}"`)
    .replace(/fill="#2E1E19"/gi, `fill="#${shades.dark}"`)
    // hair-03 colors
    .replace(/fill="#251613"/gi, `fill="#${shades.base}"`)
    .replace(/fill="#5C3D29"/gi, `fill="#${shades.mid}"`)
    .replace(/fill="#5B3D29"/gi, `fill="#${shades.mid}"`)
    .replace(/fill="#5B3C29"/gi, `fill="#${shades.mid}"`)
    .replace(/fill="#5A3C29"/gi, `fill="#${shades.mid}"`)
    .replace(/fill="#5C3E2A"/gi, `fill="#${shades.mid}"`)
    .replace(/fill="#5A3D29"/gi, `fill="#${shades.mid}"`)
    // hair-04 colors
    .replace(/fill="#271815"/gi, `fill="#${shades.base}"`)
    .replace(/fill="#593D2C"/gi, `fill="#${shades.mid}"`)
    .replace(/fill="#5B3E2C"/gi, `fill="#${shades.mid}"`)
    .replace(/fill="#5A3E2C"/gi, `fill="#${shades.mid}"`)
    .replace(/fill="#5A3D2C"/gi, `fill="#${shades.mid}"`)
    // hair-05 colors
    .replace(/fill="#2c1c15"/gi, `fill="#${shades.base}"`)
    .replace(/fill="#2c1d15"/gi, `fill="#${shades.base}"`)
    .replace(/fill="#2d1d16"/gi, `fill="#${shades.base}"`)
    .replace(/fill="#2D1D17"/gi, `fill="#${shades.base}"`)
    .replace(/fill="#2C1C16"/gi, `fill="#${shades.base}"`)
    .replace(/fill="#3e2b24"/gi, `fill="#${shades.mid}"`)
    .replace(/fill="#3f2c24"/gi, `fill="#${shades.mid}"`)
    .replace(/fill="#3f2c25"/gi, `fill="#${shades.mid}"`)
    .replace(/fill="#3F2C25"/gi, `fill="#${shades.mid}"`)
    .replace(/fill="#854A29"/gi, `fill="#${shades.light}"`)
    // hair-06 colors
    .replace(/fill="#de491e"/gi, `fill="#${shades.light}"`)
    .replace(/fill="#dd4b20"/gi, `fill="#${shades.light}"`)
    .replace(/fill="#bd2e15"/gi, `fill="#${shades.base}"`)
    .replace(/fill="#bd2e16"/gi, `fill="#${shades.base}"`)
    .replace(/fill="#BD2E15"/gi, `fill="#${shades.base}"`);
}

/**
 * Paint female cloth SVG — replaces the original white/grey tones
 * from cloth-01.svg with the chosen seed-based color scheme.
 * Original colors: #FEFEFE (base), #D7DADE (shade), #D4D7DC (dark)
 */
function paintFemaleClothInner(inner, seed) {
  const scheme = CLOTH_FILL_PRESETS[seededIndex(String(seed) + ':female-cloth-fill', CLOTH_FILL_PRESETS.length)];
  return inner
    // cloth-01 colors
    .replace(/fill="#FEFEFE"/gi, `fill="#${scheme.base}"`)
    .replace(/fill="#D7DADE"/gi, `fill="#${scheme.shade}"`)
    .replace(/fill="#D4D7DC"/gi, `fill="#${scheme.dark}"`)
    // cloth-02 colors
    .replace(/fill="#FBF7F3"/gi, `fill="#${scheme.base}"`)
    .replace(/fill="#FBF7F2"/gi, `fill="#${scheme.base}"`)
    .replace(/fill="#D3D7DC"/gi, `fill="#${scheme.shade}"`)
    .replace(/fill="#D0D5D9"/gi, `fill="#${scheme.shade}"`)
    .replace(/fill="#D9DADB"/gi, `fill="#${scheme.shade}"`)
    .replace(/fill="#CBD1D6"/gi, `fill="#${scheme.dark}"`)
    .replace(/fill="#A3B2BE"/gi, `fill="#${scheme.dark}"`)
    .replace(/fill="#C6C3C1"/gi, `fill="#${scheme.dark}"`)
    // cloth-03 colors
    .replace(/fill="#FCF6ED"/gi, `fill="#${scheme.base}"`)
    .replace(/fill="#DCCEC0"/gi, `fill="#${scheme.shade}"`)
    // cloth-04 colors
    .replace(/fill="#F1E2C1"/gi, `fill="#${scheme.base}"`)
    .replace(/fill="#6C4B38"/gi, `fill="#${scheme.shade}"`)
    .replace(/fill="#6C4C39"/gi, `fill="#${scheme.shade}"`)
    .replace(/fill="#6D4D39"/gi, `fill="#${scheme.shade}"`)
    .replace(/fill="#6C4A37"/gi, `fill="#${scheme.shade}"`)
    .replace(/fill="#6B4A37"/gi, `fill="#${scheme.shade}"`)
    .replace(/fill="#366938"/gi, `fill="#${scheme.dark}"`)
    .replace(/fill="#07451A"/gi, `fill="#${scheme.dark}"`)
    .replace(/fill="#9B442B"/gi, `fill="#${scheme.dark}"`)
    .replace(/fill="#672016"/gi, `fill="#${scheme.dark}"`)
    .replace(/fill="#B97452"/gi, `fill="#${scheme.shade}"`);
}

function generateAvatarVectorFemale({ size, bg, seed = '' }) {
  const s = parseSize(size, 32, 1024, 128);
  const bgHex = femaleBgHex(seed, bg);

  const baseInner = stripInkscapeSodipodiMarkup(readSvgInner('base.svg'));

  const clothRel = CLOTH_FILES[seededIndex(String(seed) + ':female-cloth', CLOTH_FILES.length)];
  const clothInner = paintFemaleClothInner(stripInkscapeSodipodiMarkup(readSvgInner(clothRel)), seed);

  const hairFillHex = pickFemaleHairFillHex(seed);
  const hairRel = HAIR_FILES[seededIndex(String(seed) + ':female-hair', HAIR_FILES.length)];
  const hairInner = paintFemaleHairInner(stripInkscapeSodipodiMarkup(readSvgInner(hairRel)), hairFillHex);

  const eyesRel = EYES_FILES[seededIndex(String(seed) + ':female-eyes', EYES_FILES.length)];
  const eyesInner = stripInkscapeSodipodiMarkup(readSvgInner(eyesRel));

  const browsRel = BROWS_FILES[seededIndex(String(seed) + ':female-brows', BROWS_FILES.length)];
  const browsInner = paintFemaleBrowInner(stripInkscapeSodipodiMarkup(readSvgInner(browsRel)), hairFillHex);

  const mouthRel = MOUTH_FILES[seededIndex(String(seed) + ':female-mouth', MOUTH_FILES.length)];
  const mouthInner = stripInkscapeSodipodiMarkup(readSvgInner(mouthRel));

  const noseRel = NOSE_FILES[seededIndex(String(seed) + ':female-nose', NOSE_FILES.length)];
  const noseInner = stripInkscapeSodipodiMarkup(readSvgInner(noseRel));

  const blushInner = stripInkscapeSodipodiMarkup(readSvgInner(BLUSH_FILE));
  const blushBlock = seededIndex(String(seed) + ':female-blush', 100) < 50
    ? `<g id="female-blush">${blushInner}</g>`
    : '';

  const accPreset = pickFemaleAccessoryPreset(seed);
  const accInnerRaw = accPreset ? readSvgInner(accPreset.rel) : '';
  const accInner = accInnerRaw ? stripInkscapeSodipodiMarkup(accInnerRaw) : '';
  const accPainted = accPreset && accInner ? paintFemaleAccessoryInner(accInner, seed, accPreset.id) : '';
  const accessoryBlock = accPreset && accPainted
    ? `<g id="female-accessory"${accPreset.transform ? ` transform="${accPreset.transform}"` : ''}>${accPainted}</g>`
    : '';
  const accessoryBlockBefore     = accPreset && !accPreset.drawAfterFace && !accPreset.drawBeforeHair ? accessoryBlock : '';
  const accessoryBlockBeforeHair = accPreset &&  accPreset.drawBeforeHair ? accessoryBlock : '';
  const accessoryBlockAfter      = accPreset &&  accPreset.drawAfterFace  ? accessoryBlock : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 1028 1024">
  <rect width="1028" height="1024" fill="#${bgHex}"/>
  <g id="female-art">
    <g id="female-base">${baseInner}</g>
    <g id="female-cloth">${clothInner}</g>
    ${accessoryBlockBefore}
    <g id="female-eyes">${eyesInner}</g>
    <g id="female-brows">${browsInner}</g>
    ${blushBlock}
    ${accessoryBlockBeforeHair}
    <g id="female-hair">${hairInner}</g>
    <g id="female-nose">${noseInner}</g>
    <g id="female-mouth">${mouthInner}</g>
    ${accessoryBlockAfter}
  </g>
</svg>`;
}

module.exports = { generateAvatarVectorFemale };
