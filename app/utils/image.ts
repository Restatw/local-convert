import { ConvertAbortError, ConvertError } from '~/utils/convert'

export const IMAGE_ACCEPT = 'image/*,.png,.jpg,.jpeg,.webp,.gif,.bmp,.avif'
export const HEIC_ACCEPT = '.heic,.heif,image/heic,image/heif'

export const IMAGE_FORMATS = ['jpg', 'png', 'webp'] as const
export type ImageFormat = (typeof IMAGE_FORMATS)[number]

export const IMAGE_MIME: Record<ImageFormat, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

export const IMAGE_QUALITIES = ['high', 'balanced', 'small'] as const
export type ImageQuality = (typeof IMAGE_QUALITIES)[number]

/** Encoder quality 0..1 (ignored for PNG, which is lossless). */
export const IMAGE_QUALITY_VALUE: Record<ImageQuality, number> = { high: 0.92, balanced: 0.8, small: 0.6 }

export function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted) throw new ConvertAbortError()
}

interface EncodeOptions {
  format: ImageFormat
  quality: ImageQuality
  /** Longest side in pixels; 0 keeps the original size. Images are never enlarged. */
  maxSide: number
}

/** Draw a decoded image onto a canvas and encode it. Closes the bitmap. */
export async function encodeImage(bitmap: ImageBitmap, { format, quality, maxSide }: EncodeOptions): Promise<Blob> {
  try {
    const longest = Math.max(bitmap.width, bitmap.height)
    const scale = maxSide && longest > maxSide ? maxSide / longest : 1
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new ConvertError('failed')
    if (format === 'jpg') {
      // JPEG has no transparency; without this, transparent areas turn black.
      context.fillStyle = '#fff'
      context.fillRect(0, 0, canvas.width, canvas.height)
    }
    context.imageSmoothingQuality = 'high'
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

    const mime = IMAGE_MIME[format]
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, mime, IMAGE_QUALITY_VALUE[quality]),
    )
    if (!blob) throw new ConvertError('failed')
    // Browsers silently fall back to PNG for formats they cannot encode (e.g. WebP on older Safari).
    if (blob.type !== mime) throw new ConvertError('unsupported')
    return blob
  } finally {
    bitmap.close()
  }
}
