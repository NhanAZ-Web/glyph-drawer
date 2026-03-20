<script lang="ts">
  import type { EditorState } from '../types'
  import { canvasStore } from '../stores/canvasStore'
  import { toastStore } from '../stores/toastStore'
  import LayerPanel from './LayerPanel.svelte'
  import { downloadBlob, matrixToPng, matrixToSvg, snapshotToJsonBlob, visibleMatrixFromSnapshot } from '../utils/exporters'
  import { parseJsonFile, pngFileToMatrix } from '../utils/importers'

  export let state: EditorState
  export let onOpenGlyphModal: () => void

  const sizes = [8, 16, 24, 32]

  const setSize = (size: number) => {
    canvasStore.setSize(size)
    toastStore.push(`Canvas ${size}x${size}`, 'info')
  }

  const handleZoom = (event: Event) => {
    const value = Number((event.target as HTMLInputElement).value)
    canvasStore.setZoom(value)
  }

  async function exportPng() {
    const snapshot = canvasStore.getSnapshot()
    const blob = matrixToPng(visibleMatrixFromSnapshot(snapshot))
    downloadBlob(blob, `glyph-${snapshot.size}.png`)
    toastStore.push('Exported PNG', 'success')
  }

  async function exportSvg() {
    const snapshot = canvasStore.getSnapshot()
    const blob = matrixToSvg(visibleMatrixFromSnapshot(snapshot))
    downloadBlob(blob, `glyph-${snapshot.size}.svg`)
    toastStore.push('Exported SVG', 'success')
  }

  async function exportJson() {
    const snapshot = canvasStore.getSnapshot()
    const blob = snapshotToJsonBlob(snapshot)
    downloadBlob(blob, `glyph-${snapshot.size}.json`)
    toastStore.push('Saved JSON', 'success')
  }

  async function handleFile(file: File) {
    if (!file) return
    try {
      if (file.type.includes('json')) {
        const payload = await parseJsonFile(file)
        canvasStore.importJSON(payload)
        toastStore.push('Imported JSON', 'success')
        return
      }
      if (file.type.includes('png') || file.name.endsWith('.png')) {
        const matrix = await pngFileToMatrix(file)
        canvasStore.importMatrix(matrix)
        toastStore.push('Imported PNG', 'success')
        return
      }
      toastStore.push('Unsupported format', 'error')
    } catch (error) {
      toastStore.push('Could not import file', 'error')
      console.error(error)
    }
  }

  function onDrop(event: DragEvent) {
    event.preventDefault()
    const file = event.dataTransfer?.files?.[0]
    if (file) handleFile(file)
  }

  function onFileChange(event: Event) {
    const input = event.target as HTMLInputElement
    if (input.files?.length) handleFile(input.files[0])
  }
</script>

<div class="panel stack">
  <div class="section-title">
    <span>Size</span>
    <span class="pill">Snap grid</span>
  </div>
  <div class="row" style="flex-wrap: wrap; gap: 8px 8px;">
    {#each sizes as sizeOpt (sizeOpt)}
      <button
        class={`btn ${state.size === sizeOpt ? 'primary' : ''}`}
        on:click={() => setSize(sizeOpt)}
      >
        {sizeOpt} x {sizeOpt}
      </button>
    {/each}
  </div>

  <div class="divider"></div>

  <div class="section-title"><span>Zoom</span><span class="pill">Ctrl/Cmd + wheel</span></div>
  <div class="slider-row">
    <input type="range" min="8" max="40" step="1" value={state.zoom} on:input={handleZoom} />
    <span class="pill">{Math.round(state.zoom)} px</span>
  </div>

  <div class="divider"></div>

  <LayerPanel layers={state.layers} activeLayerId={state.activeLayerId} />

  <div class="divider"></div>

  <div class="section-title"><span>Display</span><span class="pill">Grid & background</span></div>
  <div class="row" style="flex-wrap: wrap; gap: 8px;">
    <label class="toggle">
      <input type="checkbox" checked={state.grid} on:change={() => canvasStore.toggleGrid()} />
      <span>Grid</span>
    </label>
    <label class="toggle">
      <input type="checkbox" checked={state.checker} on:change={() => canvasStore.toggleChecker()} />
      <span>Checker</span>
    </label>
    <label class="toggle">
      <input
        type="checkbox"
        checked={state.autosave}
        on:change={(event) => canvasStore.setAutosave((event.target as HTMLInputElement).checked)}
      />
      <span>Autosave</span>
    </label>
  </div>

  <div class="divider"></div>

  <div class="section-title"><span>Export</span><span class="pill">PNG · SVG · JSON</span></div>
  <div class="stack">
    <div class="row">
      <button class="btn primary" style="flex:1" on:click={exportPng}>Export PNG</button>
      <button class="btn" on:click={exportSvg}>SVG</button>
      <button class="btn" on:click={exportJson}>JSON</button>
    </div>
    <button class="btn" on:click={onOpenGlyphModal}>Export & send to glyph</button>
  </div>

  <div class="divider"></div>

  <div class="section-title"><span>Import</span><span class="pill">PNG · JSON</span></div>
  <div
    class="panel"
    style="padding: 12px; text-align: center; border-style: dashed; cursor: pointer;"
    role="region"
    tabindex="-1"
    aria-label="Drop PNG or JSON"
    on:drop={onDrop}
    on:dragover|preventDefault
  >
    <p style="margin: 0 0 8px">Drag & drop PNG/JSON here</p>
    <input type="file" accept="image/png,application/json" on:change={onFileChange} />
  </div>

  <div class="divider"></div>
  <div class="stack">
    <div class="section-title"><span>Metadata</span></div>
    <div class="row" style="justify-content: space-between;">
      <span class="tooltip">Size</span>
      <span class="pill">{state.size} x {state.size}</span>
    </div>
    <div class="row" style="justify-content: space-between;">
      <span class="tooltip">Palette colors</span>
      <span class="pill">{state.palette.length}</span>
    </div>
    <div class="row" style="justify-content: space-between;">
      <span class="tooltip">Autosave</span>
      <span class="pill">{state.autosave ? 'On' : 'Off'}</span>
    </div>
  </div>
</div>

