<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { Vue3ColorPicker } from '@cyhnkckali/vue3-color-picker';

const props = defineProps({
  modelValue: { type: String, default: '' },
  /**
   * Если true — `v-model` хранит hex БЕЗ '#', а пикер работает с '#'.
   * Если false — `v-model` хранит hex С '#'.
   */
  hashless: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);

const open = ref(false);
const rootEl = ref(null);

const pickerValue = computed({
  get() {
    const raw = String(props.modelValue ?? '').trim();
    const noHash = raw.replace(/^#/, '');
    const hex = props.hashless ? noHash : raw.replace(/^#/, '');
    return `#${hex || '000000'}`;
  },
  set(v) {
    const raw = String(v ?? '').trim();
    const noHash = raw.replace(/^#/, '');
    emit('update:modelValue', props.hashless ? noHash : `#${noHash}`);
  },
});

function toggle() {
  if (props.disabled) return;
  open.value = !open.value;
}

function close() {
  open.value = false;
}

function onDocPointerDown(e) {
  if (!open.value) return;
  const t = e?.target;
  if (!(t instanceof Node)) return;
  if (!rootEl.value) return;
  if (!rootEl.value.contains(t)) close();
}

onMounted(() => document.addEventListener('pointerdown', onDocPointerDown));
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocPointerDown));
</script>

<template>
  <span ref="rootEl" class="cp-root">
    <button
      type="button"
      class="cp-btn"
      :class="{ 'cp-btn--disabled': disabled }"
      :style="{ '--swatch': pickerValue }"
      title="Выбрать цвет"
      aria-label="Выбрать цвет"
      :disabled="disabled"
      @click="toggle"
    >
      <span class="cp-swatch" aria-hidden="true" />
    </button>

    <span v-if="open" class="cp-popover" role="dialog" aria-label="Выбор цвета">
      <Vue3ColorPicker
        v-model="pickerValue"
        mode="solid"
        type="HEX"
        theme="light"
        :showAlpha="false"
        :showButtons="false"
        :showColorList="false"
      />
    </span>
  </span>
</template>

<style scoped>
.cp-root {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.cp-btn {
  width: 40px;
  height: 40px !important;
  padding: 0;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: #fff;
  box-sizing: border-box;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.cp-btn:hover {
  filter: brightness(1.02);
}

.cp-btn:focus-visible {
  outline: 2px solid var(--accent-soft);
  outline-offset: 2px;
}

.cp-btn--disabled {
  cursor: not-allowed;
  opacity: 0.6;
  filter: none;
}

.cp-swatch {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  background: var(--swatch, #000);
  border: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.25);
}

.cp-popover {
  position: absolute;
  z-index: 20;
  top: calc(100% + 8px);
  left: 0;
  padding: 0.6rem;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: #fff;
  box-shadow: 0 18px 50px -22px rgba(28, 25, 23, 0.45);
}
</style>
