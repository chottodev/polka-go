<script setup>
import { computed, ref, watchEffect } from 'vue';

const baseOrigin = typeof window !== 'undefined' ? window.location.origin.replace(/\/$/, '') : '';
const keyword = ref('кафе');
const width = ref(640);
const height = ref(360);
const fit = ref('cover');
const format = ref('webp');
const quality = ref(82);
const seed = ref('');

const fitOptions = [
  { value: 'cover', label: 'cover' },
  { value: 'contain', label: 'contain' },
  { value: 'inside', label: 'inside' },
];
const formatOptions = [
  { value: 'webp', label: 'webp' },
  { value: 'jpeg', label: 'jpeg' },
  { value: 'png', label: 'png' },
];

const builtPath = computed(() => {
  const q = new URLSearchParams();
  q.set('fit', fit.value);
  q.set('format', format.value);
  q.set('quality', String(quality.value));
  q.set('provider', 'freepik');
  if (seed.value.trim()) q.set('seed', seed.value.trim());
  const term = encodeURIComponent(String(keyword.value || '').trim());
  return `/stock/${width.value}/${height.value}/${term}?${q.toString()}`;
});

const fullUrl = computed(() => (baseOrigin ? `${baseOrigin}${builtPath.value}` : builtPath.value));
const editableUrl = ref(fullUrl.value);
const appliedUrl = ref(fullUrl.value);
watchEffect(() => {
  editableUrl.value = fullUrl.value;
});

const copyState = ref('');
async function copyUrl() {
  try {
    await navigator.clipboard.writeText(editableUrl.value);
    copyState.value = 'Скопировано';
    setTimeout(() => {
      copyState.value = '';
    }, 1600);
  } catch {
    copyState.value = 'Не удалось';
  }
}

function openInNewTab() {
  window.open(editableUrl.value, '_blank', 'noopener,noreferrer');
}

function applyPreview() {
  const manual = String(editableUrl.value || '').trim();
  if (manual) {
    appliedUrl.value = manual;
    return;
  }
  appliedUrl.value = fullUrl.value;
  editableUrl.value = fullUrl.value;
}
</script>

<template>
  <section class="card">
    <h2 class="card__title">Стоковые изображения</h2>
    <p class="card__hint">Поиск через Freepik, кеширование на сервере и ресайз по параметрам.</p>

    <div class="layout">
      <div>
        <label class="field">
          <span class="field__label">Ключевое слово</span>
          <input v-model="keyword" class="field__input" placeholder="кафе" />
        </label>

        <div class="row">
          <label class="field field--half">
            <span class="field__label">Ширина</span>
            <input v-model.number="width" type="number" min="1" class="field__input" />
          </label>
          <label class="field field--half">
            <span class="field__label">Высота</span>
            <input v-model.number="height" type="number" min="1" class="field__input" />
          </label>
        </div>

        <div class="row">
          <label class="field field--half">
            <span class="field__label">fit</span>
            <select v-model="fit" class="field__input field__select">
              <option v-for="opt in fitOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </label>
          <label class="field field--half">
            <span class="field__label">format</span>
            <select v-model="format" class="field__input field__select">
              <option v-for="opt in formatOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </label>
        </div>

        <div class="row">
          <label class="field field--half">
            <span class="field__label">quality</span>
            <input v-model.number="quality" type="number" min="1" max="100" class="field__input" />
          </label>
          <label class="field field--half">
            <span class="field__label">seed (опционально)</span>
            <input v-model="seed" class="field__input" />
          </label>
        </div>

        <button
          class="btn btn--apply-under-form"
          type="button"
          title="Применить параметры и обновить превью"
          aria-label="Применить параметры и обновить превью"
          @click="applyPreview"
        >
          Применить
        </button>
      </div>

      <aside>
        <div class="url-row">
          <label class="field field--grow">
            <span class="field__label">Итоговый URL</span>
            <input v-model="editableUrl" class="field__input field__input--mono" />
          </label>
          <div class="icon-actions">
            <button
              class="btn btn--icon"
              type="button"
              :title="copyState || 'Скопировать URL'"
              aria-label="Скопировать URL"
              @click="copyUrl"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 9h10v12H9z" fill="none" stroke="currentColor" stroke-width="2"/>
                <path d="M5 3h10v12" fill="none" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
            <button
              class="btn btn--icon btn--icon-secondary"
              type="button"
              title="Открыть в новой вкладке"
              aria-label="Открыть в новой вкладке"
              @click="openInNewTab"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14 4h6v6" fill="none" stroke="currentColor" stroke-width="2"/>
                <path d="M10 14L20 4" fill="none" stroke="currentColor" stroke-width="2"/>
                <path d="M20 14v6H4V4h6" fill="none" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="preview">
          <span class="field__label">Превью</span>
          <div class="preview__box">
            <img :src="appliedUrl" alt="Превью стоковой картинки" class="preview__img" />
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.35rem 1.35rem 1.5rem;
  box-shadow: 0 14px 40px -24px rgba(28, 25, 23, 0.35);
}
.card__title {
  margin: 0 0 0.35rem;
  font-size: 1.25rem;
  font-weight: 700;
}
.card__hint {
  margin: 0 0 1rem;
  color: var(--muted);
  font-size: 0.9rem;
}
.layout {
  display: grid;
  gap: 1.25rem 1.5rem;
}
@media (min-width: 768px) {
  .layout {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    align-items: start;
  }
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.85rem;
}
.field--half {
  flex: 1;
}
.field--grow {
  flex: 1;
  margin-bottom: 0;
}
.field__label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--muted);
}
.field__input {
  font: inherit;
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #fff;
}
.field__select {
  cursor: pointer;
}
.field__input--mono {
  font-family: ui-monospace, monospace;
  font-size: 0.82rem;
}
.row {
  display: flex;
  gap: 0.75rem;
}
.url-row {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
}
.btn {
  flex-shrink: 0;
  font: inherit;
  font-weight: 600;
  padding: 0.55rem 1rem;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  cursor: pointer;
}
.btn--icon {
  width: 40px;
  height: 40px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.btn--apply-under-form {
  margin-top: 0.1rem;
}
.btn--icon svg {
  width: 18px;
  height: 18px;
  display: block;
}
.btn--icon-secondary {
  background: #fff;
  color: var(--accent);
  border: 1px solid var(--accent-soft);
}
.icon-actions {
  display: inline-flex;
  gap: 0.4rem;
}
.preview__box {
  margin-top: 0.35rem;
  padding: 0.65rem;
  border-radius: 8px;
  background: repeating-linear-gradient(45deg, #fafaf9, #fafaf9 8px, #f5f5f4 8px, #f5f5f4 16px);
  border: 1px dashed var(--border);
}
.preview__img {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 0 auto;
}
</style>
