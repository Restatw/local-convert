<script setup lang="ts">
import { VIDEO_ACCEPT } from '~/utils/convert'
import { GIF_DURATIONS, GIF_FPS, GIF_WIDTHS, type GifDuration, type GifFps, type GifWidth } from '../mp4-to-gif/convert'
import { ANIMATED_FORMATS, animatedExt, convertToAnimated, type AnimatedFormat } from './convert'

const { t } = useI18n()

const format = ref<AnimatedFormat>('webp')
const fps = ref<GifFps>(12)
const width = ref<GifWidth>(480)
const duration = ref<GifDuration>(5)

const formatOptions = ANIMATED_FORMATS.map((value) => ({ value, label: value.toUpperCase() }))
const options = (values: readonly number[], key: string) =>
  values.map((n) => ({ value: n, label: t(`tools.mp4-to-gif.${key}Value`, { n }) }))
</script>

<template>
  <ConvertFlow
    :accept="VIDEO_ACCEPT"
    :output-ext="animatedExt(format)"
    :run="(file, hooks) => convertToAnimated(file, { format, fps, width, duration, ...hooks })"
  >
    <template #options>
      <OptionGroup
        v-model="format"
        :legend="t('tools.video-to-webp.format')"
        :hint="t(`tools.video-to-webp.formatHint.${format}`)"
        :options="formatOptions"
      />
      <OptionGroup v-model="fps" :legend="t('tools.mp4-to-gif.fps')" :hint="t('tools.mp4-to-gif.fpsHint')" :options="options(GIF_FPS, 'fps')" />
      <OptionGroup v-model="width" :legend="t('tools.mp4-to-gif.width')" :hint="t('tools.mp4-to-gif.widthHint')" :options="options(GIF_WIDTHS, 'width')" />
      <OptionGroup v-model="duration" :legend="t('tools.mp4-to-gif.duration')" :hint="t('tools.mp4-to-gif.durationHint')" :options="options(GIF_DURATIONS, 'duration')" />
    </template>
  </ConvertFlow>
</template>
