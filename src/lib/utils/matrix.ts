import type { Layer, Pixel, PixelMatrix } from '../types'
import { blendPixels } from './color'

export function createMatrix(size: number, fill: Pixel = null): PixelMatrix {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => fill))
}

export function cloneMatrix(matrix: PixelMatrix): PixelMatrix {
  return matrix.map((row) => [...row])
}

export function resizeMatrix(matrix: PixelMatrix, size: number): PixelMatrix {
  const next = createMatrix(size)
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (y < matrix.length && x < matrix[0]?.length) {
        next[y][x] = matrix[y][x]
      }
    }
  }
  return next
}

export function isMatrixEmpty(matrix: PixelMatrix): boolean {
  return matrix.every((row) => row.every((cell) => cell === null))
}

export function compositeLayers(layers: Layer[], x: number, y: number): Pixel {
  let pixel: Pixel = null
  layers.forEach((layer) => {
    if (!layer.visible) return
    const color = layer.data[y]?.[x] ?? null
    if (!color) return
    pixel = blendPixels(pixel, color, layer.opacity)
  })
  return pixel
}

export function combineVisibleLayers(layers: Layer[]): PixelMatrix {
  if (!layers.length) return []
  const size = layers[0].data.length
  const matrix = createMatrix(size)
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      matrix[y][x] = compositeLayers(layers, x, y)
    }
  }
  return matrix
}
