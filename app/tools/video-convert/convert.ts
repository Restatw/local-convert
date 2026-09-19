import { EVEN_SCALE, runFfmpeg, type RunHooks } from '~/utils/convert'

export const VIDEO_FORMATS = ['mp4', 'webm', 'mov', 'mkv'] as const
export type VideoFormat = (typeof VIDEO_FORMATS)[number]

const MIME: Record<VideoFormat, string> = {
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  mkv: 'video/x-matroska',
}

const H264_AAC = [
  '-vf', EVEN_SCALE,
  '-c:v', 'libx264',
  '-preset', 'veryfast',
  '-crf', '23',
  '-pix_fmt', 'yuv420p',
  '-c:a', 'aac',
  '-b:a', '192k',
]

// VP8 rather than VP9: the VP9 encoder in @ffmpeg/core 0.12 crashes ("memory access out of bounds").
// CRF mode needs -b:v as a bitrate ceiling.
const VP8_OPUS = [
  '-vf', EVEN_SCALE,
  '-c:v', 'libvpx',
  '-crf', '10',
  '-b:v', '5M',
  '-deadline', 'realtime',
  '-cpu-used', '5',
  '-pix_fmt', 'yuv420p',
  '-c:a', 'libopus',
  '-b:a', '128k',
]

const codecArgs = (format: VideoFormat) =>
  format === 'webm' ? VP8_OPUS : format === 'mkv' ? H264_AAC : [...H264_AAC, '-movflags', '+faststart']

export function convertVideo(file: File, { format, ...hooks }: RunHooks & { format: VideoFormat }): Promise<Blob> {
  return runFfmpeg(file, {
    ...hooks,
    outputName: `output.${format}`,
    mime: MIME[format],
    args: ({ input, output }) => [
      '-i', input,
      '-map', '0:v:0',
      '-map', '0:a:0?', // the trailing ? keeps silent videos working
      ...codecArgs(format),
      '-y', output,
    ],
  })
}
