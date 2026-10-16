/* ═══════════════════════════════════════════════════════════════
   Liquid Glass Studio — app logic (vanilla JS, no build step)
   Everything the sliders change is kept in one tiny state object,
   turned into CSS by applyGlass() and into copy-paste snippets
   by the exporters below. That is the whole app. 🙂
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ── 1. State ─────────────────────────────────────────────────── */
const state = {
  blur: 16,        // px — frosting intensity
  opacity: 0.18,   // 0..1 — tint alpha (how "milky" the glass is)
  saturation: 160, // % — color boost of whatever is behind the glass
  radius: 24,      // px — corner roundness
  shadow: 32,      // px — drop shadow blur (depth)
  border: 0.6,     // 0..1 — edge light intensity
  tint: '#ffffff', // glass material color
  refraction: false,
  distortion: 12,  // feDisplacementMap scale (visual bend amount)
};

const SLIDERS = [
  { key: 'blur',        label: 'Blur',             hint: 'the frosting — how strongly the background is blurred', min: 0,   max: 40,  step: 1,    unit: 'px' },
  { key: 'opacity',     label: 'Milkiness',        hint: 'alpha of the tint — more means thicker, milkier glass',   min: 0.02, max: 0.6, step: 0.01, unit: '' },
  { key: 'saturation',  label: 'Saturation boost', hint: 'makes colors behind the glass pop (iOS loves ~150–180%)', min: 100, max: 250, step: 5,    unit: '%' },
  { key: 'radius',      label: 'Corner radius',    hint: 'roundness of the panel corners',                          min: 0,   max: 40,  step: 1,    unit: 'px' },
  { key: 'shadow',      label: 'Depth shadow',     hint: 'drop shadow that lifts the panel off the background',     min: 0,   max: 80,  step: 2,    unit: 'px' },
  { key: 'border',      label: 'Edge light',       hint: 'the 1px light caught by the glass edge — the secret sauce', min: 0, max: 1,   step: 0.05, unit: '' },
  { key: 'distortion',  label: 'Refraction bend',  hint: 'how strongly light bends (needs refraction enabled)',     min: 0,   max: 30,  step: 1,    unit: '',    needsRefraction: true },
];

const PRESETS = [
  { name: 'iOS Dock',    state: { blur: 20, opacity: 0.22, saturation: 170, radius: 28, shadow: 40, border: 0.7,  tint: '#ffffff', refraction: false } },
  { name: 'Frosted',     state: { blur: 12, opacity: 0.12, saturation: 140, radius: 20, shadow: 24, border: 0.5,  tint: '#ffffff', refraction: false } },
  { name: 'Thick lens',  state: { blur: 28, opacity: 0.32, saturation: 190, radius: 32, shadow: 48, border: 0.85, tint: '#e0f2fe', refraction: true, distortion: 14 } },
  { name: 'Dark smoke',  state: { blur: 16, opacity: 0.30, saturation: 130, radius: 18, shadow: 56, border: 0.25, tint: '#0f172a', refraction: false } },
  { name: 'Rose glass',  state: { blur: 14, opacity: 0.20, saturation: 180, radius: 26, shadow: 32, border: 0.65, tint: '#fecdd3', refraction: false } },
  { name: 'Neon edge',   state: { blur: 10, opacity: 0.08, saturation: 200, radius: 16, shadow: 20, border: 1.0,  tint: '#ffffff', refraction: false } },
];

/* ── 2. Tiny DOM helpers ──────────────────────────────────────── */
const $ = (sel) => document.querySelector(sel);
const glassCard = $('#glass-card');
const previewArea = $('#preview-area');
const toast = $('#toast');

function showToast(text) {
  toast.textContent = text;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 1500);
}

function hexToRgb(hex) {
  const m = hex.replace('#', '');
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

const round2 = (n) => Math.round(n * 100) / 100;

/* ── 3. Build the sliders ─────────────────────────────────────── */
function buildControls() {
  const list = $('#control-list');
  list.innerHTML = '';
  for (const s of SLIDERS) {
    const row = document.createElement('div');
    row.className = 'slider-row';
    row.dataset.for = s.key;

    const label = document.createElement('label');
    label.innerHTML =
      `<span>${s.label}<span class="hint">${s.hint}</span></span>` +
      `<span class="value"></span>`;

    const input = document.createElement('input');
    Object.assign(input, { type: 'range', id: `ctl-${s.key}` });
    input.min = s.min; input.max = s.max; input.step = s.step;
    input.value = state[s.key];
    input.addEventListener('input', () => {
      state[s.key] = parseFloat(input.value);
      row.querySelector('.value').textContent = formatValue(s);
      applyGlass();
      refreshExport();
    });

    row.append(label, input);
    list.append(row);
    row.querySelector('.value').textContent = formatValue(s);
    if (s.needsRefraction) row.classList.add('needs-refraction');
  }
  syncRefractionUI();
}

function formatValue(s) {
  return `${state[s.key]}${s.unit}`;
}

/* ── 4. The star of the show: state → real glass styles ───────── */
function applyGlass() {
  const { r, g, b } = hexToRgb(state.tint);
  const bd = [
    state.refraction ? 'url(#liquid-glass-filter)' : '',
    `blur(${state.blur}px)`,
    `saturate(${state.saturation}%)`,
  ].filter(Boolean).join(' ');

  const B = state.border;
  Object.assign(glassCard.style, {
    background: `rgba(${r}, ${g}, ${b}, ${state.opacity})`,
    backdropFilter: bd,
    WebkitBackdropFilter: bd,
    borderRadius: `${state.radius}px`,
    border: `1px solid rgba(255, 255, 255, ${round2(Math.min(0.8, B * 0.55))})`,
    boxShadow: [
      `0 8px ${state.shadow}px rgba(0, 0, 0, 0.35)`,
      `inset 0 1px 0 rgba(255, 255, 255, ${round2(B)})`,
      `inset 0 -1px 0 rgba(255, 255, 255, ${round2(B * 0.35)})`,
    ].join(', '),
  });
}

/* ── 5. Refraction: SVG displacement filter on/off ────────────── */
function syncRefractionUI() {
  const on = state.refraction;

  // inject / update the SVG filter
  let holder = $('#svg-filter-holder');
  if (on && !holder) {
    holder = document.createElement('div');
    holder.id = 'svg-filter-holder';
    document.body.append(holder);
  }
  if (holder) {
    holder.innerHTML = on ? `
      <svg width="0" height="0" style="position:absolute" aria-hidden="true">
        <filter id="liquid-glass-filter" color-interpolation-filters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.015 0.015"
                        numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise"
                             scale="${state.distortion}"
                             xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>` : '';
  }

  document.querySelectorAll('.needs-refraction')
    .forEach((el) => (el.style.display = on ? '' : 'none'));

  // export tab for the filter is only meaningful when refraction is on
  $('#tab-filter').style.display = on ? '' : 'none';
  if (!on && currentTab === 'filter') switchTab('css');
}

$('#ctl-refraction').addEventListener('change', (e) => {
  state.refraction = e.target.checked;
  syncRefractionUI();
  applyGlass();
  refreshExport();
});

/* ── 6. Presets & randomize ───────────────────────────────────── */
function buildPresets() {
  const list = $('#preset-list');
  PRESETS.forEach((p) => {
    const btn = document.createElement('button');
    btn.className = 'preset';
    btn.type = 'button';
    btn.textContent = p.name;
    btn.addEventListener('click', () => {
      Object.assign(state, p.state);
      document.querySelectorAll('.preset').forEach((x) => x.classList.remove('active'));
      btn.classList.add('active');
      syncInputsToState();
      syncRefractionUI();
      applyGlass();
      refreshExport();
      showToast(`Preset "${p.name}" applied`);
    });
    list.append(btn);
  });
}

function syncInputsToState() {
  for (const s of SLIDERS) {
    const input = $(`#ctl-${s.key}`);
    if (input) {
      input.value = state[s.key];
      input.closest('.slider-row').querySelector('.value').textContent = formatValue(s);
    }
  }
  $('#ctl-tint').value = state.tint;
  $('#ctl-refraction').checked = state.refraction;
}

$('#btn-random').addEventListener('click', () => {
  const pick = (a, b) => round2(a + Math.random() * (b - a));
  const tints = ['#ffffff', '#e0f2fe', '#fecdd3', '#bbf7d0', '#0f172a', '#fef3c7'];
  Object.assign(state, {
    blur: Math.round(pick(6, 30)),
    opacity: pick(0.08, 0.4),
    saturation: Math.round(pick(110, 220)),
    radius: Math.round(pick(10, 36)),
    shadow: Math.round(pick(12, 64)),
    border: pick(0.2, 1),
    tint: tints[Math.floor(Math.random() * tints.length)],
  });
  document.querySelectorAll('.preset').forEach((x) => x.classList.remove('active'));
  syncInputsToState();
  applyGlass();
  refreshExport();
  showToast('🎲 new random glass');
});

$('#ctl-tint').addEventListener('input', (e) => {
  state.tint = e.target.value;
  applyGlass();
  refreshExport();
});

/* ── 7. Preview background (blobs / sunset / your own image) ──── */
function useImageFile(file) {
  if (!file || !file.type.startsWith('image/')) return false;
  const url = URL.createObjectURL(file); // local only — never leaves the browser
  const img = $('#bg-image');
  img.style.backgroundImage = `url(${url})`;
  img.hidden = false;
  document.querySelectorAll('.blob').forEach((b) => (b.style.display = 'none'));
  showToast('background replaced — now tune the glass over it');
  return true;
}

document.querySelector('[data-bg="blobs"]').addEventListener('click', () => {
  $('#bg-image').hidden = true;
  document.querySelectorAll('.blob').forEach((b) => (b.style.display = ''));
});

document.querySelector('[data-bg="sunset"]').addEventListener('click', () => {
  const img = $('#bg-image');
  img.style.backgroundImage = "url('assets/demo-bg.jpg')";
  img.hidden = false;
  document.querySelectorAll('.blob').forEach((b) => (b.style.display = 'none'));
});

$('#bg-upload').addEventListener('change', (e) => {
  useImageFile(e.target.files && e.target.files[0]);
});

/* ── 7b. Faster background swap: drag & drop + paste ────────────
   Real-world use case: you screenshot YOUR site, drop or paste it
   here, and tune the glass on top of your actual design. */

// drag & drop an image file onto the preview area
['dragenter', 'dragover'].forEach((ev) =>
  previewArea.addEventListener(ev, (e) => {
    e.preventDefault();
    previewArea.classList.add('drop-target');
  }));
['dragleave', 'drop'].forEach((ev) =>
  previewArea.addEventListener(ev, (e) => {
    e.preventDefault();
    previewArea.classList.remove('drop-target');
  }));
previewArea.addEventListener('drop', (e) => {
  useImageFile(e.dataTransfer?.files?.[0]);
});

// paste a screenshot with Ctrl/Cmd+V anywhere on the page
window.addEventListener('paste', (e) => {
  const file = e.clipboardData?.files?.[0];
  if (file && useImageFile(file)) e.preventDefault();
});

/* ── 8. Drag the glass panel (the fun part) ───────────────────── */
(function enableDrag() {
  let drag = null;
  glassCard.addEventListener('pointerdown', (e) => {
    const cardRect = glassCard.getBoundingClientRect();
    drag = { dx: e.clientX - cardRect.left, dy: e.clientY - cardRect.top };
    glassCard.setPointerCapture(e.pointerId);
    glassCard.classList.add('dragging');
  });
  glassCard.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const area = previewArea.getBoundingClientRect();
    glassCard.style.left = `${e.clientX - area.left - drag.dx}px`;
    glassCard.style.top = `${e.clientY - area.top - drag.dy}px`;
    glassCard.style.transform = 'none';
  });
  const stop = () => { drag = null; glassCard.classList.remove('dragging'); };
  glassCard.addEventListener('pointerup', stop);
  glassCard.addEventListener('pointercancel', stop);
  // initial centering
  glassCard.style.transform = 'translate(-50%, -50%)';
})();

/* ── 9. Exporters: state → copy-paste snippets ────────────────── */
function backdropValue() {
  return [
    state.refraction ? 'url(#liquid-glass-filter)' : '',
    `blur(${state.blur}px)`,
    `saturate(${state.saturation}%)`,
  ].filter(Boolean).join(' ');
}

function rgbaString() {
  const { r, g, b } = hexToRgb(state.tint);
  return `rgba(${r}, ${g}, ${b}, ${state.opacity})`;
}

function shadowString() {
  const B = state.border;
  return [
    `0 8px ${state.shadow}px rgba(0, 0, 0, 0.35)`,
    `inset 0 1px 0 rgba(255, 255, 255, ${round2(B)})`,
    `inset 0 -1px 0 rgba(255, 255, 255, ${round2(B * 0.35)})`,
  ].join(',\n       ');
}

const EXPORTERS = {
  css: () => ({
    note: state.refraction
      ? 'Paste the CSS anywhere. Refraction additionally needs the SVG filter from the "SVG filter" tab — included once per page. Where backdrop-filter: url() is unsupported, browsers simply show the frosted version.'
      : 'Paste the CSS anywhere. Works in every modern browser.',
    code:
`/* ── Liquid Glass ─────────────────────────────
   generated with Liquid Glass Studio
   https://github.com/hilsetapp/Liquid-glass-studio */
.liquid-glass {
  /* frosting + color boost of whatever is behind */
  -webkit-backdrop-filter: ${backdropValue()};
  backdrop-filter: ${backdropValue()};

  /* the glass material itself */
  background: ${rgbaString()};

  /* shape */
  border-radius: ${state.radius}px;
  border: 1px solid rgba(255, 255, 255, ${round2(Math.min(0.8, state.border * 0.55))});

  /* depth + light caught at the edges */
  box-shadow: ${shadowString()};
}`,
  }),

  tailwind: () => ({
    note: 'Drop these classes on any element. Arbitrary values work with Tailwind v3+ out of the box; refraction (if enabled) additionally needs the SVG filter from the "SVG filter" tab.',
    code:
`<div class="${[
  `backdrop-blur-[${state.blur}px]`,
  `saturate-[${state.saturation}%]`,
  `rounded-[${state.radius}px]`,
  tintClass(),
  `shadow-[0_8px_${state.shadow}px_rgba(0,0,0,0.35)]`,
  `shadow-[inset_0_1px_0_rgba(255,255,255,${round2(state.border)})]`,
  `border`,
  `border-white/${Math.round(Math.min(0.8, state.border * 0.55) * 100)}`,
].join(' ')}">
  …your content…
</div>`,
  }),

  filter: () => ({
    note: 'Paste this ONCE per page (e.g. right after <body>). It powers the refraction bend referenced in the CSS tab.',
    code:
`<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <filter id="liquid-glass-filter" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.015 0.015"
                  numOctaves="2" seed="7" result="noise" />
    <feDisplacementMap in="SourceGraphic" in2="noise"
                       scale="${state.distortion}"
                       xChannelSelector="R" yChannelSelector="G" />
  </filter>
</svg>`,
  }),
};

function tintClass() {
  // map common tints to readable tailwind classes, else arbitrary rgba
  const known = { '#ffffff': `bg-white/[${state.opacity}]`, '#0f172a': `bg-slate-900/[${state.opacity}]` };
  return known[state.tint] ?? `bg-[${rgbaString().replace(/\s/g, '')}]`;
}

/* ── 10. Export panel & copy ──────────────────────────────────── */
let currentTab = 'css';
const exportPanel = $('#export-panel');

$('#btn-export').addEventListener('click', () => {
  exportPanel.hidden = false;
  refreshExport();
  exportPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab').forEach((t) =>
    t.classList.toggle('active', t.dataset.tab === tab));
  refreshExport();
}
document.querySelectorAll('.tab').forEach((t) =>
  t.addEventListener('click', () => switchTab(t.dataset.tab)));

function refreshExport() {
  if (exportPanel.hidden) return;
  const { code, note } = EXPORTERS[currentTab]();
  $('#export-code').textContent = code;
  $('#export-note').textContent = note;
}

$('#btn-copy').addEventListener('click', async () => {
  const text = $('#export-code').textContent;
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied ✓');
  } catch {
    // fallback for file:// pages or older browsers
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.append(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    showToast('Copied ✓');
  }
});

/* ── 11. Boot ─────────────────────────────────────────────────── */
buildControls();
buildPresets();
applyGlass();
