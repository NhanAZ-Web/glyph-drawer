<script lang="ts">
  import type { EditorState } from '../types'
  import { canvasStore } from '../stores/canvasStore'
  import { toastStore } from '../stores/toastStore'
  import Toolbar from './Toolbar.svelte'
  import Palette from './Palette.svelte'

  export let state: EditorState

  const undo = () => canvasStore.undo()
  const redo = () => canvasStore.redo()
  const clear = () => {
    canvasStore.newDocument(state.size)
    toastStore.push('New canvas', 'info')
  }
</script>

<div class="panel stack">
  <div class="section-title">
    <span>Toolbox</span>
    <span class="pill">Shortcut ready</span>
  </div>
  <Toolbar tool={state.tool} />

  <div class="row" style="gap: 8px;">
    <button class="btn" on:click={undo}>Undo</button>
    <button class="btn" on:click={redo}>Redo</button>
    <button class="btn ghost" on:click={clear}>New Canvas</button>
  </div>

  <div class="divider"></div>

  <div class="section-title">
    <span>Palette</span>
    <span class="pill">HEX</span>
  </div>
  <Palette palette={state.palette} currentColor={state.currentColor} />
</div>

