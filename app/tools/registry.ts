import type { AsyncComponentLoader } from 'vue'

export const categories = ['video', 'audio', 'image'] as const
export type Category = (typeof categories)[number]

export interface ToolDef {
  id: string
  category: Category
  /** Inner SVG markup for a 24x24 stroke icon (trusted, static). */
  icon: string
  component: AsyncComponentLoader
}

// To add a tool: create app/tools/<id>/, register it here, and add
// `tools.<id>.title` / `.desc` / `.seoTitle` / `.keywords` to both locale files.
// A category with no tools is hidden from the home page.
export const tools: ToolDef[] = [
  {
    id: 'mp4-to-gif',
    category: 'video',
    icon: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9.5v5l4-2.5z"/>',
    component: () => import('./mp4-to-gif/Mp4ToGif.vue'),
  },
  {
    id: 'gif-to-mp4',
    category: 'video',
    icon: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
    component: () => import('./gif-to-mp4/GifToMp4.vue'),
  },
  {
    id: 'video-to-webp',
    category: 'video',
    icon: '<path d="M12 2l10 5-10 5L2 7z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>',
    component: () => import('./video-to-webp/VideoToWebp.vue'),
  },
  {
    id: 'video-compress',
    category: 'video',
    icon: '<path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/>',
    component: () => import('./video-compress/VideoCompress.vue'),
  },
  {
    id: 'video-convert',
    category: 'video',
    icon: '<path d="M17 3l4 4-4 4M21 7H8M7 21l-4-4 4-4M3 17h13"/>',
    component: () => import('./video-convert/VideoConvert.vue'),
  },
  {
    id: 'video-trim',
    category: 'video',
    icon: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12"/>',
    component: () => import('./video-trim/VideoTrim.vue'),
  },
  {
    id: 'video-mute',
    category: 'video',
    icon: '<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M23 9l-6 6M17 9l6 6"/>',
    component: () => import('./video-mute/VideoMute.vue'),
  },
  {
    id: 'video-frame',
    category: 'video',
    icon: '<path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>',
    component: () => import('./video-frame/VideoFrame.vue'),
  },
  {
    id: 'audio-convert',
    category: 'audio',
    icon: '<path d="M4 10v4M8 6v12M12 3v18M16 8v8M20 11v2"/>',
    component: () => import('./audio-convert/AudioConvert.vue'),
  },
  {
    id: 'mp4-to-mp3',
    category: 'audio',
    icon: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    component: () => import('./mp4-to-mp3/Mp4ToMp3.vue'),
  },
  {
    id: 'audio-trim',
    category: 'audio',
    icon: '<path d="M8 4H5v16h3M16 4h3v16h-3M12 8v8"/>',
    component: () => import('./audio-trim/AudioTrim.vue'),
  },
  {
    id: 'audio-merge',
    category: 'audio',
    icon: '<path d="M6 3v5a6 6 0 0012 0V3M12 14v7"/>',
    component: () => import('./audio-merge/AudioMerge.vue'),
  },
  {
    id: 'audio-volume',
    category: 'audio',
    icon: '<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 010 7M19 5a10 10 0 010 14"/>',
    component: () => import('./audio-volume/AudioVolume.vue'),
  },
  {
    id: 'heic-to-jpg',
    category: 'image',
    icon: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>',
    component: () => import('./heic-to-jpg/HeicToJpg.vue'),
  },
  {
    id: 'image-convert',
    category: 'image',
    icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
    component: () => import('./image-convert/ImageConvert.vue'),
  },
]

export const getTool = (id: string) => tools.find((tool) => tool.id === id)
