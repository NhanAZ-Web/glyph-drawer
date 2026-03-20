import { describe, expect, it } from 'vitest'
import { matrixToPng } from './exporters'

const matrix = [
  ['#000000', null],
  [null, '#ffffff'],
]

describe('exporters', () => {
  it('creates PNG blob', () => {
    const blob = matrixToPng(matrix)
    expect(blob.type).toBe('image/png')
    expect(blob.size).toBeGreaterThan(0)
  })

  it('creates scaled PNG blob', () => {
    const blob = matrixToPng(matrix, 4)
    expect(blob.type).toBe('image/png')
    expect(blob.size).toBeGreaterThan(0)
  })
})
