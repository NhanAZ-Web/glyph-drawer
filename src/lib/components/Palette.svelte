<script lang="ts">
  import { canvasStore } from '../stores/canvasStore'
  import { toastStore } from '../stores/toastStore'
  import { isValidHex, normalizeHex } from '../utils/color'

  export let palette: string[] = []
  export let currentColor: string

  let customColor = '#0f172a'

  const paletteMeta: Record<string, { code: string; name: string; hex: string }> = {
    '#000000': { code: '§0', name: 'black', hex: '#000000' },
    '#0000aa': { code: '§1', name: 'dark_blue', hex: '#0000AA' },
    '#00aa00': { code: '§2', name: 'dark_green', hex: '#00AA00' },
    '#00aaaa': { code: '§3', name: 'dark_aqua', hex: '#00AAAA' },
    '#aa0000': { code: '§4', name: 'dark_red', hex: '#AA0000' },
    '#aa00aa': { code: '§5', name: 'dark_purple', hex: '#AA00AA' },
    '#ffaa00': { code: '§6', name: 'gold', hex: '#FFAA00' },
    '#aaaaaa': { code: '§7', name: 'gray', hex: '#AAAAAA' },
    '#555555': { code: '§8', name: 'dark_gray', hex: '#555555' },
    '#5555ff': { code: '§9', name: 'blue', hex: '#5555FF' },
    '#55ff55': { code: '§a', name: 'green', hex: '#55FF55' },
    '#55ffff': { code: '§b', name: 'aqua', hex: '#55FFFF' },
    '#ff5555': { code: '§c', name: 'red', hex: '#FF5555' },
    '#ff55ff': { code: '§d', name: 'light_purple', hex: '#FF55FF' },
    '#ffff55': { code: '§e', name: 'yellow', hex: '#FFFF55' },
    '#ffffff': { code: '§f', name: 'white', hex: '#FFFFFF' },
    '#ddd605': { code: '§g', name: 'minecoin_gold', hex: '#DDD605' },
    '#e3d4d1': { code: '§h', name: 'material_quartz', hex: '#E3D4D1' },
    '#cecaca': { code: '§i', name: 'material_iron', hex: '#CECACA' },
    '#443a3b': { code: '§j', name: 'material_netherite', hex: '#443A3B' },
    '#971607': { code: '§m', name: 'material_redstone', hex: '#971607' },
    '#b4684d': { code: '§n', name: 'material_copper', hex: '#B4684D' },
    '#deb12d': { code: '§p', name: 'material_gold', hex: '#DEB12D' },
    '#47a036': { code: '§q', name: 'material_emerald', hex: '#47A036' },
    '#2cbaa8': { code: '§s', name: 'material_diamond', hex: '#2CBAA8' },
    '#21497b': { code: '§t', name: 'material_lapis', hex: '#21497B' },
    '#9a5cc6': { code: '§u', name: 'material_amethyst', hex: '#9A5CC6' },
    '#eb7114': { code: '§v', name: 'material_resin', hex: '#EB7114' },
  }

  function pick(color: string) {
    canvasStore.setColor(color)
  }

  function getColorLabel(color: string): string {
    const key = normalizeHex(color).toLowerCase()
    const meta = paletteMeta[key]
    if (!meta) return key
    const printableName = meta.name.replaceAll('_', ' ')
    return `${meta.code} - ${printableName} - ${meta.hex}`
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
        aria-label={`Select color ${getColorLabel(color)}`}
        title={getColorLabel(color)}
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
