const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

class FakeClassList {
  constructor() { this.items = new Set(); }
  add(...values) { values.forEach((value) => this.items.add(value)); }
  remove(...values) { values.forEach((value) => this.items.delete(value)); }
  contains(value) { return this.items.has(value); }
  toggle(value, force) {
    const enabled = force === undefined ? !this.items.has(value) : force;
    enabled ? this.add(value) : this.remove(value);
    return enabled;
  }
}

class FakeElement {
  constructor() {
    this.children = [];
    this.dataset = {};
    this.attributes = {};
    this.listeners = {};
    this.style = { setProperty(name, value) { this[name] = value; } };
    this.classList = new FakeClassList();
    this.hidden = false;
    this.value = '';
    this.id = '';
    this.textContent = '';
    this._innerHTML = '';
  }
  set innerHTML(value) { this._innerHTML = value; }
  get innerHTML() { return this._innerHTML; }
  set className(value) { this.classList.items = new Set(String(value).split(/\s+/).filter(Boolean)); }
  addEventListener(name, handler) { (this.listeners[name] ||= []).push(handler); }
  append(...children) {
    children.forEach((child) => { this.children.push(child); child.parentElement = this; });
  }
  querySelector() { return (this._children ||= new FakeElement()); }
  closest() { return this.parentElement; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  setPointerCapture() {}
  getBoundingClientRect() { return { left: 0, top: 0, width: 600, height: 400 }; }
  scrollIntoView() {}
  select() {}
  remove() {}
}

function loadApp(search = '') {
  const all = [];
  const create = () => { const element = new FakeElement(); all.push(element); return element; };
  const ids = {};
  [
    'glass-card', 'preview-area', 'toast', 'control-list', 'ctl-refraction', 'tab-filter',
    'preset-list', 'ctl-tint', 'btn-random', 'btn-share', 'bg-image', 'bg-upload',
    'export-panel', 'btn-export', 'export-code', 'export-note', 'btn-copy',
  ].forEach((id) => { ids[id] = create(); });
  ids['export-panel'].hidden = true;

  const modes = ['card', 'button', 'nav'].map((mode) => {
    const button = create(); button.dataset.previewMode = mode; return button;
  });
  const tabs = ['css', 'variables', 'tailwind', 'filter'].map((tab) => {
    const button = create(); button.dataset.tab = tab; return button;
  });
  const backgrounds = { blobs: create(), sunset: create() };
  const blobs = [create(), create(), create()];
  const body = create();
  const document = {
    body,
    querySelector(selector) {
      if (selector.startsWith('#')) {
        const id = selector.slice(1);
        return ids[id] || all.find((element) => element.id === id) || null;
      }
      if (selector === '[data-bg="blobs"]') return backgrounds.blobs;
      if (selector === '[data-bg="sunset"]') return backgrounds.sunset;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === '[data-preview-mode]') return modes;
      if (selector === '.tab') return tabs;
      if (selector === '.blob') return blobs;
      if (selector === '.preset') return ids['preset-list'].children;
      if (selector === '.needs-refraction') return all.filter((element) => element.classList.contains('needs-refraction'));
      return [];
    },
    createElement() { return create(); },
    execCommand() { return true; },
  };
  const copied = [];
  const window = {
    location: { href: `https://example.test/Liquid-glass-studio/${search}`, search },
    addEventListener() {},
  };
  const navigator = { clipboard: { writeText: async (text) => copied.push(text) } };
  const context = vm.createContext({ document, window, navigator, URL, URLSearchParams, console, Math, setTimeout, clearTimeout });
  const source = fs.readFileSync(new URL('../app.js', `file://${__filename}`).pathname, 'utf8');
  vm.runInContext(source, context);
  return { context, ids, copied };
}

test('loads and clamps settings from a shared URL', () => {
  const { context } = loadApp('?blur=27&opacity=0.24&distortion=21&refraction=1&tint=%23dbeafe&preview=button');
  assert.equal(vm.runInContext('state.blur', context), 27);
  assert.equal(vm.runInContext('state.opacity', context), 0.24);
  assert.equal(vm.runInContext('state.distortion', context), 21);
  assert.equal(vm.runInContext('state.refraction', context), true);
  assert.equal(vm.runInContext('previewMode', context), 'button');
  const clamped = loadApp('?blur=999&tint=not-a-color&refraction=yes');
  assert.equal(vm.runInContext('state.blur', clamped.context), 40);
  assert.equal(vm.runInContext('state.tint', clamped.context), '#ffffff');
  assert.equal(vm.runInContext('state.refraction', clamped.context), false);
});

test('switches between card, button, and navigation previews', () => {
  const { context, ids } = loadApp();
  vm.runInContext("setPreviewMode('button')", context);
  assert.ok(ids['glass-card'].classList.contains('mode-button'));
  assert.match(ids['glass-card'].innerHTML, /preview-action/);
  vm.runInContext("setPreviewMode('nav')", context);
  assert.ok(ids['glass-card'].classList.contains('mode-nav'));
  assert.match(ids['glass-card'].innerHTML, /preview-nav/);
});

test('exports CSS variables and a single combined Tailwind shadow utility', () => {
  const { context } = loadApp();
  const css = vm.runInContext('EXPORTERS.css().code', context);
  assert.match(css, /@supports not/);
  assert.match(css, /rgba\(255, 255, 255, 0\.92\)/);
  const variables = vm.runInContext('EXPORTERS.variables().code', context);
  assert.match(variables, /--glass-backdrop/);
  assert.match(variables, /--glass-solid-fallback/);
  assert.match(variables, /@supports not/);
  const tailwind = vm.runInContext('EXPORTERS.tailwind().code', context);
  assert.equal((tailwind.match(/shadow-\[/g) || []).length, 1);
});

test('copies a settings link without putting a local image in it', async () => {
  const { context, copied } = loadApp('?blur=23&tint=%23dbeafe');
  vm.runInContext("setPreviewMode('nav')", context);
  await vm.runInContext('copySettingsLink()', context);
  assert.equal(copied.length, 1);
  const link = new URL(copied[0]);
  assert.equal(link.searchParams.get('blur'), '23');
  assert.equal(link.searchParams.get('tint'), '#dbeafe');
  assert.equal(link.searchParams.get('preview'), 'nav');
  assert.equal(link.searchParams.has('image'), false);
});
