// Copy the ffmpeg.wasm core into public/ffmpeg/<version>/ so it is served from
// our own origin (cacheable by the service worker, works offline, no CDN).
import { cpSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')
const coreDir = join(root, 'node_modules/@ffmpeg/core')
const { version } = JSON.parse(readFileSync(join(coreDir, 'package.json'), 'utf-8'))

const outRoot = join(root, 'public/ffmpeg')
const outDir = join(outRoot, version)
rmSync(outRoot, { recursive: true, force: true })
mkdirSync(outDir, { recursive: true })
for (const file of ['ffmpeg-core.js', 'ffmpeg-core.wasm']) {
  cpSync(join(coreDir, 'dist/esm', file), join(outDir, file))
}
console.log(`[ffmpeg] core ${version} -> public/ffmpeg/${version}`)
