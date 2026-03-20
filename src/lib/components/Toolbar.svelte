<script lang="ts">
  import type { Tool } from '../types'
  import { canvasStore } from '../stores/canvasStore'

  export let tool: Tool

  const tools: Array<{ id: Tool; label: string; shortcut: string }> = [
    { id: 'brush', label: 'Brush', shortcut: 'B' },
    { id: 'eraser', label: 'Eraser', shortcut: 'E' },
    { id: 'eyedropper', label: 'Eyedropper', shortcut: 'I' },
    { id: 'fill', label: 'Fill', shortcut: 'F' },
    { id: 'line', label: 'Line', shortcut: 'L' },
    { id: 'rect', label: 'Rect', shortcut: 'R' },
  ]

  function select(id: Tool) {
    canvasStore.setTool(id)
  }
</script>

<div class="stack">
  <div class="section-title">
    <span>Tools</span>
    <span class="pill">Pixel-perfect</span>
  </div>
  <div class="stack">
    {#each tools as item (item.id)}
      <button
        class={`btn ${tool === item.id ? 'primary' : ''}`}
        on:click={() => select(item.id)}
        aria-label={`Select ${item.label}`}
      >
        <span>{item.label}</span>
        <span class="kbd">{item.shortcut}</span>
      </button>
    {/each}
  </div>
</div>

