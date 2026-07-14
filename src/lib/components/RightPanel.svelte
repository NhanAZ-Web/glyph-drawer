<script lang="ts">
  import type { EditorState } from '../types'
  import { canvasStore } from '../stores/canvasStore'
  import { toastStore } from '../stores/toastStore'
  import LayerPanel from './LayerPanel.svelte'
  import Palette from './Palette.svelte'
  import {
    downloadBlob,
    matrixToPng,
    visibleMatrixFromSnapshot,
  } from '../utils/exporters'
  import { pngFileToMatrix } from '../utils/importers'

  export let state: EditorState

  const sizes = [16, 32, 64, 128]
  let customSizeInput = ''
  let exportScale = 1

  const setSize = (size: number) => {
    canvasStore.setSize(size)
    toastStore.push(`Canvas ${size}x${size}`, 'info')
  }

  function handleCustomSize() {
    const val = parseInt(customSizeInput, 10)
    if (isNaN(val) || val < 2) {
      toastStore.push('Size must be at least 2', 'error')
      return
    }
    if (val > 128) {
      toastStore.push(
        'Large size detected. For complex pixel art, consider using Aseprite',
        'info',
        5000
      )
      return
    }
    const even = val % 2 === 0 ? val : val + 1
    setSize(even)
    customSizeInput = ''
  }

  function handleCustomSizeKey(event: KeyboardEvent) {
    if (event.key === 'Enter') handleCustomSize()
  }

  async function exportPng() {
    const snapshot = canvasStore.getSnapshot()
    const blob = matrixToPng(visibleMatrixFromSnapshot(snapshot), exportScale)
    const scaleSuffix = exportScale > 1 ? `@${exportScale}x` : ''
    downloadBlob(blob, `glyph-${snapshot.size}${scaleSuffix}.png`)
    toastStore.push(
      `Exported PNG ${exportScale > 1 ? `(${exportScale}×)` : ''}`,
      'success'
    )
  }

  async function handleFile(file: File) {
    if (!file) return
    try {
      if (file.type.includes('png') || file.name.endsWith('.png')) {
        const matrix = await pngFileToMatrix(file)
        canvasStore.importMatrix(matrix)
        toastStore.push('Imported PNG', 'success')
        return
      }
      toastStore.push('Only PNG files are supported', 'error')
    } catch (error) {
      toastStore.push('Could not import file', 'error')
      console.error(error)
    }
  }

  let fileInput: HTMLInputElement

  function onDrop(event: DragEvent) {
    event.preventDefault()
    const file = event.dataTransfer?.files?.[0]
    if (file) handleFile(file)
  }

  function onFileChange(event: Event) {
    const input = event.target as HTMLInputElement
    if (input.files?.length) handleFile(input.files[0])
  }

  function clickDropzone() {
    fileInput?.click()
  }
</script>

<div class="props-panel">
  <!-- Canvas Size -->
  <div class="section">
    <div class="section-header">
      <span>Canvas</span>
    </div>
    <div class="section-body">
      <div class="size-grid">
        {#each sizes as sizeOpt (sizeOpt)}
          <button
            class={`size-pill ${state.size === sizeOpt ? 'active' : ''}`}
            on:click={() => setSize(sizeOpt)}
          >
            {sizeOpt}×{sizeOpt}
          </button>
        {/each}
      </div>
      <div class="custom-size-row">
        <input
          type="number"
          min="2"
          max="1024"
          step="2"
          placeholder="Custom"
          bind:value={customSizeInput}
          on:keydown={handleCustomSizeKey}
          class="custom-size-input"
        />
        <button class="btn btn-sm" on:click={handleCustomSize}>Set</button>
      </div>
    </div>
  </div>

  <!-- Palette -->
  <div class="section">
    <div class="section-header">
      <span>Colors</span>
    </div>
    <div class="section-body">
      <Palette palette={state.palette} currentColor={state.currentColor} />
    </div>
  </div>

  <!-- Layers -->
  <div class="section">
    <div class="section-header">
      <span>Layers</span>
    </div>
    <div class="section-body">
      <LayerPanel layers={state.layers} activeLayerId={state.activeLayerId} />
    </div>
  </div>

  <!-- Export / Import -->
  <div class="section">
    <div class="section-header">
      <span>Export / Import</span>
    </div>
    <div class="section-body">
      <div class="export-row">
        <button class="btn primary" style="flex:1" on:click={exportPng}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            ><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline
              points="7 10 12 15 17 10"
            /><line x1="12" y1="15" x2="12" y2="3" /></svg
          >
          Export PNG
        </button>
        <select class="export-scale-select" bind:value={exportScale}>
          <option value={1}>1×</option>
          <option value={2}>2×</option>
          <option value={4}>4×</option>
          <option value={8}>8×</option>
          <option value={16}>16×</option>
        </select>
      </div>
      <div
        class="dropzone"
        role="button"
        tabindex="0"
        aria-label="Click or drop PNG to import"
        on:drop={onDrop}
        on:dragover|preventDefault
        on:click={clickDropzone}
        on:keydown={(e) => e.key === 'Enter' && clickDropzone()}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          style="opacity:0.5"
          ><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline
            points="17 8 12 3 7 8"
          /><line x1="12" y1="3" x2="12" y2="15" /></svg
        >
        <span>Click or drop PNG here</span>
        <input
          bind:this={fileInput}
          type="file"
          accept="image/png"
          on:change={onFileChange}
          style="display:none"
        />
      </div>
    </div>
  </div>
</div>

<style>
  .custom-size-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 6px;
    align-items: center;
  }
  .custom-size-input {
    min-width: 0;
    text-align: center;
  }
  .export-scale-select {
    min-height: 44px;
    font-family: var(--font-mono);
    cursor: pointer;
  }
  .dropzone {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 12px;
  }
</style>
