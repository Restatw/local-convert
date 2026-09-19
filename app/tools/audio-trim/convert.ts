import { runFfmpeg, type RunHooks } from '~/utils/convert'
import { audioCodecArgs } from '~/utils/audio'
import { MIME, copyAudioExt } from '~/utils/media'

interface TrimOptions extends RunHooks {
  /** Seconds. */
  start: number
  /** Seconds; 0 keeps everything after `start`. */
  end: number
}

/** Audio files keep their format (streams are copied); anything else, such as a video, becomes MP3. */
export const trimAudioExt = (file: File) => copyAudioExt(file) ?? 'mp3'

export function trimAudio(file: File, { start, end, ...hooks }: TrimOptions): Promise<Blob> {
  const copy = copyAudioExt(file) !== null
  const ext = trimAudioExt(file)
  return runFfmpeg(file, {
    ...hooks,
    outputName: `output.${ext}`,
    mime: MIME[ext]!,
    args: ({ input, output }) => [
      '-ss', String(start),
      '-i', input,
      ...(end > start ? ['-t', String(Math.round((end - start) * 1000) / 1000)] : []),
      '-map', '0:a:0',
      '-map_metadata', '0',
      ...(copy ? ['-c:a', 'copy'] : audioCodecArgs('mp3', 192)),
      '-y', output,
    ],
  })
}
