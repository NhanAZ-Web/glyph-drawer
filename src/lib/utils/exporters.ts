import { combineVisibleLayers } from './matrix'
import type { PixelMatrix, Snapshot } from '../types'
import { hexToRgba } from './color'

export function matrixToPng(matrix: PixelMatrix): Blob {
  if (typeof document === 'undefined') return new Blob([], { type: 'image/png' })
  const size = matrix.length
  const ctxCanvas = document.createElement('canvas')
  const ctx = ctxCanvas.getContext?.('2d')
  if (!ctx || typeof ImageData === 'undefined') {
    return new Blob([JSON.stringify(matrix)], { type: 'image/png' })
  }
  const imageData = new ImageData(size, size)
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const idx = (y * size + x) * 4
      const value = matrix[y][x]
      if (!value) {
        imageData.data[idx + 3] = 0
        continue
      }
      const { r, g, b, a } = hexToRgba(value)
      imageData.data[idx] = r
      imageData.data[idx + 1] = g
      imageData.data[idx + 2] = b
      imageData.data[idx + 3] = a
    }
  }
  ctxCanvas.width = size
  ctxCanvas.height = size
  ctx.putImageData(imageData, 0, 0)
  const dataUrl = ctxCanvas.toDataURL('image/png')
  const byteString = atob(dataUrl.split(',')[1])
  const buffer = new Uint8Array(byteString.length)
  for (let i = 0; i < byteString.length; i += 1) {
    buffer[i] = byteString.charCodeAt(i)
  }
  return new Blob([buffer], { type: 'image/png' })
}

export function matrixToSvg(matrix: PixelMatrix): Blob {
  const size = matrix.length
  const rects: string[] = []
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const color = matrix[y][x]
      if (!color) continue
      rects.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${color}"/>`)
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" viewBox="0 0 ${size} ${size}">${rects.join('')}</svg>`
  return new Blob([svg], { type: 'image/svg+xml' })
}

export function snapshotToJsonBlob(snapshot: Snapshot): Blob {
  const payload = JSON.stringify(
    {
      size: snapshot.size,
      palette: snapshot.palette,
      layers: snapshot.layers.map((layer) => ({ id: layer.id, data: layer.data })),
    },
    null,
    2,
  )
  return new Blob([payload], { type: 'application/json' })
}

export function visibleMatrixFromSnapshot(snapshot: Snapshot): PixelMatrix {
  return combineVisibleLayers(snapshot.layers)
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
