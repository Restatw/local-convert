// Copy the ffmpeg.wasm core into public/ffmpeg/<version>/ so it is served from
// our own origin (cacheable by the service worker, works offline, no CDN).
//
// The wasm (~32 MB) is split into parts below Cloudflare Pages' 25 MiB per-file limit.
// ffmpeg-core.wasm.json lists the parts in order; app/utils/ffmpeg.ts stitches them back together.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const PART_SIZE = 20 * 1024 * 1024

const root = join(import.meta.dirname, '..')
const coreDir = join(root, 'node_modules/@ffmpeg/core')
const { version } = JSON.parse(readFileSync(join(coreDir, 'package.json'), 'utf-8'))

const outRoot = join(root, 'public/ffmpeg')
const outDir = join(outRoot, version)
rmSync(outRoot, { recursive: true, force: true })
mkdirSync(outDir, { recursive: true })

cpSync(join(coreDir, 'dist/esm/ffmpeg-core.js'), join(outDir, 'ffmpeg-core.js'))

const wasm = readFileSync(join(coreDir, 'dist/esm/ffmpeg-core.wasm'))
const parts = []
for (let offset = 0; offset < wasm.length; offset += PART_SIZE) {
  const name = `ffmpeg-core.wasm.part${parts.length}`
  writeFileSync(join(outDir, name), wasm.subarray(offset, offset + PART_SIZE))
  parts.push(name)
}
writeFileSync(join(outDir, 'ffmpeg-core.wasm.json'), JSON.stringify({ parts }))

console.log(`[ffmpeg] core ${version} -> public/ffmpeg/${version} (wasm in ${parts.length} parts)`)
