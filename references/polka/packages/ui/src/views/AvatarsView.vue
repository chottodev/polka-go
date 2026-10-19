<script setup>
import { computed, ref, watchEffect } from 'vue';
import ColorPickerButton from '../components/ColorPickerButton.vue';

const baseOrigin = typeof window !== 'undefined' ? window.location.origin.replace(/\/$/, '') : '';
const mode = ref('initials');

const size = ref(256);
const palette = ref('soft');
const bg = ref('');
const fg = ref('');
const seed = ref('');

const initialsText = ref('AB');
const family = ref('arial');
const font = ref('');

const vectorKind = ref('man');
const style = ref('round');
const shape = ref('round');

const familyOptions = [
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

const sizeOptions = [16, 32, 48, 64, 72, 96, 128, 192, 256, 384, 512];
const styleOptions = [
  { value: 'round', label: 'Round' },
  { value: 'square', label: 'Square' },
];
const paletteOptions = [
  { value: 'soft', label: 'Soft' },
  { value: 'vivid', label: 'Vivid' },
  { value: 'earth', label: 'Earth' },
  { value: 'mono', label: 'Mono' },
  { value: 'ocean', label: 'Ocean' },
];
const vectorKinds = [
  { value: 'man', label: 'Мужской' },
  { value: 'female', label: 'Женский' },
  { value: 'cat', label: 'Cat' },
  { value: 'dog', label: 'Dog' },
  { value: 'panda', label: 'Panda' },
  { value: 'fox', label: 'Fox' },
];


const builtPath = computed(() => {
  const q = new URLSearchParams();
  q.set('size', String(size.value));
  if (palette.value) q.set('palette', palette.value);
  if (bg.value.trim()) q.set('bg', bg.value.replace(/^#/, ''));
  if (fg.value.trim()) q.set('fg', fg.value.replace(/^#/, ''));
  if (seed.value.trim()) q.set('seed', seed.value.trim());

  if (mode.value === 'initials') {
    if (family.value) q.set('family', family.value);
    if (font.value) q.set('font', String(font.value));
    const text = encodeURIComponent(String(initialsText.value || 'AB').slice(0, 3));
    return `/avatars/initials/${text}?${q.toString()}`;
  }

  if (style.value) q.set('style', styleMenu.value);
  return `/avatars/vector/${vectorKind.value}?${q.toString()}`;
});

const styleMenu = computed({
  get() {
    return shape.value === 'round' || shape.value === 'square' ? shape.value : style.value;
  },
  set(v) {
    if (v === 'round' || v === 'square') {
      shape.value = v;
      return;
    }
    style.value = v;
  },
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
    }, 1600);
  } catch {
    copyState.value = 'Не удалось';
  }
}

function openInNewTab() {
  window.open(editableUrl.value, '_blank', 'noopener,noreferrer');
}
</script>

<template>
  <section class="card">
    <h2 class="card__title">Аватары</h2>
    <p class="card__hint">Два режима: по инициалам и векторные пресеты.</p>

    <div class="layout">
      <div>
        <div class="segmented">
          <button type="button" class="seg-btn" :class="{ active: mode === 'initials' }" @click="mode = 'initials'">
            По инициалам
          </button>
          <button type="button" class="seg-btn" :class="{ active: mode === 'vector' }" @click="mode = 'vector'">
            Векторные
          </button>
        </div>

        <div class="row">
          <label class="field field--half">
            <span class="field__label">Размер</span>
            <select v-model.number="size" class="field__input field__select">
              <option v-for="s in sizeOptions" :key="s" :value="s">{{ s }}</option>
            </select>
          </label>
          <label class="field field--half">
            <span class="field__label">Палитра</span>
            <select v-model="palette" class="field__input field__select">
              <option v-for="p in paletteOptions" :key="p.value" :value="p.value">{{ p.label }}</option>
            </select>
          </label>
        </div>

        <div class="row">
          <label class="field field--half">
            <span class="field__label">bg (hex)</span>
            <div class="input-addon">
              <input v-model="bg" class="field__input input-addon__input" placeholder="из палитры" />
              <ColorPickerButton v-model="bg" />
            </div>
          </label>
          <label class="field field--half">
            <span class="field__label">fg (hex)</span>
            <div class="input-addon">
              <input v-model="fg" class="field__input input-addon__input" placeholder="из палитры" />
              <ColorPickerButton v-model="fg" />
            </div>
          </label>
        </div>

        <label class="field" v-if="mode === 'initials'">
          <span class="field__label">Инициалы</span>
          <input v-model="initialsText" maxlength="3" class="field__input" />
        </label>

        <div class="row" v-if="mode === 'initials'">
          <label class="field field--half">
            <span class="field__label">Гарнитура</span>
            <select v-model="family" class="field__input field__select">
              <option v-for="f in familyOptions" :key="f.value" :value="f.value">{{ f.label }}</option>
            </select>
          </label>
          <label class="field field--half">
            <span class="field__label">font (px)</span>
            <input v-model.number="font" type="number" min="1" class="field__input" placeholder="авто" />
          </label>
        </div>

        <div class="row" v-if="mode === 'vector'">
          <label class="field field--half">
            <span class="field__label">Тип</span>
            <select v-model="vectorKind" class="field__input field__select">
              <option v-for="k in vectorKinds" :key="k.value" :value="k.value">{{ k.label }}</option>
            </select>
          </label>
          <label class="field field--half">
            <span class="field__label">Форма</span>
            <select v-model="styleMenu" class="field__input field__select">
              <option v-for="s in styleOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
          </label>
        </div>

        <label class="field field--last">
          <span class="field__label">seed (опционально)</span>
          <input v-model="seed" class="field__input" />
        </label>
      </div>

      <aside class="aside">
        <div class="url-row">
          <label class="field field--grow">
            <span class="field__label">Итоговый URL</span>
            <input v-model="editableUrl" readonly class="field__input field__input--mono" />
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
            <img
              :src="editableUrl"
              alt="Превью аватара"
              class="preview__img"
              :class="{ 'preview__img--round': shape === 'round' }"
            />
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
.segmented {
  display: inline-flex;
  background: var(--border);
  border-radius: 999px;
  padding: 0.15rem;
  margin-bottom: 0.95rem;
}
.seg-btn {
  border: none;
  background: transparent;
  border-radius: 999px;
  padding: 0.35rem 0.8rem;
  font: inherit;
  font-size: 0.84rem;
  cursor: pointer;
}
.seg-btn.active {
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
.field--last {
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
.url-row {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1rem;
  align-items: flex-end;
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
.preview__img--round {
  border-radius: 50%;
}
</style>
