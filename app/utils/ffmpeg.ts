import type { FFmpeg } from '@ffmpeg/ffmpeg'

// One shared ffmpeg.wasm instance per page. It is heavy (~32 MB), so it is only
// imported and loaded when a tool actually needs it.
let instance: FFmpeg | null = null
let loading: Promise<FFmpeg> | null = null

async function load(): Promise<FFmpeg> {
  const [{ FFmpeg }, { toBlobURL }] = await Promise.all([
    import('@ffmpeg/ffmpeg'),
    import('@ffmpeg/util'),
  ])
  const base = `/ffmpeg/${useRuntimeConfig().public.ffmpegCoreVersion}`
  const ffmpeg = new FFmpeg()
  await ffmpeg.load({
    coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm'),
  })
  instance = ffmpeg
  return ffmpeg
}

export function getFfmpeg(): Promise<FFmpeg> {
  if (instance) return Promise.resolve(instance)
  loading ??= load().finally(() => {
    loading = null
  })
  return loading
}

/** Kill the running instance (used to cancel a conversion). The next call reloads it. */
export function resetFfmpeg() {
  instance?.terminate()
  instance = null
}
