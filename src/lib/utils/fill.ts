import type { PixelMatrix, Pixel } from '../types'

export function floodFill(matrix: PixelMatrix, x: number, y: number, target: Pixel, replacement: Pixel): PixelMatrix {
  const height = matrix.length
  const width = matrix[0]?.length ?? 0
  if (target === replacement) return matrix
  const within = (cx: number, cy: number) => cx >= 0 && cy >= 0 && cx < width && cy < height
  const draft = matrix.map((row) => [...row])
  const start = matrix[y]?.[x]
  if (start !== target) return draft
  const stack: Array<[number, number]> = [[x, y]]

  while (stack.length) {
    const [cx, cy] = stack.pop() as [number, number]
    if (!within(cx, cy)) continue
    if (draft[cy][cx] !== target) continue
    draft[cy][cx] = replacement
    stack.push([cx + 1, cy])
    stack.push([cx - 1, cy])
    stack.push([cx, cy + 1])
    stack.push([cx, cy - 1])
  }
  return draft
}
