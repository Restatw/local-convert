import { ConvertError, runFfmpeg, type RunHooks } from '~/utils/convert'
import { encodeImage, throwIfAborted } from '~/utils/image'

export const FRAME_FORMATS = ['png', 'jpg'] as const
export type FrameFormat = (typeof FRAME_FORMATS)[number]

export async function extractFrame(
  file: File,
  { time, format, ...hooks }: RunHooks & { time: number; format: FrameFormat },
): Promise<Blob> {
  const png = await runFfmpeg(file, {
    ...hooks,
    outputName: 'output.png',
    mime: 'image/png',
    args: ({ input, output }) => ['-ss', String(time), '-i', input, '-frames:v', '1', '-update', '1', '-y', output],
  })
  if (format === 'png') return png

  // ffmpeg.wasm's MJPEG encoder crashes at high quality ("memory access out of bounds"),
  // so JPEGs are encoded by the browser instead.
  throwIfAborted(hooks.signal)
  const bitmap = await createImageBitmap(png).catch((cause) => {
    throw new ConvertError('failed', cause)
  })
  return encodeImage(bitmap, { format: 'jpg', quality: 'high', maxSide: 0 })
}
