import { runFfmpeg, type RunHooks } from '~/utils/convert'
import { audioCodecArgs, type AudioBitrate, type AudioFormat } from '~/utils/audio'
import { MIME } from '~/utils/media'

const NO_AUDIO = /matches no streams|does not contain any stream/i

interface AudioOptions extends RunHooks {
  format: AudioFormat
  bitrate: AudioBitrate
  /** Optional ffmpeg audio filter chain, e.g. for volume changes. */
  filter?: string
}

export function convertAudio(file: File, { format, bitrate, filter, ...hooks }: AudioOptions): Promise<Blob> {
  return runFfmpeg(file, {
    ...hooks,
    outputName: `output.${format}`,
    mime: MIME[format]!,
    args: ({ input, output }) => [
      '-i', input,
      '-map', '0:a:0', // also skips cover art, and pulls the sound out of a video
      '-map_metadata', '0',
      ...(filter ? ['-af', filter] : []),
      ...audioCodecArgs(format, bitrate),
      '-y', output,
    ],
    failureCode: (logs) => (logs.some((line) => NO_AUDIO.test(line)) ? 'noAudio' : 'failed'),
  })
}
