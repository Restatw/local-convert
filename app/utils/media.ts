import { extensionOf } from '~/utils/format'

export const MIME: Record<string, string> = {
  mp4: 'video/mp4',
  m4v: 'video/mp4',
  mov: 'video/quicktime',
  mkv: 'video/x-matroska',
  webm: 'video/webm',
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  opus: 'audio/ogg',
  flac: 'audio/flac',
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
}

/** Containers that stream copy (`-c copy`) can keep as they are. */
const COPY_VIDEO = new Set(['mp4', 'm4v', 'mov', 'mkv', 'webm'])
const COPY_AUDIO = new Set(['mp3', 'm4a', 'aac', 'wav', 'ogg', 'opus', 'flac'])

/** Extension to use when copying a video's streams: its own, or MP4 for containers we cannot be sure of. */
export const copyVideoExt = (file: File) => (COPY_VIDEO.has(extensionOf(file.name)) ? extensionOf(file.name) : 'mp4')

/** Audio counterpart: its own extension, or null when it has to be re-encoded (e.g. a video file). */
export const copyAudioExt = (file: File) => (COPY_AUDIO.has(extensionOf(file.name)) ? extensionOf(file.name) : null)
