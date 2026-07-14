import '@testing-library/jest-dom/vitest'

const mock2dContext = {
  canvas: document.createElement('canvas'),
  setTransform: () => {},
  clearRect: () => {},
  fillRect: () => {},
  beginPath: () => {},
  moveTo: () => {},
  lineTo: () => {},
  stroke: () => {},
  strokeRect: () => {},
  putImageData: () => {},
  getImageData: () => ({ data: new Uint8ClampedArray() }),
  imageSmoothingEnabled: false,
  globalAlpha: 1,
  lineWidth: 1,
  strokeStyle: '',
  fillStyle: '',
} as unknown as CanvasRenderingContext2D

HTMLCanvasElement.prototype.getContext = ((contextId: string) => {
  if (contextId === '2d') {
    return mock2dContext
  }
  return null
}) as unknown as typeof HTMLCanvasElement.prototype.getContext

HTMLCanvasElement.prototype.toDataURL = () =>
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII='

if (!window.matchMedia) {
  window.matchMedia = () =>
    ({
      matches: false,
      media: '',
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as MediaQueryList)
}
