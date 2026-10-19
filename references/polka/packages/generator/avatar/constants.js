'use strict';

const AVATAR_KIND_KEYS = Object.freeze([
  'man',
  'male',
  'female',
  'cat',
  'dog',
  'panda',
  'fox',
]);

const AVATAR_ANIMAL_KIND_KEYS = Object.freeze(['cat', 'dog', 'panda', 'fox']);
const AVATAR_HUMAN_KIND_KEYS = Object.freeze(['male', 'female']);

const AVATAR_STYLE_KEYS = Object.freeze(['flat', 'outline', 'duotone']);
const AVATAR_PALETTE_KEYS = Object.freeze(['soft', 'vivid', 'earth', 'mono', 'ocean']);
const AVATAR_SIZE_PRESET_VALUES = Object.freeze([16, 32, 48, 64, 72, 96, 128, 192, 256, 384, 512]);

const AVATAR_PALETTES = Object.freeze({
  soft: { bg: 'f4e7ff', fg: '3f2a56', a1: 'd9c2ff', a2: 'b28aff', a3: '8a63d2' },
  vivid: { bg: 'ffe8e8', fg: '4f1422', a1: 'ff7b89', a2: 'ff4d6d', a3: 'c1121f' },
  earth: { bg: 'efe5d7', fg: '3b2f2a', a1: 'c8a97e', a2: 'a67c52', a3: '6f4e37' },
  mono: { bg: 'f2f2f2', fg: '222222', a1: 'c7c7c7', a2: '8f8f8f', a3: '545454' },
  ocean: { bg: 'e6f3ff', fg: '12324a', a1: '78c4d4', a2: '3aa6c1', a3: '1d6f8a' },
});

module.exports = {
  AVATAR_KIND_KEYS,
  AVATAR_ANIMAL_KIND_KEYS,
  AVATAR_HUMAN_KIND_KEYS,
  AVATAR_STYLE_KEYS,
  AVATAR_PALETTE_KEYS,
  AVATAR_SIZE_PRESET_VALUES,
  AVATAR_PALETTES,
};
