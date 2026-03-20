# glyph-drawer

Minimal pixel/icon editor (client-only) built with Vite + Svelte + TypeScript, deployable on GitHub Pages.

## Features
- Pixel canvas with preset sizes (8/16/24/32) and custom even-number sizing (2–128).
- Tools: brush (B), eraser (E), eyedropper (I), fill (F), line (L), rectangle (R); pixel-perfect rendering with `image-rendering: pixelated`.
- Palette: 8 default colors, add custom HEX, always display current HEX.
- Layers: background + paint, visibility toggle and opacity slider, switch active layer.
- Undo/redo per session (in-memory, no cap) and always-on autosave to `localStorage`.
- Import: drag/drop PNG or click to browse. Export: PNG with configurable scale (1×–16×).
- Light/dark toggle, grid toggle with center guide lines, Aseprite-inspired layout.
- Auto-fit canvas to available viewport space - no manual zoom needed.
- Toasts for exports/errors. Status bar shows tool, canvas size, and current color.
- PWA-lite: optional offline cache via `public/service-worker.js` (registered in `main.ts`).

## Shortcuts
- B / E / I / F / L / R: switch tools
- Ctrl/Cmd+Z: undo · Shift+Ctrl/Cmd+Z: redo
- Ctrl/Cmd+S: quick PNG export
- N: new blank canvas (16x16)

## Scripts
- `npm run dev` – start Vite dev server
- `npm run build` – production build (outputs to `dist/`)
- `npm run preview` – preview production build
- `npm run lint` – ESLint + svelte-check
- `npm run test` – Vitest (jsdom)
- `npm run deploy` – build then publish `dist/` to `gh-pages` (local deploy)

## GitHub Pages
- `vite.config.ts` sets `base: '/glyph-drawer/'`.
- Workflow: `.github/workflows/deploy.yml` installs with `npm ci`, runs `npm run build`, then publishes `dist` via `peaceiris/actions-gh-pages@v4` (Node 20).

## Project layout
- `src/App.svelte` – layout (toolstrip/canvas/panel), shortcuts, theme toggle.
- `src/lib/stores/canvasStore.ts` – editor state, history, autosave.
- `src/lib/components/*` – UI pieces: canvas, toolbar, palette, layers, right panel, toasts, empty state.
- `src/lib/utils/*` – matrix helpers, flood fill, geometry, import/export utilities.
- `public/service-worker.js` – simple cache-first offline helper.

## Testing
- Utils test: matrix -> PNG (`src/lib/utils/exporters.test.ts`).
- UI smoke: renders empty state (`src/App.test.ts`).
