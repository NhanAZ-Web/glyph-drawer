import { combineVisibleLayers } from './matrix'
import type { PixelMatrix, Snapshot } from '../types'
import { hexToRgba } from './color'

export function matrixToPng(matrix: PixelMatrix, scale = 1): Blob {
  if (typeof document === 'undefined') return new Blob([], { type: 'image/png' })
  const size = matrix.length
  const outSize = size * scale
  const ctxCanvas = document.createElement('canvas')
  ctxCanvas.width = outSize
  ctxCanvas.height = outSize
  const ctx = ctxCanvas.getContext?.('2d')
  if (!ctx) {
    return new Blob([], { type: 'image/png' })
  }
  ctx.imageSmoothingEnabled = false
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const value = matrix[y][x]
      if (!value) continue
      const { r, g, b, a } = hexToRgba(value)
      ctx.fillStyle = `rgba(${r},${g},${b},${a / 255})`
      ctx.fillRect(x * scale, y * scale, scale, scale)
    }
  }
  const dataUrl = ctxCanvas.toDataURL('image/png')
  const byteString = atob(dataUrl.split(',')[1])
  const buffer = new Uint8Array(byteString.length)
  for (let i = 0; i < byteString.length; i += 1) {
    buffer[i] = byteString.charCodeAt(i)
  }
  return new Blob([buffer], { type: 'image/png' })
}

export function visibleMatrixFromSnapshot(snapshot: Pick<Snapshot, 'layers'>): PixelMatrix {
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
