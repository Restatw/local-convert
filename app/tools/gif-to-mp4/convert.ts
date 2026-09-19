import { EVEN_SCALE, runFfmpeg, type RunHooks } from '~/utils/convert'

export function convertGifToMp4(file: File, hooks: RunHooks): Promise<Blob> {
  return runFfmpeg(file, {
    ...hooks,
    outputName: 'output.mp4',
    mime: 'video/mp4',
    args: ({ input, output }) => [
      '-i', input,
      '-vf', EVEN_SCALE,
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-crf', '23',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      '-an',
      '-y', output,
    ],
  })
}
