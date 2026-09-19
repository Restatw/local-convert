import { runFfmpeg, type RunHooks } from '~/utils/convert'
import { MIME, copyVideoExt } from '~/utils/media'

export { copyVideoExt as muteExt }

/** Drops the audio and copies the picture as is, so it takes seconds and loses no quality. */
export function muteVideo(file: File, hooks: RunHooks): Promise<Blob> {
  const ext = copyVideoExt(file)
  return runFfmpeg(file, {
    ...hooks,
    outputName: `output.${ext}`,
    mime: MIME[ext]!,
    args: ({ input, output }) => ['-i', input, '-map', '0:v:0', '-c:v', 'copy', '-an', '-y', output],
  })
}
