import { runFfmpeg, type RunHooks } from '~/utils/convert'

export const MP3_BITRATES = [128, 192, 256, 320] as const
export type Mp3Bitrate = (typeof MP3_BITRATES)[number]

const NO_AUDIO = /matches no streams|does not contain any stream/i

export function convertToMp3(file: File, { bitrate, ...hooks }: RunHooks & { bitrate: Mp3Bitrate }): Promise<Blob> {
  return runFfmpeg(file, {
    ...hooks,
    outputName: 'output.mp3',
    mime: 'audio/mpeg',
    args: ({ input, output }) => [
      '-i', input,
      '-map', '0:a:0',
      '-map_metadata', '0',
      '-c:a', 'libmp3lame',
      '-b:a', `${bitrate}k`,
      '-id3v2_version', '3',
      '-y', output,
    ],
    failureCode: (logs) => (logs.some((line) => NO_AUDIO.test(line)) ? 'noAudio' : 'failed'),
  })
}
