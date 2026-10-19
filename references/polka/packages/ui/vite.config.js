import vue from '@vitejs/plugin-vue';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const rootPkg = JSON.parse(readFileSync(resolve(__dirname, '../../package.json'), 'utf8'));

export default defineConfig({
  plugins: [vue()],
  define: {
    __POLKA_VERSION__: JSON.stringify(rootPkg.version),
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy only API routes, not SPA pages (/wxh, /avatars, /stock).
      // Otherwise direct navigation to /wxh would be proxied to the backend
      // and the browser would try to load built /assets/* from the dev origin.
      '^/wxh/\\d': 'http://localhost:4700',
      '^/avatars/(initials|vector)/': 'http://localhost:4700',
      '^/stock/\\d': 'http://localhost:4700',
      '/docs': 'http://localhost:4700',
      '/openapi.json': 'http://localhost:4700',
      '/health': 'http://localhost:4700',
    },
  },
  build: {
    outDir: resolve(__dirname, '../../apps/server/public'),
    emptyOutDir: true,
  },
});
