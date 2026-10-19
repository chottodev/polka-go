#!/usr/bin/env node
'use strict';

const fs = require('fs/promises');
const path = require('path');
const { config, repoRoot } = require('@polka/config');

async function main() {
  const cacheDir = path.isAbsolute(config.stockCacheDir)
    ? config.stockCacheDir
    : path.join(repoRoot, config.stockCacheDir);
  const ttlMs = Number(config.stockCacheTtlSec) * 1000;
  const now = Date.now();

  await fs.mkdir(cacheDir, { recursive: true });
  const entries = await fs.readdir(cacheDir, { withFileTypes: true });

  let removed = 0;
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const targetPath = path.join(cacheDir, entry.name);
    const stat = await fs.stat(targetPath);
    if ((now - stat.mtimeMs) > ttlMs) {
      await fs.unlink(targetPath);
      removed += 1;
    }
  }

  console.log(`cleanup-cache done: removed=${removed} dir=${cacheDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
