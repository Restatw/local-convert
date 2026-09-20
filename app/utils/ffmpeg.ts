import type { FFmpeg } from '@ffmpeg/ffmpeg'

// One shared ffmpeg.wasm instance per page. It is heavy (~32 MB), so it is only
// imported and loaded when a tool actually needs it.
let instance: FFmpeg | null = null
let loading: Promise<FFmpeg> | null = null

// The wasm is stored as several parts (see scripts/copy-ffmpeg-core.mjs); fetch and join them.
async function fetchWasmBlobURL(base: string): Promise<string> {
  const get = async (name: string) => {
    const res = await fetch(`${base}/${name}`)
    if (!res.ok) throw new Error(`Failed to load ${name}: ${res.status}`)
    return res
  }
  const { parts } = (await (await get('ffmpeg-core.wasm.json')).json()) as { parts: string[] }
  const buffers = await Promise.all(parts.map(async (name) => (await get(name)).arrayBuffer()))
  return URL.createObjectURL(new Blob(buffers, { type: 'application/wasm' }))
}

async function load(): Promise<FFmpeg> {
  const [{ FFmpeg }, { toBlobURL }] = await Promise.all([
    import('@ffmpeg/ffmpeg'),
    import('@ffmpeg/util'),
  ])
  const base = `/ffmpeg/${useRuntimeConfig().public.ffmpegCoreVersion}`
  const ffmpeg = new FFmpeg()
  await ffmpeg.load({
    coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await fetchWasmBlobURL(base),
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
