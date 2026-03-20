<script lang="ts">
  import { onDestroy } from 'svelte'
  import { get } from 'svelte/store'
  import CanvasBoard from './lib/components/CanvasBoard.svelte'
  import Sidebar from './lib/components/Sidebar.svelte'
  import RightPanel from './lib/components/RightPanel.svelte'
  import ToastStack from './lib/components/ToastStack.svelte'
  import GlyphModal from './lib/components/GlyphModal.svelte'
  import EmptyState from './lib/components/EmptyState.svelte'
  import { canvasStore } from './lib/stores/canvasStore'
  import { themeStore, type Theme } from './lib/stores/uiStore'
  import { toastStore } from './lib/stores/toastStore'
  import { combineVisibleLayers, isMatrixEmpty } from './lib/utils/matrix'
  import { matrixToPng, snapshotToJsonBlob, visibleMatrixFromSnapshot } from './lib/utils/exporters'
  import { uploadToGlyph } from './lib/api/uploadToGlyph'

  let state = get(canvasStore)
  const unsub = canvasStore.subscribe((value) => (state = value))
  onDestroy(unsub)

  let theme: Theme = get(themeStore)
  const unsubTheme = themeStore.subscribe((value) => (theme = value))
  onDestroy(unsubTheme)

  let glyphModalOpen = false

  const isEmpty = () => isMatrixEmpty(combineVisibleLayers(state.layers))

  async function handleSendToGlyph(format: 'png' | 'json') {
    const snapshot = canvasStore.getSnapshot()
    const payload =
      format === 'png'
        ? matrixToPng(visibleMatrixFromSnapshot(snapshot))
        : snapshotToJsonBlob(snapshot)
    const result = await uploadToGlyph(payload)
    toastStore.push(result.message, 'success')
    glyphModalOpen = false
  }

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
          quickSave()
        }
        break
      case 'n':
        canvasStore.newDocument(16)
        toastStore.push('Canvas moi 16x16', 'info')
        break
      default:
        break
    }
  }

  function quickSave() {
    const snapshot = canvasStore.getSnapshot()
    const blob = snapshotToJsonBlob(snapshot)
    const a = document.createElement('a')
    const url = URL.createObjectURL(blob)
    a.href = url
    a.download = `glyph-${snapshot.size}.json`
    a.click()
    URL.revokeObjectURL(url)
    toastStore.push('Da luu nhanh JSON (Ctrl/Cmd+S)', 'success')
  }
</script>

<svelte:head>
  <title>glyph-drawer Â· pixel to glyph uploader</title>
  <meta name="description" content="Pixel/icon mini editor, ready to export to glyph." />
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<div class="main-shell">
  <div class="topbar">
    <div class="brand">
      <span style="width: 12px; height: 12px; border-radius: 50%; background: var(--accent);"></span>
      <span>glyph-drawer</span>
      <span class="badge">client-only</span>
    </div>
    <div class="row">
      <button class="btn" on:click={() => themeStore.toggle()}>{theme === 'light' ? 'Dark' : 'Light'} mode</button>
      <button class="btn ghost" on:click={() => canvasStore.toggleGrid()}>Grid</button>
      <button class="btn ghost" on:click={() => canvasStore.toggleChecker()}>Caro</button>
    </div>
  </div>

  <div class="layout">
    <Sidebar {state} />

    <div class="panel" style="position: relative; overflow: hidden;">
      {#if isEmpty()}
        <EmptyState />
      {/if}
      <CanvasBoard />
    </div>

    <RightPanel state={state} onOpenGlyphModal={() => (glyphModalOpen = true)} />
  </div>
</div>

<GlyphModal open={glyphModalOpen} onClose={() => (glyphModalOpen = false)} onSend={handleSendToGlyph} />
<ToastStack />

