<script setup lang="ts">
import { AUDIO_ACCEPT, VIDEO_ACCEPT } from '~/utils/convert'
import type { AudioBitrate, AudioFormat } from '~/utils/audio'
import { convertAudio } from './convert'

const { t } = useI18n()

const format = ref<AudioFormat>('mp3')
const bitrate = ref<AudioBitrate>(192)
</script>

<template>
  <ConvertFlow
    :accept="`${AUDIO_ACCEPT},${VIDEO_ACCEPT}`"
    :output-ext="format"
    :hint="t('tools.audio-convert.dropHint')"
    :run="(file, hooks) => convertAudio(file, { format, bitrate, ...hooks })"
  >
    <template #options>
      <AudioFormatOptions v-model:format="format" v-model:bitrate="bitrate" />
    </template>
  </ConvertFlow>
</template>
