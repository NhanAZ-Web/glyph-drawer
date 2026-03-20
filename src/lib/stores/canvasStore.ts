import { get, writable } from 'svelte/store'
import type { EditorState, Layer, LayerId, Pixel, PixelMatrix, Snapshot, Tool } from '../types'
import { createMatrix, resizeMatrix } from '../utils/matrix'
import { floodFill } from '../utils/fill'
import { bresenhamLine, rectPoints } from '../utils/geometry'
import { isValidHex, normalizeHex } from '../utils/color'

const STORAGE_KEY = 'glyph-drawer-state-v1'
const defaultPalette = [
  '#000000',
  '#0000aa',
  '#00aa00',
  '#00aaaa',
  '#aa0000',
  '#aa00aa',
  '#ffaa00',
  '#aaaaaa',
  '#555555',
  '#5555ff',
  '#55ff55',
  '#55ffff',
  '#ff5555',
  '#ff55ff',
  '#ffff55',
  '#ffffff',
  '#ddd605',
  '#e3d4d1',
  '#cecaca',
  '#443a3b',
  '#971607',
  '#b4684d',
  '#deb12d',
  '#47a036',
  '#2cbaa8',
  '#21497b',
  '#9a5cc6',
  '#eb7114',
]

function emptyLayer(id: LayerId, size: number, name: string): Layer {
  return {
    id,
    name,
    visible: true,
    opacity: 1,
    data: createMatrix(size),
  }
}

function deepCopy<T>(value: T): T {
  return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value))
}

function snapshotFromState(state: EditorState): Snapshot {
  const { history: _history, ...rest } = state
  void _history
  return deepCopy(rest)
}

function loadSaved(): EditorState | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Snapshot
    const size = parsed.size ?? 16
    const layers = parsed.layers?.length
      ? parsed.layers.map((layer) => ({ ...layer, data: resizeMatrix(layer.data, size) }))
      : [emptyLayer('background', size, 'Background'), emptyLayer('paint', size, 'Paint')]
    return { ...parsed, size, layers, history: { past: [], future: [] } }
  } catch (error) {
    console.warn('Failed to load saved state', error)
    return null
  }
}

function createInitialState(): EditorState {
  const saved = loadSaved()
  if (saved) return saved
  const size = 16
  const base: Snapshot = {
    size,
    zoom: 18,
    tool: 'brush',
    palette: defaultPalette,
    currentColor: defaultPalette[0],
    grid: true,
    layers: [emptyLayer('background', size, 'Background'), emptyLayer('paint', size, 'Paint')],
    activeLayerId: 'paint',
  }
  return { ...base, history: { past: [], future: [] } }
}

const store = writable<EditorState>(createInitialState())

function persist(snapshot: Snapshot) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  } catch (error) {
    console.warn('Autosave failed', error)
  }
}

// Always autosave
store.subscribe((state) => {
  persist(snapshotFromState(state))
})

function commit(mutator: (draft: EditorState) => void, pushHistory = true) {
  store.update((state) => {
    const next = deepCopy(state) as EditorState
    mutator(next)
    if (pushHistory) {
      const snapshot = snapshotFromState(state)
      next.history.past = [...state.history.past, snapshot]
      next.history.future = []
    } else {
      next.history = state.history
    }
    return next
  })
}

function updateLayer(state: EditorState, layerId: LayerId, updater: (layer: Layer) => void) {
  const layer = state.layers.find((l) => l.id === layerId)
  if (!layer) return
  updater(layer)
}

function withinBounds(size: number, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < size && y < size
}

function applyPixels(updates: Array<{ x: number; y: number; color: Pixel }>) {
  if (!updates.length) return
  commit((draft) => {
    const size = draft.size
    const active = draft.layers.find((l) => l.id === draft.activeLayerId)
    if (!active) return
    updates.forEach(({ x, y, color }) => {
      if (!withinBounds(size, x, y)) return
      active.data[y][x] = color
    })
  })
}

function fillAt(x: number, y: number, color: Pixel) {
  commit((draft) => {
    const layer = draft.layers.find((l) => l.id === draft.activeLayerId)
    if (!layer) return
    const target = layer.data[y]?.[x]
    layer.data = floodFill(layer.data, x, y, target ?? null, color)
  })
}

function drawLine(x0: number, y0: number, x1: number, y1: number, color: Pixel) {
  const points = bresenhamLine(x0, y0, x1, y1)
  applyPixels(points.map(([x, y]) => ({ x, y, color })))
}

function drawRect(x0: number, y0: number, x1: number, y1: number, color: Pixel) {
  const points = rectPoints(x0, y0, x1, y1)
  applyPixels(points.map(([x, y]) => ({ x, y, color })))
}

export const canvasStore = {
  subscribe: store.subscribe,
  setTool(tool: Tool) {
    commit((draft) => {
      draft.tool = tool
    }, false)
  },
  setColor(color: string) {
    const normalized = normalizeHex(color)
    commit((draft) => {
      draft.currentColor = normalized
    }, false)
  },
  addPaletteColor(color: string) {
    const normalized = normalizeHex(color)
    if (!isValidHex(normalized)) return
    commit((draft) => {
      if (!draft.palette.includes(normalized)) {
        draft.palette = [...draft.palette, normalized]
      }
      draft.currentColor = normalized
    }, false)
  },
  setSize(size: number) {
    store.update((state) => {
      const next = deepCopy({ ...state, history: { past: [], future: [] } }) as EditorState
      next.size = size
      next.layers = next.layers.map((layer) => ({
        ...layer,
        data: resizeMatrix(layer.data, size),
      }))
      next.history = { past: [], future: [] }
      return next
    })
  },
  toggleGrid() {
    commit((draft) => {
      draft.grid = !draft.grid
    }, false)
  },
  setActiveLayer(id: LayerId) {
    commit((draft) => {
      draft.activeLayerId = id
    }, false)
  },
  toggleLayerVisibility(id: LayerId) {
    commit((draft) => {
      updateLayer(draft, id, (layer) => {
        layer.visible = !layer.visible
      })
    }, false)
  },
  setLayerOpacity(id: LayerId, value: number) {
    commit((draft) => {
      updateLayer(draft, id, (layer) => {
        layer.opacity = Math.min(1, Math.max(0, value))
      })
    }, false)
  },
  applyBrush(points: Array<{ x: number; y: number }>) {
    const color = get(store).currentColor
    applyPixels(points.map((p) => ({ ...p, color })))
  },
  applyEraser(points: Array<{ x: number; y: number }>) {
    applyPixels(points.map((p) => ({ ...p, color: null })))
  },
  applyFill(x: number, y: number) {
    const color = get(store).currentColor
    fillAt(x, y, color)
  },
  applyLine(x0: number, y0: number, x1: number, y1: number, erase = false) {
    const color = erase ? null : get(store).currentColor
    drawLine(x0, y0, x1, y1, color)
  },
  applyRect(x0: number, y0: number, x1: number, y1: number, erase = false) {
    const color = erase ? null : get(store).currentColor
    drawRect(x0, y0, x1, y1, color)
  },
  clear() {
    commit((draft) => {
      draft.layers = draft.layers.map((layer) => ({ ...layer, data: createMatrix(draft.size) }))
    })
  },
  undo() {
    store.update((state) => {
      if (!state.history.past.length) return state
      const past = [...state.history.past]
      const snapshot = past.pop() as Snapshot
      const future = [snapshotFromState(state), ...state.history.future]
      const next: EditorState = { ...deepCopy(snapshot), history: { past, future } }
      return next
    })
  },
  redo() {
    store.update((state) => {
      if (!state.history.future.length) return state
      const [nextSnapshot, ...rest] = state.history.future
      const past = [...state.history.past, snapshotFromState(state)]
      const next: EditorState = { ...deepCopy(nextSnapshot), history: { past, future: rest } }
      return next
    })
  },
  importMatrix(matrix: PixelMatrix) {
    commit((draft) => {
      const size = matrix.length
      draft.size = size
      draft.layers = draft.layers.map((layer) => ({
        ...layer,
        data: resizeMatrix(layer.id === draft.activeLayerId ? matrix : layer.data, size),
      }))
    })
  },
  newDocument(size = 16) {
    commit((draft) => {
      draft.size = size
      draft.layers = [emptyLayer('background', size, 'Background'), emptyLayer('paint', size, 'Paint')]
      draft.palette = defaultPalette
      draft.currentColor = defaultPalette[0]
      draft.tool = 'brush'
      draft.history = { past: [], future: [] }
    })
  },
  getSnapshot(): Snapshot {
    return snapshotFromState(get(store))
  },
}
