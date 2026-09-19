import { runFfmpeg, type RunHooks } from '~/utils/convert'
import type { GifDuration, GifFps, GifWidth } from '../mp4-to-gif/convert'

export const ANIMATED_FORMATS = ['webp', 'apng'] as const
export type AnimatedFormat = (typeof ANIMATED_FORMATS)[number]

/** APNG files are named .png; browsers tell them apart from the content. */
export const animatedExt = (format: AnimatedFormat) => (format === 'apng' ? 'png' : 'webp')

interface AnimatedOptions extends RunHooks {
  format: AnimatedFormat
  fps: GifFps
  width: GifWidth
  duration: GifDuration
}

export function convertToAnimated(file: File, { format, fps, width, duration, ...hooks }: AnimatedOptions) {
  const filter = `fps=${fps},scale='min(${width},iw)':-2:flags=lanczos`
  return runFfmpeg(file, {
    ...hooks,
    outputName: `output.${format}`,
    mime: format === 'apng' ? 'image/png' : 'image/webp',
    args: ({ input, output }) => [
      '-t', String(duration),
      '-i', input,
      '-an',
      '-vf', filter,
      ...(format === 'webp'
        ? ['-c:v', 'libwebp', '-lossless', '0', '-q:v', '70', '-loop', '0']
        : ['-f', 'apng', '-plays', '0']),
      '-y', output,
    ],
  })
}
