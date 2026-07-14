<script lang="ts">
  import { onDestroy } from 'svelte'
  import { get } from 'svelte/store'
  import CanvasBoard from './lib/components/CanvasBoard.svelte'
  import Sidebar from './lib/components/Sidebar.svelte'
  import RightPanel from './lib/components/RightPanel.svelte'
  import ToastStack from './lib/components/ToastStack.svelte'
  import { canvasStore } from './lib/stores/canvasStore'
  import { themeStore, type Theme } from './lib/stores/uiStore'
  import { toastStore } from './lib/stores/toastStore'
  import {
    matrixToPng,
    downloadBlob,
    visibleMatrixFromSnapshot,
  } from './lib/utils/exporters'

  let state = get(canvasStore)
  const unsub = canvasStore.subscribe((value) => (state = value))
  onDestroy(unsub)

  let theme: Theme = get(themeStore)
  const unsubTheme = themeStore.subscribe((value) => (theme = value))
  onDestroy(unsubTheme)

  function isEditableTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false
    const tag = target.tagName.toLowerCase()
    return (
      target.isContentEditable ||
      tag === 'input' ||
      tag === 'textarea' ||
      tag === 'select'
    )
  }

  function handleKeydown(event: KeyboardEvent) {
    if (isEditableTarget(event.target)) return
    const { key, metaKey, ctrlKey, shiftKey } = event
    const mod = metaKey || ctrlKey
    switch (key.toLowerCase()) {
      case 'b':
        canvasStore.setTool('brush')
        break
      case 'e':
        canvasStore.setTool('eraser')
        break
      case 'i':
        canvasStore.setTool('eyedropper')
        break
      case 'f':
        canvasStore.setTool('fill')
        break
      case 'l':
        canvasStore.setTool('line')
        break
      case 'r':
        canvasStore.setTool('rect')
        break
      case 'z':
        if (mod && shiftKey) {
          event.preventDefault()
          canvasStore.redo()
        } else if (mod) {
          event.preventDefault()
          canvasStore.undo()
        }
        break
      case 's':
        if (mod) {
          event.preventDefault()
          quickExportPng()
        }
        break
      case 'n':
        canvasStore.newDocument(32)
        toastStore.push('New 32×32 canvas', 'info')
        break
      case '+':
      case '=':
        if (mod) {
          event.preventDefault()
          canvasStore.zoomIn()
        }
        break
      case '-':
        if (mod) {
          event.preventDefault()
          canvasStore.zoomOut()
        }
        break
      case '0':
        if (mod) {
          event.preventDefault()
          canvasStore.resetZoom()
        }
        break
      default:
        break
    }
  }

  function handleZoomInput(event: Event) {
    canvasStore.setZoom(Number((event.currentTarget as HTMLInputElement).value))
  }

  function quickExportPng() {
    const snapshot = canvasStore.getSnapshot()
    const blob = matrixToPng(visibleMatrixFromSnapshot(snapshot), 1)
    downloadBlob(blob, `glyph-${snapshot.size}.png`)
    toastStore.push('Exported PNG (Ctrl+S)', 'success')
  }

  function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1)
  }
</script>

<svelte:head>
  <title>glyph-drawer - pixel editor</title>
  <meta name="description" content="Minimal pixel/icon editor. Draw and export PNG." />
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<div class="app-container">
  <main class="workspace-layout">
    <section class="app-card tool-card drawer-card">
      <div class="panel-heading">
        <h2>Glyph Drawer</h2>
        <span class="detail-text">Pixel workspace</span>
      </div>

      <div class="drawer-tools-layout">
        <Sidebar {state} />

        <div class="drawer-quick-panel">
          <div class="field-block">
            <span class="form-label detail-text">Active tool</span>
            <div class="app-input readonly-field">{capitalize(state.tool)}</div>
          </div>

          <div class="drawer-metrics" aria-label="Current document">
            <div class="metric-tile">
              <span class="metric-label">Canvas</span>
              <span class="metric-value">{state.size}&times;{state.size}</span>
            </div>
            <div class="metric-tile">
              <span class="metric-label">Zoom</span>
              <span class="metric-value">{state.zoom}%</span>
            </div>
          </div>

          <div class="preset-actions drawer-actions">
            <button
              class={`btn btn-sm pill-action ${state.grid ? 'active' : ''}`}
              aria-pressed={state.grid}
              on:click={() => canvasStore.toggleGrid()}
            >
              Grid
            </button>
            <button class="btn btn-sm pill-action" on:click={() => themeStore.toggle()}>
              {theme === 'light' ? 'Dark' : 'Light'}
            </button>
            <button class="btn btn-sm pill-action" on:click={quickExportPng}>
              Export PNG
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="app-card atlas-card drawing-card">
      <div class="atlas-header">
        <div class="atlas-title-group">
          <h2>Drawing Output</h2>
          <span class="atlas-info"
            >glyph-{state.size}.png - {state.size}px &times; {state.size}px</span
          >
        </div>
        <div class="atlas-actions">
          <div class="zoom-controls" aria-label="Canvas zoom controls">
            <button
              class="btn btn-sm btn-icon"
              on:click={() => canvasStore.zoomOut()}
              aria-label="Zoom out"
            >
              -
            </button>
            <label class="zoom-slider-label">
              <span class="detail-text">Zoom</span>
              <input
                class="zoom-slider"
                type="range"
                min="25"
                max="400"
                step="25"
                value={state.zoom}
                on:input={handleZoomInput}
                aria-label="Canvas zoom"
              />
            </label>
            <button
              class="btn btn-sm btn-icon"
              on:click={() => canvasStore.zoomIn()}
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              class="btn btn-sm zoom-reset"
              on:click={() => canvasStore.resetZoom()}
            >
              Fit
            </button>
          </div>
          <span class="atlas-info color-info">
            <span class="statusbar-color-swatch" style="background:{state.currentColor};"
            ></span>
            {state.currentColor}
          </span>
          <button class="btn btn-sm export-btn" on:click={quickExportPng}>Download</button
          >
        </div>
      </div>

      <div class="atlas-body">
        <div class="canvas-area">
          <CanvasBoard />
        </div>
      </div>
    </section>

    <section class="app-card tool-card controls-card">
      <div class="panel-heading">
        <h2>Controls</h2>
        <span class="detail-text">Palette, layers, files</span>
      </div>
      <RightPanel {state} />
    </section>
  </main>

  <footer class="footer-links">
    <a href="https://github.com/NhanAZ/glyph" target="_blank" rel="noopener noreferrer">
      Glyph Tools
    </a>
    <a
      href="https://github.com/NhanAZ/glyph-drawer"
      target="_blank"
      rel="noopener noreferrer"
    >
      glyph-drawer
    </a>
  </footer>
</div>

<ToastStack />
