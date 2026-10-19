'use strict';

const path = require('path');

const { parseSize, normalizeHex, seededIndex } = require('./utils');
const { readSvgInnerFrom, stripInkscapeSodipodiMarkup } = require('./vectorAssetSvg');

const ASSETS_DIR = path.join(__dirname, 'assets', 'man');

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
const EYES_FILES = ['eyes/eye-01.svg', 'eyes/eye-02.svg', 'eyes/eye-03.svg'];
const BROWS_FILES = ['brows/brow-01.svg', 'brows/brow-02.svg'];
const NOSE_FILES = ['noses/nose-01.svg', 'noses/nose-02.svg', 'noses/nose-03.svg'];
const MOUTH_FILES = ['mouths/mouth-01.svg', 'mouths/mouth-02.svg', 'mouths/mouth-03.svg', 'mouths/mouth-04.svg', 'mouths/mouth-05.svg'];
const HAIR_FILES = ['hairs/hair-01.svg', 'hairs/hair-02.svg', 'hairs/hair-03.svg', 'hairs/hair-04.svg', 'hairs/hair-05.svg', 'hairs/hair-06.svg', 'hairs/hair-07.svg'];
const BLUSH_FILE = 'blush/blush-01.svg';
const CLOTH_FILES = ['cloth/cloth-01.svg', 'cloth/cloth-02.svg', 'cloth/cloth-03.svg', 'cloth/cloth-04.svg', 'cloth/cloth-05.svg'];
const ACCESSORIES_FILES = ['accessories/glasses-01.svg', 'accessories/headphones-01.svg', 'accessories/headphones-02.svg'];
const BEARDS_FILES = ['beards/beard-01.svg', 'beards/beard-02.svg'];
const MUSTACHES_FILES = ['mustaches/mustache-01.svg', 'mustaches/mustache-02.svg', 'mustaches/mustache-03.svg', 'mustaches/mustache-04.svg'];
const CLOTH_FILL_PRESETS = [
  { base: 'c34132', shade: 'a9392b', accent: 'c34132', tie: '2f6db3' },
  { base: '2f6db3', shade: '24528a', accent: '2f6db3', tie: 'c34132' },
  { base: '2f8f5b', shade: '226a43', accent: '2f8f5b', tie: '7d4bb3' },
  { base: '7d4bb3', shade: '5f3889', accent: '7d4bb3', tie: 'b36a2f' },
  { base: 'b36a2f', shade: '8a5123', accent: 'b36a2f', tie: '2f8f5b' },
  { base: '4a4a4a', shade: '2f2f2f', accent: '4a4a4a', tie: 'c34132' },
];
const HAIR_BROW_FILL_PRESETS = ['1f1a17', '2b211d', '3a2a22', '4a3428', '5a4130', '6a4d38', '7a5a42', 'cc931f', 'a84f2a'];
const HEADPHONES_FILL_PRESETS = [
  { dark: '3E8937', light: 'BFDA6F', mid: '408A39' },
  { dark: '2f6db3', light: '7eb3e8', mid: '4a8bc7' },
  { dark: 'c34132', light: 'e88a7e', mid: 'd65a4a' },
  { dark: '7d4bb3', light: 'b88ae8', mid: '9a6bc7' },
  { dark: 'b36a2f', light: 'e8b87e', mid: 'c7894a' },
  { dark: '4a4a4a', light: '9a9a9a', mid: '6a6a6a' },
];
const GLASSES_FILL_PRESETS = [
  '2f2a25',
  '1a1a2e',
  'c0392b',
  '1a5276',
  '1e8449',
  '6c3483',
  'b7950b',
  '2e4057',
  'a04000',
  '212f3d',
];

function readSvgInner(rel) {
  return readSvgInnerFrom(ASSETS_DIR, rel);
}

function manBgHex(seed, explicitBg) {
  const fallback = BG_PRESETS[seededIndex(String(seed) + ':man-bg', BG_PRESETS.length)];
  return normalizeHex(explicitBg, fallback);
}

function paintManBaseInner(inner, bgHex) {
  return inner
    .replace(/fill="#ADD0DF"/gi, `fill="#${bgHex}"`);
}



function paintManClothInner(inner, seed) {
  const scheme = CLOTH_FILL_PRESETS[seededIndex(String(seed) + ':man-cloth-fill', CLOTH_FILL_PRESETS.length)];
  return inner
    .replace(/fill="#C34132"/gi, `fill="#${scheme.base}"`)
    .replace(/fill="#A9392B"/gi, `fill="#${scheme.shade}"`)
    .replace(/fill="#C34334"/gi, `fill="#${scheme.accent}"`)
    .replace(/fill="#A2C5E7"/gi, `fill="#${scheme.base}"`)
    .replace(/fill="#5788B7"/gi, `fill="#${scheme.shade}"`)
    .replace(/fill="#5587B6"/gi, `fill="#${scheme.accent}"`)
    .replace(/fill="#A1C4E5"/gi, `fill="#${scheme.base}"`)
    .replace(/fill="#F36925"/gi, `fill="#${scheme.base}"`)
    .replace(/fill="#C44E1A"/gi, `fill="#${scheme.shade}"`)
    .replace(/fill="#C24A16"/gi, `fill="#${scheme.shade}"`)
    .replace(/fill="#C14915"/gi, `fill="#${scheme.shade}"`)
    .replace(/fill="#B14214"/gi, `fill="#${scheme.shade}"`)
    .replace(/fill="#A03C13"/gi, `fill="#${scheme.shade}"`)
    .replace(/fill="#A43F15"/gi, `fill="#${scheme.accent}"`)
    // cloth-04 colors
    .replace(/fill="#59595B"/gi, `fill="#${scheme.base}"`)
    .replace(/fill="#5E6062"/gi, `fill="#${scheme.base}"`)
    .replace(/fill="#303137"/gi, `fill="#${scheme.base}"`)
    .replace(/fill="#38393F"/gi, `fill="#${scheme.base}"`)
    .replace(/fill="#39393F"/gi, `fill="#${scheme.base}"`)
    .replace(/fill="#37373E"/gi, `fill="#${scheme.base}"`)
    .replace(/fill="#2A2B30"/gi, `fill="#${scheme.shade}"`)
    .replace(/fill="#2A2B2F"/gi, `fill="#${scheme.shade}"`)
    // cloth-05 colors
    .replace(/fill="#303F5E"/gi, `fill="#${scheme.base}"`)
    .replace(/fill="#21314C"/gi, `fill="#${scheme.shade}"`)
    .replace(/fill="#64213A"/gi, `fill="#${scheme.tie}"`)
    .replace(/fill="#551932"/gi, `fill="#${scheme.tie}"`);
}

function pickManHairBrowFillHex(seed) {
  return HAIR_BROW_FILL_PRESETS[seededIndex(String(seed) + ':man-hair-brow-fill', HAIR_BROW_FILL_PRESETS.length)];
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

/**
 * Build a 3-shade palette from a base hex color, matching the relative
 * lightness offsets found in the original hair-02.svg artwork:
 *   base  ~ L=40  (#B8833C)
 *   mid   ~ L=43  (#BE8B40)  +3
 *   light ~ L=58  (#D7A557)  +18
 */
function buildHairShades(baseHex) {
  const [r, g, b] = hexToRgb(baseHex);
  const [h, s, l] = rgbToHsl(r, g, b);
  return {
    base:  baseHex,
    mid:   hslToHex(h, s, l + 3),
    light: hslToHex(h, s, l + 18),
  };
}

function paintManHairInner(inner, fillHex) {
  const shades = buildHairShades(fillHex);
  return inner
    // dark / base tones
    .replace(/fill="#6A4532"/gi, `fill="#${shades.base}"`)
    .replace(/fill="#B8833C"/gi, `fill="#${shades.base}"`)
    .replace(/fill="#B8833B"/gi, `fill="#${shades.base}"`)
    .replace(/fill="#0A0F14"/gi, `fill="#${shades.base}"`)
    .replace(/fill="#0E0D0F"/gi, `fill="#${shades.base}"`)
    .replace(/fill="#0E0E10"/gi, `fill="#${shades.base}"`)
    .replace(/fill="#0D0D0F"/gi, `fill="#${shades.base}"`)
    .replace(/fill="#121112"/gi, `fill="#${shades.base}"`)
    .replace(/fill="#141214"/gi, `fill="#${shades.base}"`)
    .replace(/fill="#241F1F"/gi, `fill="#${shades.mid}"`)
    .replace(/fill="#2A2424"/gi, `fill="#${shades.mid}"`)
    .replace(/fill="#2B2424"/gi, `fill="#${shades.mid}"`)
    .replace(/fill="#2C2525"/gi, `fill="#${shades.mid}"`)
    .replace(/fill="#131215"/gi, `fill="#${shades.base}"`)
    .replace(/fill="#0F1011"/gi, `fill="#${shades.base}"`)
    .replace(/fill="#212123"/gi, `fill="#${shades.base}"`)
    .replace(/fill="#202022"/gi, `fill="#${shades.base}"`)
    .replace(/fill="#2C2B2E"/gi, `fill="#${shades.mid}"`)
    .replace(/fill="#2B2A2D"/gi, `fill="#${shades.mid}"`)
    .replace(/fill="#2A292C"/gi, `fill="#${shades.mid}"`)
    .replace(/fill="#29292C"/gi, `fill="#${shades.mid}"`)
    .replace(/fill="#28282B"/gi, `fill="#${shades.mid}"`)
    .replace(/fill="#432015"/gi, `fill="#${shades.base}"`)
    .replace(/fill="#411F14"/gi, `fill="#${shades.base}"`)
    .replace(/fill="#230E07"/gi, `fill="#${shades.base}"`)
    .replace(/fill="#251009"/gi, `fill="#${shades.base}"`)
    .replace(/fill="#281109"/gi, `fill="#${shades.base}"`)
    .replace(/fill="#391A11"/gi, `fill="#${shades.base}"`)
    .replace(/fill="#250F08"/gi, `fill="#${shades.mid}"`)
    .replace(/fill="#230E08"/gi, `fill="#${shades.mid}"`)
    // mid tones
    .replace(/fill="#BE8B40"/gi, `fill="#${shades.mid}"`)
    // light / highlight tones
    .replace(/fill="#D7A557"/gi, `fill="#${shades.light}"`)
    .replace(/fill="#D6A456"/gi, `fill="#${shades.light}"`);
}

function paintManBrowInner(inner, fillHex) {
  return inner
    .replace(/fill="#423130"/gi, `fill="#${fillHex}"`)
    .replace(/fill="#C48E41"/gi, `fill="#${fillHex}"`);
}

function paintManBeardInner(inner, fillHex) {
  return inner
    .replace(/fill="#4C2F1F"/gi, `fill="#${fillHex}"`)
    .replace(/fill="#4c2f1f"/gi, `fill="#${fillHex}"`)
    .replace(/fill="#5F3A2A"/gi, `fill="#${fillHex}"`)
    .replace(/fill="#0E1012"/gi, `fill="#${fillHex}"`);
}

function paintManMustacheInner(inner, fillHex) {
  return inner
    .replace(/fill="#5F3A2A"/gi, `fill="#${fillHex}"`)
    .replace(/fill="#503223"/gi, `fill="#${fillHex}"`)
    .replace(/fill="#6F432E"/gi, `fill="#${fillHex}"`)
    .replace(/fill="#7D4B37"/gi, `fill="#${fillHex}"`);
}

function paintManHeadphonesInner(inner, seed) {
  const scheme = HEADPHONES_FILL_PRESETS[seededIndex(String(seed) + ':man-headphones-fill', HEADPHONES_FILL_PRESETS.length)];
  return inner
    .replace(/fill="#3E8937"/gi, `fill="#${scheme.dark}"`)
    .replace(/fill="#BFDA6F"/gi, `fill="#${scheme.light}"`)
    .replace(/fill="#408A39"/gi, `fill="#${scheme.mid}"`)
    .replace(/fill="#FDFCFB"/gi, `fill="#${scheme.light}"`)
    .replace(/fill="#FCFBFB"/gi, `fill="#${scheme.light}"`);
}

function paintManGlassesInner(inner, seed) {
  const color = GLASSES_FILL_PRESETS[seededIndex(String(seed) + ':man-glasses-fill', GLASSES_FILL_PRESETS.length)];
  return inner
    .replace(/fill="#2f2a25"/gi, `fill="#${color}"`)
    .replace(/fill:#2f2a25/gi, `fill:#${color}`);
}

function generateAvatarVectorMan({ size, bg, seed = '' }) {
  const s = parseSize(size, 32, 1024, 128);
  const bgHex = manBgHex(seed, bg);
  const baseInner = paintManBaseInner(stripInkscapeSodipodiMarkup(readSvgInner('base.svg')), bgHex);
  const hairBrowFillHex = pickManHairBrowFillHex(seed);
  const browRel = BROWS_FILES[seededIndex(String(seed) + ':man-brow', BROWS_FILES.length)];
  const browsInner = paintManBrowInner(stripInkscapeSodipodiMarkup(readSvgInner(browRel)), hairBrowFillHex);
  const eyesRel = EYES_FILES[seededIndex(String(seed) + ':man-eyes', EYES_FILES.length)];
  const eyesInner = stripInkscapeSodipodiMarkup(readSvgInner(eyesRel));
  const noseRel = NOSE_FILES[seededIndex(String(seed) + ':man-nose', NOSE_FILES.length)];
  const noseInner = stripInkscapeSodipodiMarkup(readSvgInner(noseRel));
  const mouthRel = MOUTH_FILES[seededIndex(String(seed) + ':man-mouth', MOUTH_FILES.length)];
  const mouthInner = stripInkscapeSodipodiMarkup(readSvgInner(mouthRel));
  const isMouthModern = mouthRel !== 'mouths/mouth-01.svg';
  const hairRel = HAIR_FILES[seededIndex(String(seed) + ':man-hair', HAIR_FILES.length)];
  const hairInner = paintManHairInner(stripInkscapeSodipodiMarkup(readSvgInner(hairRel)), hairBrowFillHex);
  const blushInner = stripInkscapeSodipodiMarkup(readSvgInner(BLUSH_FILE));
  const clothRel = CLOTH_FILES[seededIndex(String(seed) + ':man-cloth', CLOTH_FILES.length)];
  const clothInner = paintManClothInner(stripInkscapeSodipodiMarkup(readSvgInner(clothRel)), seed);
  const blushBlock = seededIndex(String(seed) + ':man-blush', 100) < 30 ? `<g id="man-blush">${blushInner}</g>` : '';
  const hasAccessory = seededIndex(String(seed) + ':man-accessory', 100) < 45;
  const accessoryRel = hasAccessory ? ACCESSORIES_FILES[seededIndex(String(seed) + ':man-accessory-pick', ACCESSORIES_FILES.length)] : null;
  const accessoryRaw = accessoryRel ? stripInkscapeSodipodiMarkup(readSvgInner(accessoryRel)) : null;
  const accessoryInner = accessoryRaw && accessoryRel === 'accessories/headphones-01.svg'
    ? paintManHeadphonesInner(accessoryRaw, seed)
    : accessoryRaw && accessoryRel === 'accessories/headphones-02.svg'
    ? paintManHeadphonesInner(accessoryRaw, seed)
    : accessoryRaw && accessoryRel === 'accessories/glasses-01.svg'
    ? paintManGlassesInner(accessoryRaw, seed)
    : accessoryRaw;
  const accessoryBlock = accessoryInner ? `<g id="man-accessory">${accessoryInner}</g>` : '';
  // Beard and mustache are mutually exclusive.
  // 0–39: beard (40%), 40–54: mustache (15%), 55–99: none (45%)
  const facialHairRoll = seededIndex(String(seed) + ':man-facial-hair', 100);
  const hasBeard = facialHairRoll < 40;
  const hasMustache = !hasBeard && facialHairRoll < 55;
  const beardRel = hasBeard ? BEARDS_FILES[seededIndex(String(seed) + ':man-beard-pick', BEARDS_FILES.length)] : null;
  const beardInner = beardRel ? paintManBeardInner(stripInkscapeSodipodiMarkup(readSvgInner(beardRel)), hairBrowFillHex) : null;
  const beardBlock = beardInner ? `<g id="man-beard">${beardInner}</g>` : '';
  const beardAllowsMouth = beardRel === 'beards/beard-02.svg';
  const mouthModernBlock = (isMouthModern && (!hasBeard || beardAllowsMouth)) ? `<g id="man-mouth">${mouthInner}</g>` : '';
  const mouthLegacyBlock = (!isMouthModern && (!hasBeard || beardAllowsMouth))
    ? `<g id="man-mouth" transform="translate(10, 20)">${mouthInner}</g>`
    : '';
  const mustacheRel = hasMustache ? MUSTACHES_FILES[seededIndex(String(seed) + ':man-mustache-pick', MUSTACHES_FILES.length)] : null;
  const mustacheInner = mustacheRel ? paintManMustacheInner(stripInkscapeSodipodiMarkup(readSvgInner(mustacheRel)), hairBrowFillHex) : null;
  const mustacheBlock = mustacheInner ? `<g id="man-mustache">${mustacheInner}</g>` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#${bgHex}"/>
  <g id="man-art">
    <g id="man-base">${baseInner}</g>
    <g id="man-cloth">${clothInner}</g>
    ${blushBlock}
    ${beardBlock}
    <g id="man-hair">${hairInner}</g>
    <g id="man-eyes">${eyesInner}</g>
    <g id="man-nose">${noseInner}</g>
    ${mouthModernBlock}
    <g id="man-face-parts" transform="translate(0, 9) scale(1.369)">
      <g id="man-brows">${browsInner}</g>
      ${mouthLegacyBlock}
    </g>
    ${mustacheBlock}
    ${accessoryBlock}
  </g>
</svg>`;
}

module.exports = { generateAvatarVectorMan };
