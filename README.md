# LocalConvert

On-device file converter as an installable PWA. Files are processed in the browser and never uploaded.
Bilingual (繁體中文 / English) with no language switch: Chinese systems get Traditional Chinese, everything else English.
Dark UI, works offline after first use.

Tools (ffmpeg.wasm, except the image ones), grouped on the home page by category with search:

- **Video:** MP4 → GIF, GIF → MP4, video → animated WebP/APNG, compressor, format converter (MP4 / WebM / MOV / MKV),
  trimmer, remove audio, extract a frame (PNG/JPG)
- **Audio:** audio converter (MP3 / M4A / WAV / OGG / FLAC, also from video), MP4 → MP3, trimmer, merger, volume / normalize
- **Image:** HEIC → JPG/PNG (heic-to), image converter and compressor (PNG / JPG / WebP, via the browser canvas)

## Run (Docker only, no local Node needed)

```bash
docker compose up -d --build web        # production build behind nginx -> http://localhost:8090
docker compose --profile dev up dev     # hot-reload dev server         -> http://localhost:3000
docker compose down
```

## Layout

```
app/tools/registry.ts        list of tools and their categories (add yours here)
app/tools/<id>/              one folder per tool: UI component + conversion logic
app/utils/ffmpeg.ts          lazy, shared ffmpeg.wasm instance
app/utils/image.ts           canvas helpers for the image tools
app/utils/convert.ts         runFfmpeg(): mount input, exec, read output, cancel/cleanup
app/components/ConvertFlow.vue  whole tool UI: pick file(s), options slot, progress, result, errors
app/components/MediaClipPicker.vue  preview + start/end time inputs (trim, extract frame)
app/components/OptionGroup.vue  radio-button group used for options
i18n/locales/*.json          zh-TW and en strings
nginx/                       production server config (cache headers, wasm/manifest MIME)
scripts/copy-ffmpeg-core.mjs copies the ffmpeg core into public/ffmpeg/<version>/ on install
```

### Add a tool

1. Create `app/tools/<id>/` with a `convert.ts` built on `runFfmpeg` and a small component that wraps
   `<ConvertFlow>` and fills its `#options` slot (see `mp4-to-mp3`).
2. Register it in `app/tools/registry.ts` with a `category` (`video`, `audio` or `image`).
3. Add `tools.<id>.title`, `.desc`, `.seoTitle`, `.keywords` (extra search words) to both locale files.

The page `/tools/<id>` and its `/en` twin are generated automatically.

## Notes

- **License:** `@ffmpeg/core` is GPL-2.0-or-later and `heic-to` (libheif) is LGPL-3.0. Choose this project's license with that in mind.
- **Phones:** service workers and install prompts need HTTPS (`localhost` is exempt). To test on a real
  phone, expose the site over HTTPS (e.g. a Cloudflare Tunnel) instead of `http://<lan-ip>:8090`.
- **Offline:** the 32 MB ffmpeg core and the 3 MB HEIC decoder are cached the first time a tool needs them, not at install.
- **iOS:** no install prompt exists; the site shows a hint to use Share → Add to Home Screen.
