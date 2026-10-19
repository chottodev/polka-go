'use strict';

function withTimeout(ms) {
  const timeoutMs = Number(ms) > 0 ? Number(ms) : 3000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

function resolveOrientation(width, height) {
  const w = Number(width);
  const h = Number(height);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return 'landscape';
  if (w === h) return 'square';
  return w > h ? 'landscape' : 'portrait';
}

function buildSearchUrl(term, seed, width, height) {
  const url = new URL('https://api.freepik.com/v1/resources');
  url.searchParams.set('term', term);
  url.searchParams.set('limit', '20');
  url.searchParams.set('filters[license][freemium]', '1');
  const orientation = resolveOrientation(width, height);
  url.searchParams.set(`filters[orientation][${orientation}]`, '1');
  if (seed) {
    url.searchParams.set('order', 'recent');
  }
  return url;
}

function pickBySeed(items, seed) {
  if (!items.length) return null;
  if (!seed) return items[0];
  let hash = 0;
  const s = String(seed);
  for (let i = 0; i < s.length; i += 1) {
    hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  }
  return items[hash % items.length];
}

function getImageUrl(item) {
  if (!item || typeof item !== 'object') return '';
  if (item.image && item.image.source && item.image.source.url) return item.image.source.url;
  if (item.image && item.image.url) return item.image.url;
  if (item.preview && item.preview.url) return item.preview.url;
  return '';
}

async function fetchJson(url, apiKey, timeoutMs) {
  const t = withTimeout(timeoutMs);
  try {
    const res = await fetch(url, {
      signal: t.signal,
      headers: {
        'x-freepik-api-key': apiKey,
        'Accept-Language': 'ru-RU',
      },
    });
    if (!res.ok) {
      const text = await res.text();
      const err = new Error(`Freepik API ${res.status}: ${text}`);
      err.status = res.status;
      throw err;
    }
    return await res.json();
  } finally {
    t.clear();
  }
}

async function fetchBuffer(url, timeoutMs) {
  const t = withTimeout(timeoutMs);
  try {
    const res = await fetch(url, { signal: t.signal });
    if (!res.ok) {
      const err = new Error(`Image download ${res.status}`);
      err.status = res.status;
      throw err;
    }
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  } finally {
    t.clear();
  }
}

async function fetchFreepikImage({ apiKey, query, seed, timeoutMs, width, height }) {
  if (!apiKey) throw new Error('FREEPIK_API_KEY is not set');
  const orientation = resolveOrientation(width, height);
  const searchUrl = buildSearchUrl(query, seed, width, height);
  const payload = await fetchJson(searchUrl, apiKey, timeoutMs);
  const items = Array.isArray(payload && payload.data) ? payload.data : [];
  const picked = pickBySeed(items, seed);
  if (!picked) {
    const err = new Error('No free images found');
    err.status = 404;
    throw err;
  }
  const sourceUrl = getImageUrl(picked);
  if (!sourceUrl) {
    const err = new Error('Freepik result has no source image');
    err.status = 404;
    throw err;
  }
  const original = await fetchBuffer(sourceUrl, timeoutMs);
  return {
    provider: 'freepik',
    orientation,
    resourceId: picked.id,
    title: picked.title,
    sourceUrl,
    original,
  };
}

module.exports = { fetchFreepikImage };
