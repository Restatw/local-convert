import { ConvertError, type RunHooks } from '~/utils/convert'
import { IMAGE_MIME, IMAGE_QUALITY_VALUE, throwIfAborted, type ImageQuality } from '~/utils/image'

export const HEIC_FORMATS = ['jpg', 'png'] as const
export type HeicFormat = (typeof HEIC_FORMATS)[number]

interface HeicOptions extends RunHooks {
  format: HeicFormat
  quality: ImageQuality
}

export async function convertHeic(file: File, { format, quality, signal, onReady }: HeicOptions): Promise<Blob> {
  onReady?.()
  try {
    // The decoder is ~3 MB, so it is only downloaded when this tool is used.
    const { heicTo } = await import('heic-to')
    throwIfAborted(signal)
    const blob = await heicTo({
      blob: file,
      type: IMAGE_MIME[format] as 'image/jpeg' | 'image/png',
      quality: IMAGE_QUALITY_VALUE[quality],
    })
    throwIfAborted(signal)
    return blob
  } catch (error) {
    if (signal.aborted) throw error
    throw error instanceof ConvertError ? error : new ConvertError('failed', error)
  }
}
