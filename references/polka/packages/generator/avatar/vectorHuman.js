'use strict';

const { parseSize, pickPalette, pickStyle, normalizeHex } = require('./utils');

function styleStroke(style, color) {
  if (style === 'outline') return `fill="none" stroke="${color}" stroke-width="4"`;
  if (style === 'duotone') return `fill="${color}" opacity="0.88"`;
  return `fill="${color}"`;
}

function generateAvatarVectorHuman({
  kind = 'male',
  size,
  palette,
  style,
  bg,
  fg,
  seed,
}) {
  const s = parseSize(size, 32, 1024, 48);
  const p = pickPalette(palette);
  const st = pickStyle(style);
  const bgHex = normalizeHex(bg, p.bg);
  const fgHex = normalizeHex(fg, p.fg);
  const accentA = p.a1;
  const accentB = p.a2;
  const tone = p.a3;
  const variant = String(seed || '').length % 2;

  const headFill = st === 'duotone' ? `#${accentA}` : `#${tone}`;
  const bodyFill = st === 'duotone' ? `#${accentB}` : `#${accentA}`;
  const line = `#${fgHex}`;

  const hairPath =
    kind === 'female'
      ? `<path d="M32 20c10 0 17 8 17 17v6H15v-6c0-9 7-17 17-17z" ${styleStroke(st, line)}/>`
      : `<path d="M18 28c0-9 7-16 14-16 8 0 14 7 14 16v5H18z" ${styleStroke(st, line)}/>`;

  const accessory =
    variant === 1
      ? `<circle cx="32" cy="55" r="3" fill="#${accentB}"/>`
      : `<rect x="28" y="52" width="8" height="6" rx="2" fill="#${accentB}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="32" fill="#${bgHex}"/>
  ${hairPath}
  <circle cx="32" cy="28" r="12" fill="${headFill}" />
  <path d="M14 58c1-12 9-19 18-19s17 7 18 19H14z" fill="${bodyFill}" />
  ${accessory}
</svg>`;
}

module.exports = { generateAvatarVectorHuman };
