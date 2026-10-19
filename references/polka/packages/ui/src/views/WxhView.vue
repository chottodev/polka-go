<script setup>
import { computed, ref, watchEffect } from 'vue';
import ColorPickerButton from '../components/ColorPickerButton.vue';

const baseOrigin = typeof window !== 'undefined' ? window.location.origin.replace(/\/$/, '') : '';
const width = ref(400);
const height = ref(300);
const usePathText = ref(false);
const pathText = ref('Hello');
const queryText = ref('');
const bg = ref('cccccc');
const fg = ref('333333');
const rounded = ref(0);
/** размер шрифта в px, пусто = авто */
const fontSize = ref('');
/** ключ `family` в URL, пусто = arial по умолчанию на сервере */
const family = ref('');

/** Синхрон с @polka/generator WXH_FONT_FAMILY_KEYS (15 шт.) */
const FONT_OPTIONS = [
  { value: 'system', label: 'Системный' },
  { value: 'arial', label: 'Arial' },
  { value: 'helvetica', label: 'Helvetica' },
  { value: 'segoe', label: 'Segoe UI' },
  { value: 'verdana', label: 'Verdana' },
  { value: 'tahoma', label: 'Tahoma' },
  { value: 'trebuchet', label: 'Trebuchet MS' },
  { value: 'georgia', label: 'Georgia' },
  { value: 'times', label: 'Times New Roman' },
  { value: 'palatino', label: 'Palatino' },
  { value: 'garamond', label: 'Garamond' },
  { value: 'courier', label: 'Courier New' },
  { value: 'lucida', label: 'Lucida Console' },
  { value: 'impact', label: 'Impact' },
  { value: 'comic', label: 'Comic Sans MS' },
];

const gradient = ref('');

function encodePathSegment(s) {
  return encodeURIComponent(s).replace(/%20/g, '+');
}

const builtPath = computed(() => {
  const w = String(width.value).trim();
  const h = String(height.value).trim();
  let p = `/wxh/${w}/${h}`;
  if (usePathText.value && pathText.value !== '') {
    p += `/${encodePathSegment(pathText.value)}`;
  }
  const q = new URLSearchParams();
  if (!usePathText.value && queryText.value !== '') q.set('text', queryText.value);
  if (bg.value.trim()) q.set('bg', bg.value.replace(/^#/, ''));
  if (fg.value.trim()) q.set('fg', fg.value.replace(/^#/, ''));
  if (rounded.value > 0) q.set('rounded', String(rounded.value));
  if (fontSize.value !== '' && fontSize.value != null) {
    const n = Number(fontSize.value);
    if (Number.isFinite(n) && n > 0) q.set('font', String(Math.round(n)));
  }
  if (family.value) q.set('family', family.value);
  if (gradient.value.trim()) q.set('gradient', gradient.value.trim());
  const qs = q.toString();
  return qs ? `${p}?${qs}` : p;
});

const fullUrl = computed(() => (baseOrigin ? `${baseOrigin}${builtPath.value}` : builtPath.value));
const editableUrl = ref(fullUrl.value);

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
    }, 2000);
  } catch {
    copyState.value = 'Не удалось скопировать';
  }
}

function openInNewTab() {
  window.open(editableUrl.value, '_blank', 'noopener,noreferrer');
}
</script>

<template>
  <section class="card">
    <h2 class="card__title">Плейсхолдер WxH</h2>
    <p class="card__hint">Соберите URL для SVG-картинки заданного размера.</p>

    <div class="wxh-layout">
      <div class="wxh-form">
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

        <label class="field field--check">
          <input v-model="usePathText" type="checkbox" />
          <span>Текст в пути URL</span>
        </label>

        <label v-if="usePathText" class="field">
          <span class="field__label">Текст (в пути)</span>
          <input v-model="pathText" type="text" class="field__input" />
        </label>
        <label v-else class="field">
          <span class="field__label">Текст (query <code>text</code>)</span>
          <input v-model="queryText" type="text" class="field__input" />
        </label>

        <div class="row">
          <label class="field field--half">
            <span class="field__label">Фон <code>bg</code> (hex)</span>
            <div class="input-addon">
              <input v-model="bg" type="text" class="field__input input-addon__input" placeholder="cccccc" />
              <ColorPickerButton v-model="bg" />
            </div>
          </label>
          <label class="field field--half">
            <span class="field__label">Текст <code>fg</code> (hex)</span>
            <div class="input-addon">
              <input v-model="fg" type="text" class="field__input input-addon__input" placeholder="333333" />
              <ColorPickerButton v-model="fg" />
            </div>
          </label>
        </div>

        <div class="row">
          <label class="field field--half">
            <span class="field__label">Скругление <code>rounded</code></span>
            <input v-model.number="rounded" type="number" min="0" class="field__input" />
          </label>
          <label class="field field--half">
            <span class="field__label">Размер шрифта <code>font</code> (px)</span>
            <input
              v-model="fontSize"
              type="number"
              min="1"
              class="field__input"
              placeholder="авто"
            />
          </label>
        </div>

        <label class="field">
          <span class="field__label">Шрифт <code>family</code></span>
          <select v-model="family" class="field__input field__select">
            <option value="">По умолчанию (Arial)</option>
            <option v-for="opt in FONT_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </label>

        <label class="field field--last">
          <span class="field__label">Градиент <code>gradient</code> (h|v-c1-c2)</span>
          <input v-model="gradient" type="text" class="field__input" placeholder="h-3498db-2ecc71" />
        </label>
      </div>

      <aside class="wxh-aside" aria-label="Результат">
        <div class="url-row">
          <label class="field field--grow">
            <span class="field__label">Итоговый URL</span>
            <input v-model="editableUrl" type="text" readonly class="field__input field__input--mono" />
          </label>
          <div class="icon-actions">
            <button
              type="button"
              class="btn btn--icon"
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
              type="button"
              class="btn btn--icon btn--icon-secondary"
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
            <img :src="editableUrl" alt="Превью плейсхолдера" class="preview__img" />
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

.wxh-layout {
  display: grid;
  gap: 1.25rem 1.5rem;
  align-items: start;
}

@media (min-width: 768px) {
  .wxh-layout {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .wxh-aside {
    position: sticky;
    top: 0.75rem;
  }
}

.wxh-form .field--last {
  margin-bottom: 0;
}

.card__title {
  margin: 0 0 0.35rem;
  font-size: 1.25rem;
  font-weight: 700;
}

.card__hint {
  margin: 0 0 1.1rem;
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.45;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.85rem;
}

.field--check {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.65rem;
}

.field__label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--muted);
}

.field__label code {
  font-size: 0.85em;
  font-weight: 600;
  color: var(--accent);
}

.field__input {
  font: inherit;
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #fff;
}

.field__input:focus {
  outline: 2px solid var(--accent-soft);
  border-color: var(--accent);
}

.field__select {
  cursor: pointer;
  appearance: auto;
}

.field__input--mono {
  font-family: ui-monospace, monospace;
  font-size: 0.82rem;
}

.input-addon {
  position: relative;
  display: flex;
  align-items: stretch;
  gap: 0.45rem;
}

.input-addon__input {
  flex: 1;
  min-width: 0;
}

.row {
  display: flex;
  gap: 0.75rem;
}

.field--half {
  flex: 1;
}

.field--grow {
  flex: 1;
  margin-bottom: 0;
}

.wxh-aside .url-row {
  display: flex;
  gap: 0.6rem;
  align-items: flex-end;
  flex-wrap: wrap;
  margin-bottom: 1rem;
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

.btn:hover {
  filter: brightness(1.05);
}

.btn--icon {
  width: 40px;
  height: 40px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
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
  flex-shrink: 0;
}

.wxh-aside .preview {
  margin-bottom: 0;
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
