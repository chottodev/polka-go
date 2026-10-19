'use strict';

const sharp = require('sharp');

function normalizeFormat(format, fallback) {
  const f = String(format || fallback || 'webp').toLowerCase();
  if (f === 'jpg') return 'jpeg';
  if (f === 'jpeg' || f === 'png' || f === 'webp') return f;
  return String(fallback || 'webp').toLowerCase();
}

function normalizeFit(fit) {
  const value = String(fit || 'cover').toLowerCase();
  if (value === 'contain' || value === 'inside' || value === 'cover') return value;
  return 'cover';
}

async function resizeImage(buffer, opts) {
  const width = Number(opts.width);
  const height = Number(opts.height);
  const quality = Number(opts.quality);
  const format = normalizeFormat(opts.format, opts.defaultFormat || 'webp');
  const fit = normalizeFit(opts.fit);
  const q = Number.isFinite(quality) ? Math.min(100, Math.max(1, quality)) : 82;

  let pipeline = sharp(buffer).resize(width, height, { fit });
  if (format === 'webp') pipeline = pipeline.webp({ quality: q });
  if (format === 'jpeg') pipeline = pipeline.jpeg({ quality: q, mozjpeg: true });
  if (format === 'png') pipeline = pipeline.png();

  const output = await pipeline.toBuffer();
  return { format, output };
}

module.exports = { normalizeFormat, normalizeFit, resizeImage };
