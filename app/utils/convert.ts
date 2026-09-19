import type { FFmpeg } from '@ffmpeg/ffmpeg'
import { getFfmpeg, resetFfmpeg } from '~/utils/ffmpeg'

export type ConvertErrorCode = 'noAudio' | 'engine' | 'failed' | 'unsupported'

export class ConvertError extends Error {
  constructor(readonly code: ConvertErrorCode, cause?: unknown) {
    super(code, { cause })
  }
}

export class ConvertAbortError extends Error {}

/** What a tool's UI hands to its converter: cancellation and progress reporting. */
export interface RunHooks {
  signal: AbortSignal
  /** Called once the engine is loaded and conversion is about to start. */
  onReady?: () => void
  /** 0..1 */
  onProgress?: (ratio: number) => void
}

export interface RunOptions extends RunHooks {
  /** ffmpeg arguments. `input` is the first mounted source, `inputs` all of them, `output` the file to produce. */
  args: (paths: { input: string; inputs: string[]; output: string }) => string[]
  outputName: string
  mime: string
  /** Maps ffmpeg's last log lines to a more specific error code for a failed run. */
  failureCode?: (logs: string[]) => ConvertErrorCode
}

export const VIDEO_ACCEPT = 'video/*,.mp4,.mov,.mkv,.webm,.avi,.m4v,.flv,.wmv,.3gp,.mpg,.mpeg'
export const AUDIO_ACCEPT = 'audio/*,.mp3,.m4a,.aac,.wav,.ogg,.oga,.opus,.flac,.wma,.aiff'

/** libx264 + yuv420p need even dimensions; this rounds odd ones down. */
export const EVEN_SCALE = 'scale=trunc(iw/2)*2:trunc(ih/2)*2'

const MOUNT = '/input'

/** Run one ffmpeg job on `files` and return the produced file. Aborting kills the engine. */
export async function runFfmpeg(files: File | File[], options: RunOptions): Promise<Blob> {
  const { signal } = options
  const onAbort = () => resetFfmpeg()
  signal.addEventListener('abort', onAbort, { once: true })
  try {
    let ffmpeg: FFmpeg
    try {
      ffmpeg = await getFfmpeg()
    } catch (cause) {
      throw new ConvertError('engine', cause)
    }
    if (signal.aborted) throw new ConvertAbortError()
    options.onReady?.()
    return await run(ffmpeg, Array.isArray(files) ? files : [files], options)
  } catch (error) {
    if (signal.aborted) throw new ConvertAbortError()
    throw error
  } finally {
    signal.removeEventListener('abort', onAbort)
  }
}

async function run(
  ffmpeg: FFmpeg,
  files: File[],
  { args, outputName, mime, failureCode, onProgress }: RunOptions,
) {
  const { FFFSType } = await import('@ffmpeg/ffmpeg')
  const logs: string[] = []
  const onLog = ({ message }: { message: string }) => {
    logs.push(message)
    if (logs.length > 50) logs.shift()
  }
  const onProg = ({ progress }: { progress: number }) => {
    onProgress?.(Math.min(1, Math.max(0, progress)))
  }
  ffmpeg.on('log', onLog)
  ffmpeg.on('progress', onProg)

  let mounted = false
  try {
    // WORKERFS reads the File lazily, so large videos are never copied into wasm memory.
    await ffmpeg.createDir(MOUNT).catch(() => {})
    await ffmpeg.mount(FFFSType.WORKERFS, { blobs: files.map((data, i) => ({ name: `in${i}`, data })) }, MOUNT)
    mounted = true

    const inputs = files.map((_, i) => `${MOUNT}/in${i}`)
    const code = await ffmpeg.exec(args({ input: inputs[0]!, inputs, output: outputName }))
    if (code !== 0) throw new ConvertError(failureCode?.(logs) ?? 'failed')

    const data = await ffmpeg.readFile(outputName)
    if (typeof data === 'string' || data.byteLength === 0) throw new ConvertError('failed')
    return new Blob([data as Uint8Array<ArrayBuffer>], { type: mime })
  } catch (error) {
    throw error instanceof ConvertError ? error : new ConvertError('failed', error)
  } finally {
    ffmpeg.off('log', onLog)
    ffmpeg.off('progress', onProg)
    // Best effort: these reject if the instance was terminated by a cancel.
    if (mounted) await ffmpeg.unmount(MOUNT).catch(() => {})
    await ffmpeg.deleteFile(outputName).catch(() => {})
    await ffmpeg.deleteDir(MOUNT).catch(() => {})
  }
}
