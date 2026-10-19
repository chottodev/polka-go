'use strict';

const path = require('path');

const { parseSize, normalizeHex, seededIndex } = require('./utils');
const { readSvgInnerFrom, stripInkscapeSodipodiMarkup, buildMirroredScleraGroup } = require('./vectorAssetSvg');

const ASSETS_DIR = path.join(__dirname, 'assets', 'fox');

const BG_PRESETS = [
  'c8dce8',
  'e8d8e5',
  'b0c7b6',
  'c2c768',
  'd8c8e8',
  'c8d8e8',
  'e0c8d0',
  'd0dfcc',
  'c8cce8',
  'd8c8e8',
  'c8e8e0',
  'e8d8c8',
  'd0d8e8',
  'c8e0d8',
  '9fc26d',
];

const ACCESSORY_PRESETS = [
  { kind: 'glasses', rel: 'accessories/glasses-01.svg', transform: 'translate(512, 512) scale(1.50) translate(-256, -256)' },
  { kind: 'glasses', rel: 'accessories/glasses-02.svg', transform: 'translate(0, 4) translate(512, 512) scale(0.92) translate(-512, -512)' },
  { kind: 'bowtie', rel: 'accessories/bowtie-01.svg', transform: 'translate(512, 820) scale(0.62) translate(-256, -256)' },
  {
    kind: 'bandana',
    rel: 'accessories/bandana-01.svg',
    transform: 'translate(560, 853) scale(0.34) translate(-776.5, -336)',
  },
];

const GLASSES_FILL_PRESETS = [
  '0cc6c2',
  'ed4a87',
  '6b8ce8',
  '614b04',
  '5a7d5a',
  '8b5cf6',
  '5e2700',
  '14b8a6',
  '64748b',
  'dc2626',
  '7c3aed',
  '059669',
];

const EYE_PRESETS = [
  {
    id: 'sclera01',
    sclera: 'eyes/sclera-01.svg',
    scleraTransform: null,
  },
  {
    id: 'sclera02',
    sclera: 'eyes/sclera-02.svg',
    scleraTransform: 'translate(0, 16)',
  },
];

const MOUTH_FILES = ['mouths/mouth-01.svg', 'mouths/mouth-02.svg', 'mouths/mouth-03.svg'];

function readSvgInner(rel) {
  return readSvgInnerFrom(ASSETS_DIR, rel);
}

function foxBgHex(seed, explicitBg) {
  const fallback = BG_PRESETS[seededIndex(String(seed) + ':fox-bg', BG_PRESETS.length)];
  return normalizeHex(explicitBg, fallback);
}

function pickAccessoryPreset(seed) {
  // Иногда добавляем аксессуар (очки), иногда нет.
  const r = seededIndex(String(seed) + ':fox-acc', 100);
  if (r < 55) return null;
  const idx = seededIndex(String(seed) + ':fox-acc-preset', ACCESSORY_PRESETS.length);
  return ACCESSORY_PRESETS[idx];
}

function pickGlassesFillHex(seed) {
  return GLASSES_FILL_PRESETS[seededIndex(String(seed) + ':fox-glasses-fill', GLASSES_FILL_PRESETS.length)];
}

function paintGlassesInner(inner, fillHex) {
  return inner.replace(/fill="#[^"]*"/, `fill="#${fillHex}"`);
}

function paintAccessoryInner(accPreset, inner, seed) {
  if (!accPreset) return '';
  if (accPreset.kind === 'glasses') return paintGlassesInner(inner, pickGlassesFillHex(seed));
  if (accPreset.kind === 'bowtie') return paintGlassesInner(inner, pickGlassesFillHex(seed));
  return inner;
}

function buildEyesGroup(preset) {
  const scleraInner = readSvgInner(preset.sclera);
  return buildMirroredScleraGroup({
    idPrefix: 'fox',
    scleraInner,
    scleraTransform: preset.scleraTransform,
  });
}

function generateAvatarVectorFox({ size, bg, seed = '' }) {
  const s = parseSize(size, 32, 1024, 128);
  const bgHex = foxBgHex(seed, bg);

  const baseInner = stripInkscapeSodipodiMarkup(readSvgInner('base.svg'));

  const eyePreset = EYE_PRESETS[seededIndex(String(seed) + ':fox-eyes', EYE_PRESETS.length)];
  const eyes = buildEyesGroup(eyePreset);

  const mouthRel = MOUTH_FILES[seededIndex(String(seed) + ':fox-mouth', MOUTH_FILES.length)];
  const mouthInner = readSvgInner(mouthRel);
  const mouthTransform = mouthRel === 'mouths/mouth-03.svg' ? 'translate(0, 16)' : null;
  const mouthBlock = mouthTransform
    ? `<g id="fox-mouth" transform="${mouthTransform}">${mouthInner}</g>`
    : `<g id="fox-mouth">${mouthInner}</g>`;

  const accPreset = pickAccessoryPreset(seed);
  const accInnerRaw = accPreset ? readSvgInner(accPreset.rel) : '';
  const accInner = accInnerRaw ? stripInkscapeSodipodiMarkup(accInnerRaw) : '';

  const accessoryInner = accPreset && accInner ? paintAccessoryInner(accPreset, accInner, seed) : '';
  const accessoryBlock = accessoryInner
    ? `<g id="fox-accessory"${accPreset?.transform ? ` transform="${accPreset.transform}"` : ''}>${accessoryInner}</g>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#${bgHex}"/>
  <g id="fox-base">${baseInner}</g>
  ${eyes}
  ${accessoryBlock}
  ${mouthBlock}
</svg>`;
}

module.exports = { generateAvatarVectorFox };

