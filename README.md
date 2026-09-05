# Placeholder Image Generator Pro

Generate placeholder images entirely in your browser via `<canvas>` — no third-party API, no network calls.

> A fast, offline replacement for hosted placeholder services (like placehold.co or via.placeholder.com). Pick a size, style a solid or gradient background, drop in overlay text and an optional pattern, then download a real PNG or copy a ready-to-paste `<img>` tag and CSS snippet — all rendered live on canvas, all in your browser.

## Overview

Placeholder Image Generator Pro is part of the **Web Utility Suite**. It runs with no build step, no frameworks, and no dependencies — open `index.html` from disk and it works. Every pixel is drawn with the Canvas 2D API: background fill, an optional stripe/grid/noise pattern overlay, and centered text, all updating live as you adjust any control. The result can be downloaded as a real PNG or grabbed as copy-paste-ready markup.

## Features

- **Size presets** — 150×150, 300×200, 640×480, 800×400, 1200×630, and 1920×1080 — plus fully custom width/height (up to 4096px per side).
- **Solid or gradient background** — a single color picker, or two colors with an adjustable angle (0–360°), using the same angle convention as CSS `linear-gradient()`.
- **Text overlay** that defaults to `{width} × {height}` and stays in sync live as you resize — until you edit it yourself, at which point the **Auto** toggle switches off automatically (flip it back on any time to resync).
- **Font controls** — seven real web-safe font families, a manual size field, and an **auto-fit** mode that shrinks the text to fit the canvas width automatically.
- **Pattern overlays**, each drawn with real canvas primitives and independent color, opacity and density controls:
  - **Diagonal stripes** — repeated rotated bars.
  - **Grid** — evenly spaced horizontal/vertical lines.
  - **Noise dots** — randomly placed low-opacity circles, seeded for stability (won't jitter while you tweak unrelated controls) with a **Shuffle** button to reroll.
- **Live preview** — the canvas re-renders instantly on every change, with a live size + estimated file-size badge in the header.
- **Download as PNG** via `canvas.toBlob`.
- **Copy-paste snippets** — a full `<img>` tag using the generated PNG as a data URI, and a separate, image-free **CSS snippet** that reproduces just the background (solid color or `linear-gradient`) at the chosen dimensions.
- **Auto-persist** — your last configuration is saved to `localStorage` and restored on return.
- **Dark & light themes**, fully responsive, keyboard-accessible.

## Installation

No dependencies, no build step.

```bash
git clone https://github.com/kasapdev/placeholder-image-generator-pro.git
cd placeholder-image-generator-pro
```

Then simply open `index.html` in any modern browser (double-click it, or `file://` it). That's it.

## Usage

1. Pick a **preset** size or type a custom **width/height**.
2. Choose **Solid** or **Gradient** background and set your colors (and angle, for gradients).
3. Adjust the **text overlay** — it auto-fills with the current dimensions; type your own text to override, or toggle **Auto** back on to resync.
4. Optionally add a **pattern overlay** — stripes, grid, or noise dots — and tune its color, opacity and density.
5. Click **Download PNG** (or press <kbd>Ctrl/⌘</kbd>+<kbd>S</kbd>) to save the image, or use the **Copy** buttons in the Snippets section to grab the `<img>` tag or the pure-CSS background.

## Keyboard Shortcuts

| Action                | Shortcut                        |
| ---------------------- | -------------------------------- |
| Download PNG            | <kbd>Ctrl/⌘</kbd> + <kbd>S</kbd> |
| Shuffle noise pattern   | <kbd>Ctrl/⌘</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd> |
| Show shortcuts help    | <kbd>?</kbd>                     |
| Close dialog            | <kbd>Esc</kbd>                   |

## Screenshots

> _Screenshots coming soon._

![screenshot](docs/screenshot-1.png)
![screenshot](docs/screenshot-2.png)

## Roadmap

- [ ] Radial and conic gradient backgrounds
- [ ] Export as SVG in addition to PNG
- [ ] Multiple text layers / custom positioning
- [ ] Batch-generate a set of sizes in one click (e.g. favicon/social-card set)
- [ ] Uploadable background image with overlay text/pattern composited on top

## License

MIT Licensed. Part of the [Web Utility Suite](../index.html).
