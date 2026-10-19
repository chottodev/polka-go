/**
 * SVG Placeholder Image Generator
 * Pure SVG — no native image dependencies required.
 */

const { generateAvatarInitials } = require('./avatar/initials');
const { generateAvatarVectorMan } = require('./avatar/vectorMan');
const { generateAvatarVectorFemale } = require('./avatar/vectorFemale');
const { generateAvatarVectorHuman } = require('./avatar/vectorHuman');
const { generateAvatarVectorAnimal } = require('./avatar/vectorAnimal');
const {
  AVATAR_KIND_KEYS,
  AVATAR_ANIMAL_KIND_KEYS,
  AVATAR_HUMAN_KIND_KEYS,
  AVATAR_STYLE_KEYS,
  AVATAR_PALETTE_KEYS,
  AVATAR_SIZE_PRESET_VALUES,
} = require('./avatar/constants');
const { AVATAR_FAMILY_KEYS } = require('./avatar/utils');

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function autoFontSize(width, height, text) {
  const maxDim = Math.min(width, height);
  const charCount = text.length || 1;
  return clamp(Math.floor(maxDim / (charCount * 0.6 + 1)), 10, maxDim * 0.8);
}

/** 15 пресетов для query `family` — безопасные font-family stacks для SVG. */
const FONT_FAMILY_STACKS = Object.freeze({
  system: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  arial: 'Arial, Helvetica, sans-serif',
  georgia: 'Georgia, Times New Roman, Times, serif',
  times: 'Times New Roman, Times, serif',
  courier: 'Courier New, Courier, monospace',
  verdana: 'Verdana, Geneva, sans-serif',
  trebuchet: 'Trebuchet MS, Helvetica, sans-serif',
  tahoma: 'Tahoma, Geneva, sans-serif',
  palatino: 'Palatino, Palatino Linotype, serif',
  garamond: 'Garamond, serif',
  lucida: 'Lucida Console, Lucida Sans Typewriter, monospace',
  impact: 'Impact, Haettenschweiler, Arial Narrow, sans-serif',
  comic: 'Comic Sans MS, Comic Sans, cursive',
  segoe: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  helvetica: 'Helvetica, Arial, sans-serif',
});

const WXH_FONT_FAMILY_KEYS = Object.freeze(Object.keys(FONT_FAMILY_STACKS));

function resolvePlaceholderFontFamily(family) {
  if (family == null || family === '') return FONT_FAMILY_STACKS.arial;
  const k = String(family).toLowerCase();
  return FONT_FAMILY_STACKS[k] || FONT_FAMILY_STACKS.arial;
}

// ── Basic placeholder ────────────────────────────────────────────────
function generatePlaceholder({
  width,
  height,
  bg,
  fg,
  text,
  rounded,
  fontSize,
  family,
  gradient,
  maxWidth = 4000,
  maxHeight = 4000,
}) {
  const wMax = Math.max(1, parseInt(maxWidth, 10) || 4000);
  const hMax = Math.max(1, parseInt(maxHeight, 10) || 4000);
  width = clamp(parseInt(width) || 300, 1, wMax);
  height = clamp(parseInt(height) || 300, 1, hMax);
  bg = bg || 'cccccc';
  fg = fg || '333333';
  text = text || `${width}×${height}`;
  rounded = parseInt(rounded) || 0;
  fontSize = parseInt(fontSize) || autoFontSize(width, height, text);
  const fontStack = resolvePlaceholderFontFamily(family);

  let bgFill;
  let defs = '';

  if (gradient) {
    const parts = gradient.split('-');
    const dir = parts[0] || 'h';
    const c1 = parts[1] || bg;
    const c2 = parts[2] || bg;
    const x2 = dir === 'v' ? '0' : '1';
    const y2 = dir === 'v' ? '1' : '0';
    defs = `<defs><linearGradient id="grad" x1="0" y1="0" x2="${x2}" y2="${y2}">
      <stop offset="0%" stop-color="#${c1}"/>
      <stop offset="100%" stop-color="#${c2}"/>
    </linearGradient></defs>`;
    bgFill = 'url(#grad)';
  } else {
    bgFill = `#${bg}`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${defs}
  <rect width="${width}" height="${height}" fill="${bgFill}" rx="${rounded}" ry="${rounded}"/>
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
        font-family='${fontStack}' font-size="${fontSize}" fill="#${fg}">${escapeXml(text)}</text>
</svg>`;
}

// ── Avatar (circle with initials) ────────────────────────────────────
function generateAvatar({ initials, bg, fg, size, fontSize, family, palette }) {
  return generateAvatarInitials({
    text: initials,
    bg,
    fg,
    size,
    font: fontSize,
    family,
    palette,
  });
}

function generateAvatarVector({ kind, size, palette, style, bg, fg, seed }) {
  function applyRoundStyle(svg) {
    if (String(style) !== 'round' || typeof svg !== 'string') return svg;
    const openTagMatch = svg.match(/^<svg\b[^>]*>/);
    if (!openTagMatch) return svg;
    const openTag = openTagMatch[0];
    const inner = svg.slice(openTag.length).replace(/<\/svg>\s*$/, '');
    return `${openTag}<defs><clipPath id="avatarRoundClip"><circle cx="50%" cy="50%" r="50%"/></clipPath></defs><g clip-path="url(#avatarRoundClip)">${inner}</g></svg>`;
  }

  if (String(kind) === 'man') {
    return applyRoundStyle(generateAvatarVectorMan({ size, bg, seed }));
  }
  if (String(kind) === 'female') {
    return applyRoundStyle(generateAvatarVectorFemale({ size, bg, seed }));
  }
  if (AVATAR_HUMAN_KIND_KEYS.includes(String(kind))) {
    return applyRoundStyle(generateAvatarVectorHuman({ kind, size, palette, style, bg, fg, seed }));
  }
  return applyRoundStyle(generateAvatarVectorAnimal({ kind, size, palette, style, bg, fg, seed }));
}

// ── Pattern placeholder ──────────────────────────────────────────────
function generatePattern({ width, height, bg, fg, pattern, rounded }) {
  width = clamp(parseInt(width) || 300, 1, 4000);
  height = clamp(parseInt(height) || 300, 1, 4000);
  bg = bg || 'eeeeee';
  fg = fg || 'cccccc';
  pattern = pattern || 'grid';
  rounded = parseInt(rounded) || 0;

  let patternDef = '';
  const spacing = 20;

  switch (pattern) {
    case 'dots': {
      const r = 2;
      patternDef = `<defs><pattern id="pat" x="0" y="0" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse">
        <circle cx="${spacing / 2}" cy="${spacing / 2}" r="${r}" fill="#${fg}"/>
      </pattern></defs>`;
      break;
    }
    case 'lines': {
      patternDef = `<defs><pattern id="pat" x="0" y="0" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse">
        <line x1="0" y1="${spacing}" x2="${spacing}" y2="0" stroke="#${fg}" stroke-width="1"/>
      </pattern></defs>`;
      break;
    }
    case 'crosshatch': {
      patternDef = `<defs><pattern id="pat" x="0" y="0" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="${spacing}" y2="${spacing}" stroke="#${fg}" stroke-width="0.5"/>
        <line x1="${spacing}" y1="0" x2="0" y2="${spacing}" stroke="#${fg}" stroke-width="0.5"/>
      </pattern></defs>`;
      break;
    }
    case 'grid':
    default: {
      patternDef = `<defs><pattern id="pat" x="0" y="0" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse">
        <path d="M ${spacing} 0 L 0 0 0 ${spacing}" fill="none" stroke="#${fg}" stroke-width="0.5"/>
      </pattern></defs>`;
      break;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${patternDef}
  <rect width="${width}" height="${height}" fill="#${bg}" rx="${rounded}" ry="${rounded}"/>
  <rect width="${width}" height="${height}" fill="url(#pat)" rx="${rounded}" ry="${rounded}"/>
</svg>`;
}

module.exports = {
  generatePlaceholder,
  generateAvatar,
  generateAvatarInitials,
  generateAvatarVector,
  generateAvatarVectorMan,
  generateAvatarVectorFemale,
  generateAvatarVectorHuman,
  generateAvatarVectorAnimal,
  generatePattern,
  WXH_FONT_FAMILY_KEYS,
  AVATAR_FAMILY_KEYS,
  AVATAR_KIND_KEYS,
  AVATAR_ANIMAL_KIND_KEYS,
  AVATAR_HUMAN_KIND_KEYS,
  AVATAR_STYLE_KEYS,
  AVATAR_PALETTE_KEYS,
  AVATAR_SIZE_PRESET_VALUES,
};
