# glyph-drawer

Minimal pixel/icon editor (client-only) designed to feed the upcoming glyph API. Built with Vite + Svelte + TypeScript, deployable on GitHub Pages.

## Features
- Pixel canvas sizes 8/16/24/32 with smooth zoom (wheel + Ctrl/Cmd) and snap-to-grid drawing.
- Tools: brush (B), eraser (E), eyedropper (I), fill (F), line (L), rectangle (R); pixel-perfect rendering with `image-rendering: pixelated`.
- Palette: 8 default colors, add custom HEX, always display current HEX.
- Layers: background + paint, visibility toggle and opacity slider, switch active layer.
- Undo/redo per session (in-memory, no cap) and autosave to `localStorage` (default on).
- Imports: drag/drop PNG or JSON matrix. Exports: PNG (transparent), SVG (pixelated), JSON matrix.
- CTA: “Xuat & Gui sang glyph” opens a modal that calls stub `uploadToGlyph` (ready to swap for real API).
- Light/dark toggle, checkerboard toggle, grid toggle, subtle motion + Apple-like spacing.
- Toasts for saves/exports/errors. Empty state with quick 3-step guide.
- PWA-lite: optional offline cache via `public/service-worker.js` (registered in `main.ts`).

## Shortcuts
- B / E / I / F / L / R: switch tools
- Ctrl/Cmd+Z: undo · Shift+Ctrl/Cmd+Z: redo
- Ctrl/Cmd+S: quick JSON save
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
- `src/App.svelte` – layout (sidebar/canvas/panel), shortcuts, theme toggle.
- `src/lib/stores/canvasStore.ts` – editor state, history, autosave.
- `src/lib/components/*` – UI pieces: canvas, toolbar, palette, layers, right panel, toasts, modal, empty state.
- `src/lib/utils/*` – matrix helpers, flood fill, geometry, import/export utilities.
- `src/lib/api/uploadToGlyph.ts` – stub uploader to replace with real glyph API call.
- `public/service-worker.js` – simple cache-first offline helper.

## Testing
- Utils test: matrix -> PNG/JSON (`src/lib/utils/exporters.test.ts`).
- UI smoke: renders app brand (`src/App.test.ts`).

## TODO for glyph integration
- Swap `uploadToGlyph` with real HTTP call + auth.
- Wire CTA modal to show API response details and handle failure states.
- Add option to include palette metadata in upload payload if backend expects it.
