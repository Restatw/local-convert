import { readFileSync } from 'node:fs'
import tailwindcss from '@tailwindcss/vite'

// The ffmpeg core is copied to public/ffmpeg/<version>/ by scripts/copy-ffmpeg-core.mjs.
const ffmpegCoreVersion: string = JSON.parse(
  readFileSync(new URL('./node_modules/@ffmpeg/core/package.json', import.meta.url), 'utf-8'),
).version

export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  devtools: { enabled: false },
  modules: ['@nuxtjs/i18n', '@vite-pwa/nuxt'],
  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: { ffmpegCoreVersion },
  },

  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#000000' },
        { name: 'color-scheme', content: 'dark' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/favicon-48x48.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon-180x180.png' },
      ],
    },
  },

  vite: {
    plugins: [tailwindcss()],
    // ffmpeg.wasm spawns its own module worker; pre-bundling breaks the worker URL.
    optimizeDeps: { exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'] },
    build: {
      rollupOptions: {
        output: {
          // The HEIC decoder (~3 MB, wasm inlined) gets a recognizable name so the service worker
          // can cache it on first use instead of precaching it (see workbox below).
          chunkFileNames: (chunk) => (chunk.name.startsWith('heic-to') ? '_nuxt/heic-to.[hash].js' : '_nuxt/[hash].js'),
        },
      },
    },
  },

  i18n: {
    locales: [
      { code: 'zh-TW', language: 'zh-TW', name: '繁體中文', file: 'zh-TW.json' },
      { code: 'en', language: 'en', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'zh-TW',
    strategy: 'prefix_except_default',
    // The system language is applied by app/plugins/locale-redirect.client.ts, after hydration. The
    // module's own detection switches locale before hydrating, which mismatches the prerendered zh-TW HTML.
    detectBrowserLanguage: false,
  },

  // No page uses async data, so extracted _payload.json files would only be extra requests.
  experimental: { payloadExtraction: false },

  nitro: {
    prerender: { crawlLinks: true, routes: ['/', '/en'] },
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      id: '/',
      name: 'LocalConvert',
      short_name: 'LocalConvert',
      description: 'On-device file converter. Files never leave your device.',
      lang: 'zh-TW',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      orientation: 'any',
      background_color: '#000000',
      theme_color: '#000000',
      icons: [
        { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: '/maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico,json,webmanifest}'],
      // The 32 MB wasm is cached on first use (below) instead of being precached on every install.
      // 200.html / 404.html are host fallback pages; a single precache 404 aborts the whole SW install.
      globIgnores: ['ffmpeg/**', '_nuxt/heic-to.*', '200.html', '404.html'],
      runtimeCaching: [
        {
          urlPattern: ({ url }) => url.pathname.startsWith('/_nuxt/heic-to.'),
          handler: 'CacheFirst',
          options: {
            cacheName: 'heic-decoder',
            cacheableResponse: { statuses: [200] },
            expiration: { maxEntries: 2 },
          },
        },
        {
          urlPattern: ({ url }) => url.pathname.startsWith('/ffmpeg/'),
          handler: 'CacheFirst',
          options: {
            cacheName: 'ffmpeg-core',
            cacheableResponse: { statuses: [200] },
            expiration: { maxEntries: 6 },
          },
        },
      ],
    },
    client: { installPrompt: true },
    devOptions: { enabled: false },
  },
})
