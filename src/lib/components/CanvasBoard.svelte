<script lang="ts">
  import { onDestroy } from 'svelte'
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
  let ctx: CanvasRenderingContext2D | null = null
  let isPointerDown = false
  let gesturePoints: Array<{ x: number; y: number }> = []
  let startPoint: { x: number; y: number } | null = null
  let previewPoints: Array<[number, number]> = []
  let hoverCell: { x: number; y: number } | null = null

  $: renderCanvas(state, previewPoints, hoverCell)

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
    if (!canvas || !state) return
    if (!ctx) ctx = canvas.getContext('2d', { desynchronized: true })
    if (!ctx) return

    const context = ctx
    void _state
    void _preview
    void _hover

    const size = state.size
    const pixelSize = state.zoom
    const scale = window.devicePixelRatio || 1
    canvas.width = size * pixelSize * scale
    canvas.height = size * pixelSize * scale
    canvas.style.width = `${size * pixelSize}px`
    canvas.style.height = `${size * pixelSize}px`

    context.setTransform(scale * pixelSize, 0, 0, scale * pixelSize, 0, 0)
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

    if (previewPoints.length) {
      context.globalAlpha = 0.55
      context.fillStyle = state.tool === 'eraser' ? 'rgba(255,255,255,0.6)' : state.currentColor
      previewPoints.forEach(([x, y]) => {
        context.fillRect(x, y, 1, 1)
      })
      context.globalAlpha = 1
    }

    if (state.grid) {
      context.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--grid')
      context.lineWidth = 1 / (scale * pixelSize)
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
    }

    if (hoverCell) {
      context.strokeStyle = 'rgba(37, 99, 235, 0.6)'
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
        toastStore.push(`Chon mau ${picked}`, 'info')
      }
      isPointerDown = false
      return
    }
    if (state.tool === 'fill') {
      canvasStore.applyFill(cell.x, cell.y)
      toastStore.push('Fill vung', 'info')
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

  function handleWheel(event: WheelEvent) {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault()
      const nextZoom = state.zoom + event.deltaY * -0.02
      canvasStore.setZoom(nextZoom)
    }
  }
</script>

<div class="canvas-shell">
  <div class="canvas-inner" class:grid-checker={state.checker} on:wheel|passive={handleWheel}>
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
</div>

