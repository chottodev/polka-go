'use strict';

const path = require('path');
const dotenv = require('dotenv');

/** Monorepo root (../../ from packages/config). */
const repoRoot = path.resolve(__dirname, '..', '..');

dotenv.config({ path: path.join(repoRoot, '.env') });
dotenv.config();

function intEnv(name, fallback, min, max) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const n = parseInt(String(raw), 10);
  if (Number.isNaN(n)) return fallback;
  let v = n;
  if (min != null) v = Math.max(min, v);
  if (max != null) v = Math.min(max, v);
  return v;
}

/**
 * @typedef {object} PolkaConfig
 * @property {'development'|'production'|'test'|string} nodeEnv
 * @property {number} port
 * @property {string} publicOrigin — без завершающего `/`; пустая строка = «не задано»
 * @property {number} placeholderMaxWidth
 * @property {number} placeholderMaxHeight
 */

const config = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: intEnv('PORT', 4700, 1, 65535),
  publicOrigin: String(process.env.PUBLIC_ORIGIN || '').replace(/\/$/, ''),
  placeholderMaxWidth: intEnv('PLACEHOLDER_MAX_WIDTH', 4000, 1, 32000),
  placeholderMaxHeight: intEnv('PLACEHOLDER_MAX_HEIGHT', 4000, 1, 32000),
  freepikApiKey: String(process.env.FREEPIK_API_KEY || ''),
  stockMaxWidth: intEnv('STOCK_MAX_WIDTH', 4096, 1, 32000),
  stockMaxHeight: intEnv('STOCK_MAX_HEIGHT', 4096, 1, 32000),
  stockCacheDir: path.isAbsolute(String(process.env.STOCK_CACHE_DIR || ''))
    ? String(process.env.STOCK_CACHE_DIR)
    : path.resolve(repoRoot, String(process.env.STOCK_CACHE_DIR || '.cache/polka-stock')),
  stockCacheTtlSec: intEnv('STOCK_CACHE_TTL_SEC', 2592000, 60, 31536000),
  stockProviderTimeoutMs: intEnv('STOCK_PROVIDER_TIMEOUT_MS', 6000, 100, 20000),
  stockDefaultFormat: String(process.env.STOCK_DEFAULT_FORMAT || 'webp'),
  stockDefaultQuality: intEnv('STOCK_DEFAULT_QUALITY', 82, 1, 100),
  stockFallbackText: String(process.env.STOCK_FALLBACK_TEXT || 'no image'),
});

module.exports = { config, repoRoot };
