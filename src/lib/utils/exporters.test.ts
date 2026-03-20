import { describe, expect, it } from 'vitest'
import { matrixToPng, snapshotToJsonBlob } from './exporters'
import { createMatrix } from './matrix'
import type { Snapshot } from '../types'

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

  it('exports snapshot to JSON', () => {
    const snapshot: Snapshot = {
      size: 2,
      zoom: 16,
      tool: 'brush',
      palette: ['#000000'],
      currentColor: '#000000',
      grid: true,
      checker: true,
      layers: [
        { id: 'background', name: 'bg', visible: true, opacity: 1, data: createMatrix(2) },
        { id: 'paint', name: 'paint', visible: true, opacity: 1, data: matrix },
      ],
      activeLayerId: 'paint',
      autosave: true,
    }
    const blob = snapshotToJsonBlob(snapshot)
    expect(blob.type).toBe('application/json')
  })
})
