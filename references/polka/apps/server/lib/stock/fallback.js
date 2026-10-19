'use strict';

function createFallbackSvg({ width, height, text, generatePlaceholder, maxWidth, maxHeight }) {
  return generatePlaceholder({
    width,
    height,
    bg: 'e5e7eb',
    fg: '6b7280',
    text,
    rounded: 0,
    maxWidth,
    maxHeight,
  });
}

module.exports = { createFallbackSvg };
