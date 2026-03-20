<script lang="ts">
  import { canvasStore } from '../stores/canvasStore'
  import { toastStore } from '../stores/toastStore'
  import { isValidHex, normalizeHex } from '../utils/color'

  export let palette: string[] = []
  export let currentColor: string

  let customColor = '#0f172a'

  function pick(color: string) {
    canvasStore.setColor(color)
  }

  function add() {
    const normalized = normalizeHex(customColor)
    if (!isValidHex(normalized)) {
      toastStore.push('Invalid color', 'error')
      return
    }
    canvasStore.addPaletteColor(normalized)
    toastStore.push('Added color', 'success')
  }
</script>

<div class="stack">
  <div class="palette-grid">
    {#each palette as color (color)}
      <button
        class={`color-swatch ${currentColor === color ? 'active' : ''}`}
        style={`background:${color}`}
        on:click={() => pick(color)}
        aria-label={`Select color ${color}`}
        title={color}
      ></button>
    {/each}
  </div>
  <div class="palette-input-row">
    <label class="color-picker-label" title="Pick color">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22l1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="M14.5 5.5l4-4a1.41 1.41 0 012 2l-4 4"/><path d="M12 8l4 4"/></svg>
      <span class="color-picker-preview" style="background:{customColor}"></span>
      <input type="color" bind:value={customColor} aria-label="Pick color" />
    </label>
    <input class="palette-hex-input" type="text" bind:value={customColor} aria-label="Hex" placeholder="#000000" />
    <button class="btn btn-sm" on:click={add} aria-label="Add color to palette">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    </button>
  </div>
</div>

<style>
  .color-picker-label {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    padding: 3px 6px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--panel-alt);
    position: relative;
  }
  .color-picker-label input[type='color'] {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }
  .color-picker-preview {
    width: 14px;
    height: 14px;
    border-radius: 2px;
    border: 1px solid var(--border);
    flex-shrink: 0;
  }
  .palette-hex-input {
    flex: 1;
    min-width: 0;
    max-width: 80px;
  }
</style>
