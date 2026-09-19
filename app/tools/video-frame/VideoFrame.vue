<script setup lang="ts">
import { VIDEO_ACCEPT } from '~/utils/convert'
import { FRAME_FORMATS, extractFrame, type FrameFormat } from './convert'

const { t } = useI18n()

const time = ref(0)
const format = ref<FrameFormat>('png')
const formatOptions = FRAME_FORMATS.map((value) => ({ value, label: value.toUpperCase() }))
</script>

<template>
  <ConvertFlow
    :accept="VIDEO_ACCEPT"
    :output-ext="format"
    :run="(file, hooks) => extractFrame(file, { time: Math.max(0, Number(time) || 0), format, ...hooks })"
  >
    <template #options="{ file }">
      <MediaClipPicker v-if="file" v-model:start="time" :file="file" mode="point" />
      <OptionGroup
        v-model="format"
        :legend="t('tools.video-frame.format')"
        :hint="t(`tools.video-frame.formatHint.${format}`)"
        :options="formatOptions"
      />
    </template>
  </ConvertFlow>
</template>
