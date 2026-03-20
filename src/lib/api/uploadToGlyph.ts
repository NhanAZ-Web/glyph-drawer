export type UploadResult = { ok: boolean; message: string }

export async function uploadToGlyph(payload: Blob | object): Promise<UploadResult> {
  console.info('Stub uploadToGlyph called', payload)
  await new Promise((resolve) => setTimeout(resolve, 600))
  return { ok: true, message: 'Sent payload to glyph (stub).' }
}
