<script setup lang="ts">
import { VIDEO_ACCEPT } from '~/utils/convert'
import { VIDEO_FORMATS, convertVideo, type VideoFormat } from './convert'

const { t } = useI18n()

const format = ref<VideoFormat>('mp4')
const formatOptions = VIDEO_FORMATS.map((value) => ({ value, label: value.toUpperCase() }))
</script>

<template>
  <ConvertFlow
    :accept="VIDEO_ACCEPT"
    :output-ext="format"
    :run="(file, hooks) => convertVideo(file, { format, ...hooks })"
  >
    <template #options>
      <OptionGroup
        v-model="format"
        :legend="t('tools.video-convert.format')"
        :hint="t(`tools.video-convert.hint.${format}`)"
        :options="formatOptions"
      />
    </template>
  </ConvertFlow>
</template>
