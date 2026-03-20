import type { PixelMatrix } from '../types'

export async function pngFileToMatrix(file: File): Promise<PixelMatrix> {
  const url = URL.createObjectURL(file)
  const image = new Image()
  image.src = url
  image.decoding = 'async'
  try {
    await image.decode()
  } catch {
    await new Promise((resolve, reject) => {
      image.onload = () => resolve(null)
      image.onerror = reject
    })
  }
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')
  ctx.drawImage(image, 0, 0)
  const data = ctx.getImageData(0, 0, image.width, image.height)
  const matrix: PixelMatrix = []
  for (let y = 0; y < image.height; y += 1) {
    const row: Array<string | null> = []
    for (let x = 0; x < image.width; x += 1) {
      const idx = (y * image.width + x) * 4
      const r = data.data[idx]
      const g = data.data[idx + 1]
      const b = data.data[idx + 2]
      const a = data.data[idx + 3]
      if (a === 0) {
        row.push(null)
      } else {
        row.push(`#${r.toString(16).padStart(2, '0')}${g
          .toString(16)
          .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`)
      }
    }
    matrix.push(row)
  }
  URL.revokeObjectURL(url)
  return matrix
}
