export const AUDIO_FORMATS = ['mp3', 'm4a', 'wav', 'ogg', 'flac'] as const
export type AudioFormat = (typeof AUDIO_FORMATS)[number]

export const AUDIO_BITRATES = [128, 192, 256, 320] as const
export type AudioBitrate = (typeof AUDIO_BITRATES)[number]

/** Formats where the bitrate matters; WAV and FLAC are lossless. */
export const isLossy = (format: AudioFormat) => format !== 'wav' && format !== 'flac'

// Vorbis is set by quality: a fixed bitrate makes libvorbis fail on low sample rates and mono sources.
const VORBIS_QUALITY: Record<AudioBitrate, number> = { 128: 4, 192: 6, 256: 8, 320: 10 }

export function audioCodecArgs(format: AudioFormat, bitrate: AudioBitrate): string[] {
  const rate = ['-b:a', `${bitrate}k`]
  switch (format) {
    case 'mp3':
      return ['-c:a', 'libmp3lame', ...rate, '-id3v2_version', '3']
    case 'm4a':
      return ['-c:a', 'aac', ...rate]
    case 'ogg':
      return ['-c:a', 'libvorbis', '-q:a', String(VORBIS_QUALITY[bitrate])]
    case 'wav':
      return ['-c:a', 'pcm_s16le']
    case 'flac':
      return ['-c:a', 'flac']
  }
}
