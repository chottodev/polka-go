'use strict';

const stockQueryParams = [
  {
    name: 'fit',
    in: 'query',
    required: false,
    schema: { type: 'string', enum: ['cover', 'contain', 'inside'], default: 'cover' },
  },
  {
    name: 'format',
    in: 'query',
    required: false,
    schema: { type: 'string', enum: ['webp', 'jpeg', 'png'], default: 'webp' },
  },
  {
    name: 'quality',
    in: 'query',
    required: false,
    schema: { type: 'integer', minimum: 1, maximum: 100, default: 82 },
  },
  {
    name: 'provider',
    in: 'query',
    required: false,
    schema: { type: 'string', enum: ['freepik'], default: 'freepik' },
  },
  {
    name: 'seed',
    in: 'query',
    required: false,
    schema: { type: 'string' },
  },
];

module.exports = { stockQueryParams };
