'use strict';

const { parseSize, pickPalette, normalizeHex, resolveInitialsFamily, escapeXml } = require('./utils');

function generateAvatarInitials({
  text,
  size,
  bg,
  fg,
  font,
  family,
  palette,
}) {
  const s = parseSize(size, 32, 1024, 48);
  const p = pickPalette(palette);
  const initials = String(text || '?').trim().toUpperCase().slice(0, 3) || '?';

  const bgHex = normalizeHex(bg, p.a2);
  const fgHex = normalizeHex(fg, p.fg);
  const fontSize = parseInt(font, 10) || Math.floor(s * 0.42);
  const fontFamily = resolveInitialsFamily(family);
  const r = s / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <circle cx="${r}" cy="${r}" r="${r}" fill="#${bgHex}"/>
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
        font-family='${fontFamily}' font-weight="700" font-size="${fontSize}" fill="#${fgHex}">${escapeXml(initials)}</text>
</svg>`;
}

module.exports = { generateAvatarInitials };
