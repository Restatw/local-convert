export const VOLUME_MODES = ['normalize', 'louder', 'quieter'] as const
export type VolumeMode = (typeof VOLUME_MODES)[number]

// loudnorm resamples to 192 kHz internally, so bring it back to a normal rate afterwards.
export const VOLUME_FILTER: Record<VolumeMode, string> = {
  normalize: 'loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100',
  louder: 'volume=2,alimiter=limit=0.95', // +6 dB, limited so it does not clip
  quieter: 'volume=0.5', // -6 dB
}
