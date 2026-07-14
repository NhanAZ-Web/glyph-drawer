<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { get } from 'svelte/store'
  import { canvasStore } from '../stores/canvasStore'
  import type { EditorState } from '../types'
  import { compositeLayers } from '../utils/matrix'
  import { toastStore } from '../stores/toastStore'

  let state: EditorState = get(canvasStore)
  const unsubscribe = canvasStore.subscribe((value) => {
    state = value
  })
  onDestroy(unsubscribe)

  let canvas: HTMLCanvasElement
  let container: HTMLElement
  let ctx: CanvasRenderingContext2D | null = null
  let isPointerDown = false
  let gesturePoints: Array<{ x: number; y: number }> = []
  let startPoint: { x: number; y: number } | null = null
  let previewPoints: Array<[number, number]> = []
  let hoverCell: { x: number; y: number } | null = null
  let pixelSize = 18

  $: renderCanvas(state, previewPoints, hoverCell)

  function computePixelSize(size: number): number {
    if (!container) return 18
    const rect = (container.parentElement ?? container).getBoundingClientRect()
    const padding = 28
    const available = Math.min(rect.width, rect.height) - padding * 2
    const fitPixelSize = Math.max(2, Math.floor(available / size))
    return Math.min(72, Math.max(2, fitPixelSize * (state.zoom / 100)))
  }

  function snapPixelSize(raw: number): number {
    // Avoid fractional physical pixels (e.g. DPR 1.25) that create faint grid seams even when grid is off
    const dpr = window.devicePixelRatio || 1
    return Math.max(2, Math.round(raw * dpr) / dpr)
  }

  onMount(() => {
    pixelSize = computePixelSize(state.size)
    renderCanvas(state, previewPoints, hoverCell)
    let rafId: number
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        pixelSize = computePixelSize(state.size)
        renderCanvas(state, previewPoints, hoverCell)
      })
    })
    observer.observe(container)
    return () => {
      cancelAnimationFrame(rafId)
      observer.disconnect()
    }
  })

  function getCellFromEvent(event: PointerEvent) {
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const size = state.size
    const cellSize = rect.width / size
    const x = Math.floor((event.clientX - rect.left) / cellSize)
    const y = Math.floor((event.clientY - rect.top) / cellSize)
    if (x < 0 || y < 0 || x >= size || y >= size) return null
    return { x, y }
  }

  function renderCanvas(_state = state, _preview = previewPoints, _hover = hoverCell) {
    if (!canvas || !state || !container) return
    if (!ctx) ctx = canvas.getContext('2d', { desynchronized: true })
    if (!ctx) return

    const context = ctx
    void _state
    void _preview
    void _hover

    const size = state.size
    const scale = window.devicePixelRatio || 1
    // Always recompute pixelSize from container to prevent stale values causing OOM
    pixelSize = snapPixelSize(computePixelSize(size))
    const devicePixels = scale * pixelSize
    canvas.width = size * devicePixels
    canvas.height = size * devicePixels
    canvas.style.width = `${size * pixelSize}px`
    canvas.style.height = `${size * pixelSize}px`

    context.setTransform(devicePixels, 0, 0, devicePixels, 0, 0)
    context.imageSmoothingEnabled = false
    context.clearRect(0, 0, size, size)

    state.layers.forEach((layer) => {
      if (!layer.visible) return
      context.globalAlpha = layer.opacity
      for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
          const color = layer.data[y]?.[x]
          if (!color) continue
          context.fillStyle = color
          context.fillRect(x, y, 1, 1)
        }
      }
    })

    // Reset alpha so grid/hover are not affected by layer opacity
    context.globalAlpha = 1

    if (previewPoints.length) {
      context.globalAlpha = 0.55
      context.fillStyle =
        state.tool === 'eraser' ? 'rgba(255,255,255,0.6)' : state.currentColor
      previewPoints.forEach(([x, y]) => {
        context.fillRect(x, y, 1, 1)
      })
      context.globalAlpha = 1
    }

    if (state.grid) {
      const lineWidth = 1 / (scale * pixelSize)

      // Regular grid lines
      context.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue(
        '--grid'
      )
      context.lineWidth = lineWidth
      for (let i = 0; i <= size; i += 1) {
        context.beginPath()
        context.moveTo(i, 0)
        context.lineTo(i, size)
        context.stroke()
        context.beginPath()
        context.moveTo(0, i)
        context.lineTo(size, i)
        context.stroke()
      }

      // Center guide lines (at midpoint)
      const mid = size / 2
      if (Number.isInteger(mid)) {
        context.strokeStyle = 'rgba(91, 155, 255, 0.45)'
        context.lineWidth = lineWidth * 2
        // Vertical center
        context.beginPath()
        context.moveTo(mid, 0)
        context.lineTo(mid, size)
        context.stroke()
        // Horizontal center
        context.beginPath()
        context.moveTo(0, mid)
        context.lineTo(size, mid)
        context.stroke()
      }
    }

    if (hoverCell) {
      context.strokeStyle = 'rgba(91, 155, 255, 0.7)'
      context.lineWidth = 1 / (scale * pixelSize)
      context.strokeRect(hoverCell.x, hoverCell.y, 1, 1)
    }
  }

  function handlePointerDown(event: PointerEvent) {
    const cell = getCellFromEvent(event)
    if (!cell) return
    isPointerDown = true
    gesturePoints = [{ x: cell.x, y: cell.y }]
    startPoint = cell
    if (state.tool === 'eyedropper') {
      const picked = compositeLayers(state.layers, cell.x, cell.y)
      if (picked) {
        canvasStore.setColor(picked)
        toastStore.push(`Picked color ${picked}`, 'info')
      }
      isPointerDown = false
      return
    }
    if (state.tool === 'fill') {
      canvasStore.applyFill(cell.x, cell.y)
      toastStore.push('Filled area', 'info')
      isPointerDown = false
      return
    }
    updatePreview(cell)
  }

  function handlePointerMove(event: PointerEvent) {
    const cell = getCellFromEvent(event)
    hoverCell = cell
    if (!cell || !isPointerDown) {
      previewPoints = state.tool === 'line' || state.tool === 'rect' ? previewPoints : []
      return
    }

    if (state.tool === 'brush' || state.tool === 'eraser') {
      const exists = gesturePoints.some((p) => p.x === cell.x && p.y === cell.y)
      if (!exists) gesturePoints.push(cell)
      previewPoints = gesturePoints.map((p) => [p.x, p.y])
    }

    if ((state.tool === 'line' || state.tool === 'rect') && startPoint) {
      updatePreview(cell)
    }
  }

  function handlePointerUp(event: PointerEvent) {
    const cell = getCellFromEvent(event)
    if (!isPointerDown) return

    if (state.tool === 'brush') {
      canvasStore.applyBrush(gesturePoints)
    }
    if (state.tool === 'eraser') {
      canvasStore.applyEraser(gesturePoints)
    }
    if ((state.tool === 'line' || state.tool === 'rect') && startPoint && cell) {
      if (state.tool === 'line') {
        canvasStore.applyLine(startPoint.x, startPoint.y, cell.x, cell.y)
      } else {
        canvasStore.applyRect(startPoint.x, startPoint.y, cell.x, cell.y)
      }
    }

    gesturePoints = []
    previewPoints = []
    startPoint = null
    isPointerDown = false
  }

  function handlePointerLeave() {
    hoverCell = null
    previewPoints = []
    if (isPointerDown) {
      handlePointerUp(new PointerEvent('pointerup'))
    }
  }

  function updatePreview(point: { x: number; y: number }) {
    if (!startPoint) return
    if (state.tool === 'line') {
      const dx = point.x - startPoint.x
      const dy = point.y - startPoint.y
      const steps = Math.max(Math.abs(dx), Math.abs(dy))
      const pts: Array<[number, number]> = []
      for (let i = 0; i <= steps; i += 1) {
        const x = Math.round(startPoint.x + (dx * i) / steps)
        const y = Math.round(startPoint.y + (dy * i) / steps)
        pts.push([x, y])
      }
      previewPoints = pts
    }
    if (state.tool === 'rect') {
      const minX = Math.min(startPoint.x, point.x)
      const maxX = Math.max(startPoint.x, point.x)
      const minY = Math.min(startPoint.y, point.y)
      const maxY = Math.max(startPoint.y, point.y)
      const pts: Array<[number, number]> = []
      for (let y = minY; y <= maxY; y += 1) {
        for (let x = minX; x <= maxX; x += 1) {
          pts.push([x, y])
        }
      }
      previewPoints = pts
    }
  }
</script>

<div class="canvas-stage-wrapper" bind:this={container}>
  <div class="canvas-stage">
    <canvas
      class="canvas-board"
      bind:this={canvas}
      on:pointerdown={handlePointerDown}
      on:pointermove={handlePointerMove}
      on:pointerup={handlePointerUp}
      on:pointerleave={handlePointerLeave}
    ></canvas>
  </div>
</div>

<style>
  .canvas-stage-wrapper {
    width: max-content;
    height: max-content;
    min-width: 100%;
    min-height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: auto;
    padding: 16px;
  }

  .canvas-board {
    max-width: none;
  }

  @media (max-width: 767px) {
    .canvas-stage-wrapper {
      align-items: flex-start;
    }
  }
</style>
