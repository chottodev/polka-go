'use strict';

const {
  AVATAR_FAMILY_KEYS,
  AVATAR_KIND_KEYS,
  AVATAR_STYLE_KEYS,
  AVATAR_PALETTE_KEYS,
  AVATAR_SIZE_PRESET_VALUES,
} = require('@polka/generator');

const sizeParam = {
  name: 'size',
  in: 'query',
  required: false,
  schema: { type: 'integer', enum: [...AVATAR_SIZE_PRESET_VALUES] },
  description: 'Размер аватарки (px, preset)',
};

const bgParam = { name: 'bg', in: 'query', required: false, schema: { type: 'string' } };
const fgParam = { name: 'fg', in: 'query', required: false, schema: { type: 'string' } };

const paletteParam = {
  name: 'palette',
  in: 'query',
  required: false,
  schema: { type: 'string', enum: [...AVATAR_PALETTE_KEYS] },
};

const styleParam = {
  name: 'style',
  in: 'query',
  required: false,
  schema: {
    type: 'string',
    enum: [...AVATAR_STYLE_KEYS, 'round', 'square'],
    description: 'flat | outline | duotone — стиль заливки; round | square — маска (клип) для векторных аватаров',
  },
};

const seedParam = {
  name: 'seed',
  in: 'query',
  required: false,
  schema: { type: 'string' },
};

const familyParam = {
  name: 'family',
  in: 'query',
  required: false,
  schema: { type: 'string', enum: [...AVATAR_FAMILY_KEYS] },
};

const fontParam = {
  name: 'font',
  in: 'query',
  required: false,
  schema: { type: 'integer', minimum: 1 },
  description: 'Размер шрифта для initials',
};

const kindPathParam = {
  name: 'kind',
  in: 'path',
  required: true,
  schema: { type: 'string', enum: [...AVATAR_KIND_KEYS] },
};

const initialsPathParam = {
  name: 'text',
  in: 'path',
  required: true,
  schema: { type: 'string', minLength: 1, maxLength: 3 },
};

const avatarInitialsQueryParams = [sizeParam, bgParam, fgParam, paletteParam, familyParam, fontParam, seedParam];
const avatarVectorQueryParams = [sizeParam, bgParam, fgParam, paletteParam, styleParam, seedParam];

module.exports = {
  avatarInitialsQueryParams,
  avatarVectorQueryParams,
  kindPathParam,
  initialsPathParam,
};
