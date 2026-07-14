import { get } from 'svelte/store'
import { beforeEach, describe, expect, it, vi } from 'vitest'

async function loadCanvasStore() {
  const { canvasStore } = await import('./canvasStore')
  return canvasStore
}

describe('canvasStore zoom', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.resetModules()
  })

  it('clamps and resets canvas zoom', async () => {
    const canvasStore = await loadCanvasStore()

    expect(get(canvasStore).zoom).toBe(100)

    canvasStore.zoomIn()
    expect(get(canvasStore).zoom).toBe(125)

    canvasStore.setZoom(999)
    expect(get(canvasStore).zoom).toBe(400)

    canvasStore.setZoom(1)
    expect(get(canvasStore).zoom).toBe(25)

    canvasStore.resetZoom()
    expect(get(canvasStore).zoom).toBe(100)
  })

  it('starts a new document at fit zoom', async () => {
    const canvasStore = await loadCanvasStore()

    canvasStore.setZoom(175)
    canvasStore.newDocument(64)

    const state = get(canvasStore)
    expect(state.size).toBe(64)
    expect(state.zoom).toBe(100)
  })
})
