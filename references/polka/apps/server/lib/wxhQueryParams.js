'use strict';

const { WXH_FONT_FAMILY_KEYS } = require('@polka/generator');

const familyParam = {
  name: 'family',
  in: 'query',
  required: false,
  schema: {
    type: 'string',
    enum: [...WXH_FONT_FAMILY_KEYS],
    description: 'Гарнитура (ключ пресета)',
  },
};

const queryParamsWithTextInPath = [
  { name: 'bg', in: 'query', required: false, schema: { type: 'string' } },
  { name: 'fg', in: 'query', required: false, schema: { type: 'string' } },
  { name: 'rounded', in: 'query', required: false, schema: { type: 'integer', minimum: 0 } },
  { name: 'font', in: 'query', required: false, schema: { type: 'integer', description: 'Размер шрифта (px)' } },
  familyParam,
  { name: 'gradient', in: 'query', required: false, schema: { type: 'string' } },
];

const queryParamsPlain = [
  { name: 'bg', in: 'query', required: false, schema: { type: 'string', description: 'Цвет фона hex без #' } },
  { name: 'fg', in: 'query', required: false, schema: { type: 'string', description: 'Цвет текста hex без #' } },
  { name: 'text', in: 'query', required: false, schema: { type: 'string' } },
  { name: 'rounded', in: 'query', required: false, schema: { type: 'integer', minimum: 0 } },
  { name: 'font', in: 'query', required: false, schema: { type: 'integer', description: 'Размер шрифта (px)' } },
  familyParam,
  { name: 'gradient', in: 'query', required: false, schema: { type: 'string', description: 'h|v-color1-color2' } },
];

module.exports = { queryParamsPlain, queryParamsWithTextInPath };
