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
  <div class="section-title">
    <span>Layers</span>
    <span class="pill">N?n + v?</span>
  </div>
  {#each layers as layer (layer.id)}
    <div class="row" style="justify-content: space-between; align-items: center;">
      <div class="row">
        <input
          type="radio"
          name="layer-active"
          checked={layer.id === activeLayerId}
          on:change={() => setActive(layer.id)}
        />
        <div>
          <div style="font-weight: 600">{layer.name}</div>
          <div class="tooltip">{layer.visible ? 'Hi?n th?' : '?n'} · {Math.round(layer.opacity * 100)}%</div>
        </div>
      </div>
      <label class="toggle" style="padding: 6px 10px">
        <input
          type="checkbox"
          checked={layer.visible}
          on:change={() => toggleVisibility(layer.id)}
        />
        <span>{layer.visible ? 'On' : 'Off'}</span>
      </label>
    </div>
    <div class="slider-row">
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={layer.opacity}
        on:input={(event) => setOpacity(layer.id, parseFloat(event.currentTarget.value))}
      />
      <span class="pill">{Math.round(layer.opacity * 100)}%</span>
    </div>
    <div class="divider"></div>
  {/each}
</div>

