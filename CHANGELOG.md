# Changelog

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Preview the same glass settings on a card, button, and navigation bar
- Copy and reopen a URL that restores slider settings and the selected preview mode
- Export CSS custom properties for a reusable project theme
- Include an opaque tint fallback when `backdrop-filter` is unavailable

### Fixed

- Combine Tailwind shadow layers into one class so they do not override each other
- Respect reduced-motion preferences in the animated preview

## [0.1.0] - 2026-10-10

Initial release.

### Added

- Visual liquid-glass editor: blur, milkiness, saturation, radius, depth, edge light controls
- Optional edge refraction via embedded SVG `feDisplacementMap` filter
- Draggable live preview over animated gradient blobs
- Custom background upload (local, never leaves the browser)
- 6 presets: iOS Dock, Frosted, Thick lens, Dark smoke, Rose glass, Neon edge
- One-click export: CSS, Tailwind classes, SVG filter snippet
- "Surprise me" randomizer
- Built-in plain-words "How it works" section
- Automatic deploy to GitHub Pages

[0.1.0]: https://github.com/hilsetapp/Liquid-glass-studio/releases/tag/v0.1.0
