import type { Pixel } from '../types'

export function normalizeHex(input: string): string {
  const value = input.trim().toLowerCase()
  return value.startsWith('#') ? value : `#${value}`
}

export function isValidHex(value: string): boolean {
  return /^#([0-9a-f]{6}|[0-9a-f]{3})$/i.test(value.trim())
}

export function hexToRgba(hex: string): { r: number; g: number; b: number; a: number } {
  const value = normalizeHex(hex).replace('#', '')
  const normalized = value.length === 3 ? value.split('').map((c) => c + c).join('') : value
  const r = parseInt(normalized.substring(0, 2), 16)
  const g = parseInt(normalized.substring(2, 4), 16)
  const b = parseInt(normalized.substring(4, 6), 16)
  return { r, g, b, a: 255 }
}

export function rgbaToHex(r: number, g: number, b: number, a = 255): string {
  const toHex = (v: number) => v.toString(16).padStart(2, '0')
  if (a !== 255) {
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function blendPixels(bottom: Pixel, top: Pixel, topOpacity: number): Pixel {
  if (!top) return bottom
  if (topOpacity >= 1 || !bottom) return top
  const base = hexToRgba(bottom)
  const overlay = hexToRgba(top)
  const alphaTop = topOpacity
  const alphaBottom = 1
  const outA = alphaTop + alphaBottom * (1 - alphaTop)
  const r = Math.round((overlay.r * alphaTop + base.r * alphaBottom * (1 - alphaTop)) / outA)
  const g = Math.round((overlay.g * alphaTop + base.g * alphaBottom * (1 - alphaTop)) / outA)
  const b = Math.round((overlay.b * alphaTop + base.b * alphaBottom * (1 - alphaTop)) / outA)
  return rgbaToHex(r, g, b)
}
