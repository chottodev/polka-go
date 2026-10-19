'use strict';

const { avatarVectorQueryParams, kindPathParam } = require('../../../lib/avatarQueryParams');

module.exports = function avatarVectorRoute(generateAvatarVector) {
  function GET(req, res) {
    const { kind } = req.params;
    const { size, palette, style, bg, fg, seed } = req.query;
    const svg = generateAvatarVector({ kind, size, palette, style, bg, fg, seed });
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(svg);
  }

  GET.apiDoc = {
    tags: ['Avatars'],
    summary: 'Векторный аватар',
    operationId: 'getAvatarVector',
    parameters: [kindPathParam, ...avatarVectorQueryParams],
    responses: {
      200: {
        description: 'SVG',
        content: { 'image/svg+xml': { schema: { type: 'string' } } },
      },
      400: {
        description: 'Неверные параметры',
        content: {
          'application/json': {
            schema: { type: 'object', properties: { error: { type: 'string' } } },
          },
        },
      },
    },
    'x-express-openapi-disable-response-validation-middleware': true,
  };

  return { GET };
};
