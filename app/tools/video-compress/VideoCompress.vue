<script setup lang="ts">
import { VIDEO_ACCEPT } from '~/utils/convert'
import {
  COMPRESS_HEIGHTS,
  COMPRESS_QUALITIES,
  compressVideo,
  type CompressHeight,
  type CompressQuality,
} from './convert'

const { t } = useI18n()

const quality = ref<CompressQuality>('balanced')
const maxHeight = ref<CompressHeight>(0)

const qualityOptions = COMPRESS_QUALITIES.map((value) => ({
  value,
  label: t(`tools.video-compress.quality.${value}`),
}))
const heightOptions = COMPRESS_HEIGHTS.map((value) => ({
  value,
  label: value ? `${value}p` : t('tools.video-compress.original'),
}))
</script>

<template>
  <ConvertFlow
    :accept="VIDEO_ACCEPT"
    output-ext="mp4"
    compare
    :run="(file, hooks) => compressVideo(file, { quality, maxHeight, ...hooks })"
  >
    <template #options>
      <OptionGroup
        v-model="quality"
        :legend="t('tools.video-compress.qualityLabel')"
        :hint="t('tools.video-compress.qualityHint')"
        :options="qualityOptions"
      />
      <OptionGroup
        v-model="maxHeight"
        :legend="t('tools.video-compress.resolution')"
        :hint="t('tools.video-compress.resolutionHint')"
        :options="heightOptions"
      />
    </template>
  </ConvertFlow>
</template>
