export type Tool = 'brush' | 'eraser' | 'eyedropper' | 'fill' | 'line' | 'rect'
export type LayerId = 'background' | 'paint'
export type Pixel = string | null
export type PixelMatrix = Pixel[][]

export interface Layer {
  id: LayerId
  name: string
  visible: boolean
  opacity: number
  data: PixelMatrix
}

export interface Snapshot {
  size: number
  zoom: number
  tool: Tool
  palette: string[]
  currentColor: string
  grid: boolean
  checker: boolean
  layers: Layer[]
  activeLayerId: LayerId
  autosave: boolean
}

export interface EditorState extends Snapshot {
  history: {
    past: Snapshot[]
    future: Snapshot[]
  }
}

export interface ExportedJSON {
  size: number
  palette: string[]
  layers: { id: LayerId; data: PixelMatrix }[]
}

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
}
