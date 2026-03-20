<script lang="ts">
  import type { EditorState } from '../types'
  import { canvasStore } from '../stores/canvasStore'
  import { toastStore } from '../stores/toastStore'

  export let state: EditorState

  type ToolDef = { id: EditorState['tool']; label: string; shortcut: string }

  const tools: ToolDef[] = [
    { id: 'brush', label: 'Brush', shortcut: 'B' },
    { id: 'eraser', label: 'Eraser', shortcut: 'E' },
    { id: 'eyedropper', label: 'Eyedropper', shortcut: 'I' },
    { id: 'fill', label: 'Fill', shortcut: 'F' },
    { id: 'line', label: 'Line', shortcut: 'L' },
    { id: 'rect', label: 'Rect', shortcut: 'R' },
  ]

  const select = (id: EditorState['tool']) => canvasStore.setTool(id)
  const undo = () => canvasStore.undo()
  const redo = () => canvasStore.redo()
  const clear = () => {
    canvasStore.newDocument(state.size)
    toastStore.push('New canvas', 'info')
  }
</script>

<!-- SVG icon definitions -->
{#snippet toolIcon(id: string)}
  {#if id === 'brush'}
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.37 2.63a2.12 2.12 0 013 3L14 13l-4 1 1-4z"/><path d="M9 14.5A3.5 3.5 0 005.5 18 1.5 1.5 0 014 19.5 1.5 1.5 0 012.5 21h0A3.5 3.5 0 009 14.5z"/></svg>
  {:else if id === 'eraser'}
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20H7L3 16a1 1 0 010-1.41l9.59-9.59a2 2 0 012.82 0L20 9.59a2 2 0 010 2.82L13 19.5"/></svg>
  {:else if id === 'eyedropper'}
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22l1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="M14.5 5.5l4-4a1.41 1.41 0 012 2l-4 4"/><path d="M12 8l4 4"/></svg>
  {:else if id === 'fill'}
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 18.5l9-9 4 4-9 9z"/><path d="M7 13L4.5 10.5l7-7 4 4-7 7"/><path d="M19 13c1.7 1.7 3 3.3 3 5a3 3 0 01-6 0c0-1.7 1.3-3.3 3-5z"/></svg>
  {:else if id === 'line'}
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="19" x2="19" y2="5"/></svg>
  {:else if id === 'rect'}
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/></svg>
  {/if}
{/snippet}

<div class="toolstrip">
  {#each tools as t (t.id)}
    <button
      class={`tool-btn ${state.tool === t.id ? 'active' : ''}`}
      on:click={() => select(t.id)}
      title={`${t.label} (${t.shortcut})`}
      aria-label={`Select ${t.label}`}
    >
      {@render toolIcon(t.id)}
    </button>
  {/each}

  <div class="toolstrip-separator"></div>

  <button class="tool-btn tool-btn-small" on:click={undo} title="Undo (Ctrl+Z)">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
  </button>
  <button class="tool-btn tool-btn-small" on:click={redo} title="Redo (Ctrl+Shift+Z)">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.13-9.36L23 10"/></svg>
  </button>
  <button class="tool-btn tool-btn-small" on:click={clear} title="New Canvas (N)">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
  </button>
</div>
