import { EVEN_SCALE, runFfmpeg, type RunHooks } from '~/utils/convert'
import { MIME, copyVideoExt } from '~/utils/media'

export const TRIM_MODES = ['fast', 'precise'] as const
export type TrimMode = (typeof TRIM_MODES)[number]

interface TrimOptions extends RunHooks {
  /** Seconds. */
  start: number
  /** Seconds; 0 keeps everything after `start`. */
  end: number
  mode: TrimMode
}

/** Fast mode keeps the source container; precise mode re-encodes to MP4. */
export const trimVideoExt = (file: File, mode: TrimMode) => (mode === 'fast' ? copyVideoExt(file) : 'mp4')

export function trimVideo(file: File, { start, end, mode, ...hooks }: TrimOptions): Promise<Blob> {
  const ext = trimVideoExt(file, mode)
  return runFfmpeg(file, {
    ...hooks,
    outputName: `output.${ext}`,
    mime: MIME[ext]!,
    args: ({ input, output }) => [
      '-ss', String(start),
      '-i', input,
      // -t (a length) rather than -to: after an input seek, -to would count from the wrong origin.
      ...(end > start ? ['-t', String(Math.round((end - start) * 1000) / 1000)] : []),
      '-map', '0:v:0',
      '-map', '0:a:0?',
      ...(mode === 'fast'
        ? ['-c', 'copy', '-avoid_negative_ts', 'make_zero']
        : [
            '-vf', EVEN_SCALE,
            '-c:v', 'libx264',
            '-preset', 'veryfast',
            '-crf', '23',
            '-pix_fmt', 'yuv420p',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-movflags', '+faststart',
          ]),
      '-y', output,
    ],
  })
}
