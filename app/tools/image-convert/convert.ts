import { ConvertError, type RunHooks } from '~/utils/convert'
import { encodeImage, throwIfAborted, type ImageFormat, type ImageQuality } from '~/utils/image'

export const MAX_SIDES = [0, 1920, 1280, 800] as const
export type MaxSide = (typeof MAX_SIDES)[number]

interface ImageOptions extends RunHooks {
  format: ImageFormat
  quality: ImageQuality
  maxSide: MaxSide
}

export async function convertImage(file: File, { format, quality, maxSide, signal, onReady }: ImageOptions) {
  onReady?.()
  const bitmap = await createImageBitmap(file).catch((cause) => {
    throw new ConvertError('failed', cause)
  })
  try {
    throwIfAborted(signal)
  } catch (error) {
    bitmap.close()
    throw error
  }
  const blob = await encodeImage(bitmap, { format, quality, maxSide })
  throwIfAborted(signal)
  return blob
}
