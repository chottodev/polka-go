'use strict';

const { avatarInitialsQueryParams, initialsPathParam } = require('../../../lib/avatarQueryParams');

module.exports = function avatarInitialsRoute(generateAvatarInitials) {
  function GET(req, res) {
    let text = req.params.text;
    try {
      text = decodeURIComponent(text);
    } catch {
      return res.status(400).json({ error: 'Неверная кодировка текста' });
    }
    const { size, bg, fg, palette, family, font, seed } = req.query;
    const svg = generateAvatarInitials({
      text,
      size,
      bg,
      fg,
      palette,
      family,
      font,
      seed,
    });
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(svg);
  }

  GET.apiDoc = {
    tags: ['Avatars'],
    summary: 'Аватар по инициалам',
    operationId: 'getAvatarInitials',
    parameters: [initialsPathParam, ...avatarInitialsQueryParams],
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
