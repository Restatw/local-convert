import { runFfmpeg, type RunHooks } from '~/utils/convert'
import { audioCodecArgs, type AudioBitrate, type AudioFormat } from '~/utils/audio'
import { MIME } from '~/utils/media'

const NO_AUDIO = /matches no streams|does not contain any stream/i

export function mergeAudio(
  files: File[],
  { format, bitrate, ...hooks }: RunHooks & { format: AudioFormat; bitrate: AudioBitrate },
): Promise<Blob> {
  return runFfmpeg(files, {
    ...hooks,
    outputName: `output.${format}`,
    mime: MIME[format]!,
    args: ({ inputs, output }) => {
      // The concat filter needs every input in the same sample rate and layout, so normalise first.
      const prepare = inputs.map((_, i) => `[${i}:a:0]aresample=44100,aformat=channel_layouts=stereo[a${i}]`)
      const join = `${inputs.map((_, i) => `[a${i}]`).join('')}concat=n=${inputs.length}:v=0:a=1[out]`
      return [
        ...inputs.flatMap((input) => ['-i', input]),
        '-filter_complex', [...prepare, join].join(';'),
        '-map', '[out]',
        ...audioCodecArgs(format, bitrate),
        '-y', output,
      ]
    },
    failureCode: (logs) => (logs.some((line) => NO_AUDIO.test(line)) ? 'noAudio' : 'failed'),
  })
}
