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

  function handleKeydown(event: KeyboardEvent) {
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
        canvasStore.newDocument(16)
        toastStore.push('New 16×16 canvas', 'info')
        break
      default:
        break
    }
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

<div class="main-shell">
  <!-- Menu Bar -->
  <div class="menubar">
    <div class="brand">
      <span class="brand-dot"></span>
      <span>glyph-drawer</span>
      <span class="brand-badge">EDITOR</span>
    </div>
    <div class="menubar-actions">
      <button
        class={`btn ghost ${state.grid ? 'active' : ''}`}
        aria-pressed={state.grid}
        on:click={() => canvasStore.toggleGrid()}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          ><path d="M3 3v18h18" /><path d="M9 3v18" /><path d="M15 3v18" /><path
            d="M3 9h18"
          /><path d="M3 15h18" /></svg
        >
        Grid
      </button>
      <button class="btn ghost" on:click={() => themeStore.toggle()}>
        {#if theme === 'light'}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            ><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" /></svg
          >
        {:else}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            ><circle cx="12" cy="12" r="5" /><path
              d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
            /></svg
          >
        {/if}
      </button>
    </div>
  </div>

  <!-- Left Toolstrip -->
  <Sidebar {state} />

  <!-- Center Canvas -->
  <div class="canvas-area">
    <CanvasBoard />
  </div>

  <!-- Right Properties -->
  <RightPanel {state} />

  <!-- Status Bar -->
  <div class="statusbar">
    <div class="statusbar-item">
      <span>Tool:</span>
      <span class="statusbar-accent">{capitalize(state.tool)}</span>
    </div>
    <div class="statusbar-item">
      <span>Canvas:</span>
      <span class="statusbar-accent">{state.size}×{state.size}</span>
    </div>
    <div class="statusbar-item">
      <span>Color:</span>
      <span class="statusbar-color-swatch" style="background:{state.currentColor};"
      ></span>
      <span class="statusbar-accent" style="font-family: var(--font-mono);"
        >{state.currentColor}</span
      >
    </div>
  </div>
</div>

<ToastStack />
