<script lang="ts">
  import type { Layer, LayerId } from '../types'
  import { canvasStore } from '../stores/canvasStore'

  export let layers: Layer[] = []
  export let activeLayerId: LayerId

  const setActive = (id: LayerId) => canvasStore.setActiveLayer(id)
  const toggleVisibility = (id: LayerId) => canvasStore.toggleLayerVisibility(id)
  const setOpacity = (id: LayerId, value: number) => canvasStore.setLayerOpacity(id, value)
</script>

<div class="stack">
  {#each layers as layer (layer.id)}
    <div class="layer-row">
      <input
        type="radio"
        name="layer-active"
        checked={layer.id === activeLayerId}
        on:change={() => setActive(layer.id)}
        title="Set active layer"
      />
      <div class="layer-info">
        <div class="layer-name">{layer.name}</div>
        <div class="layer-meta">{layer.visible ? 'Visible' : 'Hidden'}</div>
      </div>
      <input
        type="checkbox"
        checked={layer.visible}
        on:change={() => toggleVisibility(layer.id)}
        title="Toggle visibility"
      />
      <div class="layer-opacity">
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={layer.opacity}
          on:input={(event) => setOpacity(layer.id, parseFloat(event.currentTarget.value))}
        />
        <span>{Math.round(layer.opacity * 100)}%</span>
      </div>
    </div>
  {/each}
</div>
