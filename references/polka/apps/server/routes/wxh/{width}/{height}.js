'use strict';

const { queryParamsPlain } = require('../../../lib/wxhQueryParams');

module.exports = function wxhPlain(generatePlaceholder, config) {
  function GET(req, res) {
    const w = Number(req.params.width);
    const h = Number(req.params.height);
    if (!Number.isInteger(w) || w < 1 || w > config.placeholderMaxWidth) {
      return res.status(400).json({ error: 'Неверная ширина' });
    }
    if (!Number.isInteger(h) || h < 1 || h > config.placeholderMaxHeight) {
      return res.status(400).json({ error: 'Неверная высота' });
    }
    const { bg, fg, text, rounded, font, family, gradient } = req.query;
    const svg = generatePlaceholder({
      width: w,
      height: h,
      bg,
      fg,
      text,
      rounded,
      fontSize: font,
      family,
      gradient,
      maxWidth: config.placeholderMaxWidth,
      maxHeight: config.placeholderMaxHeight,
    });
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(svg);
  }

  GET.apiDoc = {
    tags: ['WxH'],
    summary: 'Плейсхолдер без текста в пути',
    operationId: 'getWxhPlaceholder',
    parameters: [
      {
        name: 'width',
        in: 'path',
        required: true,
        schema: { type: 'integer', minimum: 1, maximum: 32000 },
      },
      {
        name: 'height',
        in: 'path',
        required: true,
        schema: { type: 'integer', minimum: 1, maximum: 32000 },
      },
      ...queryParamsPlain,
    ],
    responses: {
      200: {
        description: 'SVG',
        content: {
          'image/svg+xml': {
            schema: { type: 'string' },
          },
        },
      },
      400: {
        description: 'Неверные параметры',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: { error: { type: 'string' } },
            },
          },
        },
      },
    },
    'x-express-openapi-disable-response-validation-middleware': true,
  };

  return { GET };
};
