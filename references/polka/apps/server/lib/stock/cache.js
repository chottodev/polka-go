'use strict';

const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

function normalizeExt(format) {
  const f = String(format || '').toLowerCase();
  if (f === 'jpg') return 'jpeg';
  if (f === 'jpeg' || f === 'png' || f === 'webp') return f;
  return 'webp';
}

function keyToHash(key) {
  return crypto.createHash('sha1').update(key).digest('hex');
}

function buildCacheKey(params) {
  return [
    'v1',
    String(params.provider || 'freepik').toLowerCase(),
    String(params.query || '').trim().toLowerCase(),
    `w${params.width}`,
    `h${params.height}`,
    `fit:${params.fit}`,
    `fmt:${normalizeExt(params.format)}`,
    `q:${params.quality}`,
    `seed:${String(params.seed || '').trim()}`,
  ].join('|');
}

function cacheFilePath(cacheDir, key, format) {
  const hash = keyToHash(key);
  return path.join(cacheDir, `${hash}.${normalizeExt(format)}`);
}

async function ensureCacheDir(cacheDir) {
  await fs.mkdir(cacheDir, { recursive: true });
}

async function readCachedFile(cacheDir, key, format) {
  const filePath = cacheFilePath(cacheDir, key, format);
  try {
    const body = await fs.readFile(filePath);
    return { filePath, body };
  } catch (err) {
    if (err && err.code === 'ENOENT') return null;
    throw err;
  }
}

async function writeCachedFile(cacheDir, key, format, body) {
  const filePath = cacheFilePath(cacheDir, key, format);
  await fs.writeFile(filePath, body);
  return { filePath };
}

module.exports = {
  normalizeExt,
  buildCacheKey,
  ensureCacheDir,
  readCachedFile,
  writeCachedFile,
};
