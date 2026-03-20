import type { Layer, Pixel, PixelMatrix } from '../types'
import { blendPixels } from './color'

export function createMatrix(size: number, fill: Pixel = null): PixelMatrix {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => fill))
}

export function cloneMatrix(matrix: PixelMatrix): PixelMatrix {
  return matrix.map((row) => [...row])
}

export function resizeMatrix(matrix: PixelMatrix, size: number): PixelMatrix {
  const sourceSize = matrix.length
  if (!sourceSize || size === sourceSize) {
    return cloneMatrix(matrix)
  }

  // Upscale: nearest neighbor to keep crisp pixels
  if (size > sourceSize) {
    const next = createMatrix(size)
    for (let y = 0; y < size; y += 1) {
      const srcY = Math.floor((y / size) * sourceSize)
      for (let x = 0; x < size; x += 1) {
        const srcX = Math.floor((x / size) * sourceSize)
        next[y][x] = matrix[srcY]?.[srcX] ?? null
      }
    }
    return next
  }

  // Downscale: area sampling (any pixel in the source region wins; choose most frequent color)
  const scale = sourceSize / size
  const next = createMatrix(size)
  for (let y = 0; y < size; y += 1) {
    const yStart = Math.floor(y * scale)
    const yEnd = Math.min(sourceSize, Math.floor((y + 1) * scale))
    for (let x = 0; x < size; x += 1) {
      const xStart = Math.floor(x * scale)
      const xEnd = Math.min(sourceSize, Math.floor((x + 1) * scale))

      const counts = new Map<Pixel, number>()
      for (let sy = yStart; sy < yEnd; sy += 1) {
        for (let sx = xStart; sx < xEnd; sx += 1) {
          const color = matrix[sy]?.[sx] ?? null
          if (color === null) continue
          counts.set(color, (counts.get(color) ?? 0) + 1)
        }
      }

      if (counts.size === 0) {
        next[y][x] = null
        continue
      }

      // pick the color with the highest hit count (stable-ish by iteration order)
      let bestColor: Pixel = null
      let bestCount = -1
      for (const [color, count] of counts.entries()) {
        if (count > bestCount) {
          bestColor = color
          bestCount = count
        }
      }
      next[y][x] = bestColor
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
