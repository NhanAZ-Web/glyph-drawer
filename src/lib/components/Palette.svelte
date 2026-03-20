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
      toastStore.push('Mau khong hop le', 'error')
      return
    }
    canvasStore.addPaletteColor(normalized)
    toastStore.push('Da them mau', 'success')
  }
</script>

<div class="stack">
  <div class="palette-grid">
    {#each palette as color (color)}
      <button
        class={`color-swatch ${currentColor === color ? 'active' : ''}`}
        style={`background:${color}`}
        on:click={() => pick(color)}
        aria-label={`Chon mau ${color}`}
        title={color}
      ></button>
    {/each}
  </div>
  <div class="row">
    <input type="color" bind:value={customColor} aria-label="Mau moi" />
    <input
      type="text"
      bind:value={customColor}
      aria-label="Hex"
      placeholder="#000000"
      style="width:110px"
    />
    <button class="btn" on:click={add}>+ Them</button>
  </div>
  <div class="tooltip">Dang chon: {currentColor}</div>
</div>

