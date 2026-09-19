import { EVEN_SCALE, runFfmpeg, type RunHooks } from '~/utils/convert'

export const COMPRESS_QUALITIES = ['high', 'balanced', 'small'] as const
export type CompressQuality = (typeof COMPRESS_QUALITIES)[number]

/** Longest side of the picture is its height; 0 keeps the original size. */
export const COMPRESS_HEIGHTS = [0, 1080, 720, 480] as const
export type CompressHeight = (typeof COMPRESS_HEIGHTS)[number]

// x264 constant rate factor: higher is smaller and blurrier.
const CRF: Record<CompressQuality, number> = { high: 23, balanced: 28, small: 33 }

interface CompressOptions extends RunHooks {
  quality: CompressQuality
  maxHeight: CompressHeight
}

export function compressVideo(file: File, { quality, maxHeight, ...hooks }: CompressOptions): Promise<Blob> {
  // Never upscale; keep both sides even for yuv420p.
  const scale = maxHeight ? `scale=-2:'trunc(min(${maxHeight},ih)/2)*2'` : EVEN_SCALE
  return runFfmpeg(file, {
    ...hooks,
    outputName: 'output.mp4',
    mime: 'video/mp4',
    args: ({ input, output }) => [
      '-i', input,
      '-map', '0:v:0',
      '-map', '0:a:0?', // the trailing ? keeps silent videos working
      '-vf', scale,
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-crf', String(CRF[quality]),
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      '-y', output,
    ],
  })
}
