<script setup lang="ts">
import { AUDIO_ACCEPT, VIDEO_ACCEPT } from '~/utils/convert'
import type { AudioBitrate, AudioFormat } from '~/utils/audio'
import { mergeAudio } from './convert'

const { t } = useI18n()

const format = ref<AudioFormat>('mp3')
const bitrate = ref<AudioBitrate>(192)
</script>

<template>
  <ConvertFlow
    multiple
    :accept="`${AUDIO_ACCEPT},${VIDEO_ACCEPT}`"
    :output-ext="format"
    output-base="merged"
    :hint="t('tools.audio-merge.dropHint')"
    :run-many="(files, hooks) => mergeAudio(files, { format, bitrate, ...hooks })"
  >
    <template #options>
      <AudioFormatOptions v-model:format="format" v-model:bitrate="bitrate" />
    </template>
  </ConvertFlow>
</template>
