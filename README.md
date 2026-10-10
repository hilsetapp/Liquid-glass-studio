<p align="center">
  <img src="assets/logo.png" alt="Liquid Glass Studio logo" width="140">
</p>

<h1 align="center">Liquid Glass Studio</h1>

<p align="center">
  <strong>Design Apple's iOS 26 "liquid glass" effect visually — copy the CSS in one click.</strong><br>
  No sign-up, no build step, no dependencies. Just open and play.
</p>

<p align="center">
  <a href="README.md"><b>English</b></a> · <a href="README.ru.md">Русский</a>
</p>

<p align="center">
  <a href="https://hilsetapp.github.io/liquid-glass-studio/"><img src="https://img.shields.io/badge/▶_live_demo-hilsetapp.github.io%2Fliquid--glass--studio-22d3ee" alt="Live demo"></a>
  <a href="https://github.com/hilsetapp/liquid-glass-studio/actions/workflows/pages.yml"><img src="https://github.com/hilsetapp/liquid-glass-studio/actions/workflows/pages.yml/badge.svg" alt="pages deploy"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="license: MIT"></a>
  <img src="https://img.shields.io/badge/build-none_vanilla_js-brightgreen" alt="no build step">
</p>

---

## What is this?

You know those see-through, frosted panels in iOS 26 — where the background
shines through, blurred and bent, with a thin light running along the edge?
That design language is called **Liquid Glass**.

Recreating it in CSS by hand is fiddly (`backdrop-filter` values, inset
shadows, displacement filters…). This little web app lets you **drag sliders,
watch a live preview, and copy production-ready CSS or Tailwind classes** —
no design degree required.

**Try it: https://hilsetapp.github.io/liquid-glass-studio/**

## Features

- 🎛 **7 fine-tuned controls** — blur, milkiness, saturation, radius, depth, edge light, refraction bend
- 🧲 **Draggable live preview** — pull the panel across colorful blobs and watch the light bend
- 💧 **Optional edge refraction** via an embedded SVG displacement filter (the wow-detail almost nobody implements)
- 🎨 **6 one-click presets** — iOS Dock, Frosted, Thick lens, Dark smoke, Rose glass, Neon edge
- 🖼 **Your own background** — upload any image to test the glass on real content
- 📋 **Export as CSS or Tailwind** with a one-click copy button
- 🎲 **"Surprise me" randomizer** for inspiration
- 📚 **Plain-words "How it works" section** built into the page (great for learning!)
- ⚡ **Zero dependencies, zero build** — one HTML file, one CSS file, one JS file

## Quick start

It's a static page — nothing to install:

```bash
git clone https://github.com/hilsetapp/liquid-glass-studio.git
cd liquid-glass-studio
# then either just open index.html in your browser, or serve it:
npx serve .
```

Open it, move the sliders, hit **"Get the code ⚡"**, paste the CSS into your project. Done.

## FAQ — the beginner edition

**Do I need Node, npm or a framework to use the output?**
No. The generated CSS is plain CSS. It works in any project — plain HTML,
React, Vue, WordPress, whatever.

**Where does the refraction work?**
`backdrop-filter` is supported in every modern browser. The optional SVG
refraction filter works in Safari and in Chromium with experimental web
features enabled. Where it's unsupported, the panel gracefully looks like
classic frosted glass — nothing breaks.

**Is it really free?**
MIT licensed. Use the generated CSS anywhere, forever.

## For contributors

The whole app is three files (`index.html`, `styles.css`, `app.js`) with
commented vanilla code — a perfect first open-source contribution target.
Ideas: more presets, gradient tint mode, `prefers-reduced-motion` handling,
React/Vue export snippets. See [CONTRIBUTING.md](CONTRIBUTING.md).

Deploys automatically to GitHub Pages on every push to `main`.

If this saved you time, **star the repo ★** — it helps others find it.

## License

[MIT](LICENSE)
