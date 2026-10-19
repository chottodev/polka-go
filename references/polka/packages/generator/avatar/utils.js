'use strict';

const {
  AVATAR_PALETTES,
  AVATAR_PALETTE_KEYS,
  AVATAR_STYLE_KEYS,
  AVATAR_SIZE_PRESET_VALUES,
} = require('./constants');

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

function normalizeHex(raw, fallback) {
  const candidate = String(raw || '').replace(/^#/, '').trim().toLowerCase();
  if (/^[0-9a-f]{3}([0-9a-f]{3})?$/.test(candidate)) return candidate;
  return fallback;
}

function parseSize(size, min = 32, max = 1024, fallback = 128) {
  const n = parseInt(size, 10);
  if (Number.isNaN(n)) return fallback;
  return clamp(n, min, max);
}

function pickPalette(paletteKey) {
  const key = AVATAR_PALETTE_KEYS.includes(String(paletteKey)) ? paletteKey : 'soft';
  return AVATAR_PALETTES[key];
}

function pickStyle(styleKey) {
  const k = String(styleKey || '');
  if (k === 'round' || k === 'square') return 'flat';
  return AVATAR_STYLE_KEYS.includes(k) ? k : 'flat';
}

function hashSeed(str) {
  let h = 2166136261;
  const s = String(str || '');
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

function seededIndex(seed, len) {
  if (!len) return 0;
  return hashSeed(seed) % len;
}

const INITIALS_FONT_FAMILY_STACKS = Object.freeze({
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

const AVATAR_FAMILY_KEYS = Object.freeze(Object.keys(INITIALS_FONT_FAMILY_STACKS));

function resolveInitialsFamily(family) {
  const k = String(family || '').toLowerCase();
  return INITIALS_FONT_FAMILY_STACKS[k] || INITIALS_FONT_FAMILY_STACKS.arial;
}

module.exports = {
  clamp,
  escapeXml,
  normalizeHex,
  parseSize,
  pickPalette,
  pickStyle,
  seededIndex,
  AVATAR_FAMILY_KEYS,
  resolveInitialsFamily,
  AVATAR_SIZE_PRESET_VALUES,
};
