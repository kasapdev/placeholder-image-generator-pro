# Placeholder Image Generator Pro

Generate placeholder images locally via `<canvas>` — no third-party placeholder API, no network calls.

> A drop-in replacement for hosted placeholder services like placehold.co. Pick a size, style the background, overlay text, add a pattern, and export a real PNG — or grab a ready `<img>`/CSS snippet with the image baked in as a data URI. Everything renders in your browser; nothing is ever uploaded anywhere.

## Overview

Placeholder Image Generator Pro is part of the **Web Utility Suite**. It runs entirely in the browser with no build step, no frameworks, and no network calls — open `index.html` from disk and it works. A live canvas preview updates instantly as you tweak size, background, text, and pattern, and every export (PNG download, `<img>` tag, CSS snippet) is generated from that same canvas.

## Features

- **Size presets** — 150×150, 300×200, 640×360, 800×600, 1200×630 (social), 1920×1080 — plus custom width/height up to 4000px.
- **Background** — solid color, or a two-color linear gradient with an adjustable angle.
- **Text overlay** — defaults to `{width} × {height}` and stays in sync as you resize, until you type your own text; choose from 5 real web-safe font stacks, an auto-fit or manual font size, and a text color. Long text automatically shrinks to fit the canvas width.
- **Pattern overlay** — none, diagonal stripes, grid lines, or random noise dots, each drawn with real canvas primitives, with adjustable color and opacity.
- **Live preview** — the canvas redraws immediately on every control change.
- **Download as PNG** via `canvas.toBlob`.
- **Copyable snippets** — a ready `<img>` tag and a CSS `background-image` rule, both embedding the image as a `data:` URI so they work with zero hosting.
- **Auto-persist** — your last settings are saved to `localStorage` and restored on return.
- **Dark & light themes**, fully responsive down to 360px, accessible, and keyboard-driven.

## Installation

No dependencies, no build step.

```bash
git clone https://github.com/kasapdev/placeholder-image-generator-pro.git
cd placeholder-image-generator-pro
```

Then simply open `index.html` in any modern browser (double-click it, or `file://` it). That's it.

## Usage

1. Pick a **size preset** or type a custom width/height.
2. Choose **Solid** or **Gradient** background and set the colors (and angle, for gradients).
3. Edit the overlay **text**, font, size, and color — or leave it on the auto `width × height` label.
4. Optionally add a **pattern** (stripes, grid, or noise) with its own color/opacity.
5. **Download PNG**, or copy the generated **`<img>`** tag / **CSS** snippet — both work standalone since the image is embedded as a data URI.

## Keyboard Shortcuts

| Action              | Shortcut                       |
| ------------------- | ------------------------------ |
| Download PNG        | <kbd>Ctrl/⌘</kbd> + <kbd>S</kbd> |
| Show shortcuts help | <kbd>?</kbd>                    |
| Close dialog        | <kbd>Esc</kbd>                  |

## Screenshots

> _Screenshots coming soon._

![screenshot](docs/screenshot-1.png)
![screenshot](docs/screenshot-2.png)

## Roadmap

- [ ] Rounded-corner / circular canvas masks
- [ ] SVG export in addition to PNG
- [ ] Custom pattern color-pair (two-tone stripes/grid)
- [ ] Preset "aspect ratio lock" toggle when resizing
- [ ] Batch export multiple sizes at once

## License

MIT Licensed. Part of the [Web Utility Suite](../index.html).
