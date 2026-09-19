import { runFfmpeg, type RunHooks } from '~/utils/convert'

export const GIF_FPS = [8, 12, 15, 20] as const
export const GIF_WIDTHS = [320, 480, 640] as const
/** Longest clip to convert, in seconds. GIFs grow fast, so the whole video is never the default. */
export const GIF_DURATIONS = [5, 10, 30] as const

export type GifFps = (typeof GIF_FPS)[number]
export type GifWidth = (typeof GIF_WIDTHS)[number]
export type GifDuration = (typeof GIF_DURATIONS)[number]

interface GifOptions extends RunHooks {
  fps: GifFps
  width: GifWidth
  duration: GifDuration
}

export function convertToGif(file: File, { fps, width, duration, ...hooks }: GifOptions): Promise<Blob> {
  // One palette for the whole clip keeps colors stable; never upscale small videos.
  const filter =
    `fps=${fps},scale='min(${width},iw)':-2:flags=lanczos,` +
    'split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle'
  return runFfmpeg(file, {
    ...hooks,
    outputName: 'output.gif',
    mime: 'image/gif',
    args: ({ input, output }) => ['-t', String(duration), '-i', input, '-an', '-vf', filter, '-loop', '0', '-y', output],
  })
}
