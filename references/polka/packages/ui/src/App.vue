<script setup>
import { computed } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';

const version = __POLKA_VERSION__;
const route = useRoute();

const tabs = [
  { path: '/wxh', label: 'WxH' },
  { path: '/avatars', label: 'Аватары' },
  { path: '/stock', label: 'Сток' },
];

const activePath = computed(() => route.path);
</script>

<template>
  <div class="page">
    <header class="header">
      <div class="header__bar">
        <div class="header__brand">
          <h1 class="logo">Polka</h1>
          <span class="version">v{{ version }}</span>
        </div>
        <nav class="tabs" aria-label="Разделы">
          <RouterLink v-for="t in tabs" :key="t.path" :to="t.path" class="tab" :class="{ 'tab--active': activePath === t.path }">
            {{ t.label }}
          </RouterLink>
        </nav>
        <a class="api-link" href="/docs" target="_blank" rel="noopener noreferrer">Документация API</a>
      </div>
    </header>

    <main class="main">
      <div class="column">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<style>
:root {
  --bg: #f6f4ef;
  --surface: #fffdfa;
  --ink: #1c1917;
  --muted: #57534e;
  --accent: #c2410c;
  --accent-soft: #fed7aa;
  --border: #e7e5e4;
  --radius: 12px;
  --font-sans: 'DM Sans', system-ui, sans-serif;
  --font-display: 'Instrument Serif', Georgia, serif;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: var(--font-sans);
  color: var(--ink);
  background: radial-gradient(1200px 800px at 10% -10%, #fff7ed 0%, transparent 55%), radial-gradient(900px 600px at 100% 0%, #fce7f3 0%, transparent 45%), var(--bg);
}

#app {
  min-height: 100vh;
}

.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 0.55rem clamp(1rem, 4vw, 2rem);
  border-bottom: 1px solid var(--border);
  background: rgba(255, 253, 250, 0.72);
  backdrop-filter: blur(10px);
}

.header__bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  width: 100%;
  max-width: min(72rem, 100%);
  margin: 0 auto;
}

.header__brand {
  display: inline-flex;
  align-items: baseline;
  gap: 0.45rem;
  flex-shrink: 0;
}

.logo {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1;
}

.version {
  font-size: 0.75rem;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}

.api-link {
  font-size: 0.8rem;
  color: var(--accent);
  text-decoration: none;
  font-weight: 600;
  white-space: nowrap;
  margin-left: auto;
  flex-shrink: 0;
}

.api-link:hover {
  text-decoration: underline;
}

.tabs {
  display: flex;
  gap: 0.2rem;
  padding: 0.15rem;
  background: var(--border);
  border-radius: 999px;
  width: fit-content;
  flex-shrink: 0;
}

.tab {
  padding: 0.3rem 0.85rem;
  border-radius: 999px;
  text-decoration: none;
  color: var(--muted);
  font-size: 0.8rem;
  font-weight: 600;
  transition: background 0.15s ease, color 0.15s ease;
}

.tab:hover {
  color: var(--ink);
}

.tab--active {
  background: var(--surface);
  color: var(--ink);
  box-shadow: 0 1px 3px rgba(28, 25, 23, 0.08);
}

.main {
  flex: 1;
  padding: 1.5rem clamp(1rem, 4vw, 2rem) 3rem;
}

.column {
  max-width: min(72rem, 100%);
  margin: 0 auto;
}
</style>
