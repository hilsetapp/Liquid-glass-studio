# Contributing to Liquid Glass Studio

This project is intentionally tiny: **one HTML file, one CSS file, one JS file**,
no build step. That's a feature - keep it that way. 🙂

## Run it locally

No install needed: open `index.html` in a browser. Optionally `npx serve .`
for a local server. That's all.

## Ground rules

- **No frameworks, no build tools.** Vanilla HTML/CSS/JS with comments.
- **Everything lives in the `state` object** in `app.js` - new sliders = new
  state key + one entry in `SLIDERS`. Keep that pattern.
- Respect the educational mission: controls and UI text should stay friendly
  to beginners.

## Good first contributions

- New presets (`PRESETS` array in `app.js`)
- Gradient tint mode (two-color glass)
- `prefers-reduced-motion` support for the blob animation
- React / Vue inline-style export tabs
- Translations of the page UI

## Pull requests

1. Fork, branch from `main`.
2. Test by opening `index.html` - nothing else needed.
3. Explain the *why* in the PR description.
