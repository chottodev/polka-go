'use strict';

const { parseSize, pickPalette, pickStyle, normalizeHex, seededIndex } = require('./utils');
const { AVATAR_ANIMAL_KIND_KEYS } = require('./constants');
const { generateAvatarVectorPanda } = require('./vectorPanda');
const { generateAvatarVectorFox } = require('./vectorFox');
const { generateAvatarVectorDog } = require('./vectorDog');
const { generateAvatarVectorCat } = require('./vectorCat');

function getKindBySeed(kind, seed) {
  if (kind && kind !== 'animal') return kind;
  const idx = seededIndex(seed, AVATAR_ANIMAL_KIND_KEYS.length);
  return AVATAR_ANIMAL_KIND_KEYS[idx];
}

function animalFace(kind) {
  switch (kind) {
    case 'cat':
      return '<path d="M17 24l6-7 5 7M47 24l-6-7-5 7"/><circle cx="24" cy="33" r="2"/><circle cx="40" cy="33" r="2"/><path d="M28 41h8l-4 4z"/>';
    case 'dog':
      return '<path d="M18 25c-3 2-5 6-4 10M46 25c3 2 5 6 4 10"/><circle cx="24" cy="33" r="2"/><circle cx="40" cy="33" r="2"/><ellipse cx="32" cy="40" rx="4" ry="3"/>';
    case 'panda':
      return '<circle cx="23" cy="31" r="6"/><circle cx="41" cy="31" r="6"/><circle cx="24" cy="33" r="2" fill="#fff"/><circle cx="40" cy="33" r="2" fill="#fff"/><ellipse cx="32" cy="40" rx="4" ry="3"/>';
    case 'fox':
      return '<path d="M18 24l5-7 4 6M46 24l-5-7-4 6"/><circle cx="24" cy="33" r="2"/><circle cx="40" cy="33" r="2"/><path d="M28 40h8l-4 5z"/>';
    default:
      return '<circle cx="24" cy="33" r="2"/><circle cx="40" cy="33" r="2"/>';
  }
}

function generateAvatarVectorAnimal({
  kind = 'cat',
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
  const face = getKindBySeed(kind, seed);
  if (face === 'panda') {
    return generateAvatarVectorPanda({ size, bg, seed });
  }
  if (face === 'fox') {
    return generateAvatarVectorFox({ size, bg, seed });
  }
  if (face === 'dog') {
    return generateAvatarVectorDog({ size, bg, seed });
  }
  if (face === 'cat') {
    return generateAvatarVectorCat({ size, bg, seed });
  }

  const bgHex = normalizeHex(bg, p.bg);
  const fgHex = normalizeHex(fg, p.fg);
  const body = st === 'duotone' ? `#${p.a2}` : `#${p.a1}`;
  const stroke = st === 'outline' ? `stroke="#${fgHex}" stroke-width="3" fill="none"` : `fill="#${fgHex}"`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="32" fill="#${bgHex}"/>
  <circle cx="32" cy="35" r="19" fill="${body}"/>
  <g ${stroke}>
    ${animalFace(face)}
  </g>
</svg>`;
}

module.exports = { generateAvatarVectorAnimal };
