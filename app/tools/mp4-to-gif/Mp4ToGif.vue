<script setup lang="ts">
import { VIDEO_ACCEPT } from '~/utils/convert'
import {
  GIF_DURATIONS,
  GIF_FPS,
  GIF_WIDTHS,
  convertToGif,
  type GifDuration,
  type GifFps,
  type GifWidth,
} from './convert'

const { t } = useI18n()

const fps = ref<GifFps>(12)
const width = ref<GifWidth>(480)
const duration = ref<GifDuration>(5)

const options = (values: readonly number[], key: string) =>
  values.map((n) => ({ value: n, label: t(`tools.mp4-to-gif.${key}Value`, { n }) }))
</script>

<template>
  <ConvertFlow
    :accept="VIDEO_ACCEPT"
    output-ext="gif"
    :run="(file, hooks) => convertToGif(file, { fps, width, duration, ...hooks })"
  >
    <template #options>
      <OptionGroup v-model="fps" :legend="t('tools.mp4-to-gif.fps')" :hint="t('tools.mp4-to-gif.fpsHint')" :options="options(GIF_FPS, 'fps')" />
      <OptionGroup v-model="width" :legend="t('tools.mp4-to-gif.width')" :hint="t('tools.mp4-to-gif.widthHint')" :options="options(GIF_WIDTHS, 'width')" />
      <OptionGroup v-model="duration" :legend="t('tools.mp4-to-gif.duration')" :hint="t('tools.mp4-to-gif.durationHint')" :options="options(GIF_DURATIONS, 'duration')" />
    </template>
  </ConvertFlow>
</template>
