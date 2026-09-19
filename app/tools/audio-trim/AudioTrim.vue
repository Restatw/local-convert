<script setup lang="ts">
import { AUDIO_ACCEPT, VIDEO_ACCEPT } from '~/utils/convert'
import { trimAudio, trimAudioExt } from './convert'

const { t } = useI18n()

const start = ref(0)
const end = ref(0)

const startSeconds = computed(() => Math.max(0, Number(start.value) || 0))
const endSeconds = computed(() => Math.max(0, Number(end.value) || 0))
const invalid = computed(() => endSeconds.value > 0 && endSeconds.value <= startSeconds.value)
</script>

<template>
  <ConvertFlow
    :accept="`${AUDIO_ACCEPT},${VIDEO_ACCEPT}`"
    :output-ext="trimAudioExt"
    :hint="t('tools.audio-convert.dropHint')"
    :blocked="invalid"
    :run="(file, hooks) => trimAudio(file, { start: startSeconds, end: endSeconds, ...hooks })"
  >
    <template #options="{ file }">
      <MediaClipPicker v-if="file" v-model:start="start" v-model:end="end" :file="file" mode="range" />
      <p v-if="invalid" class="text-sm text-danger" role="alert">{{ t('tool.clip.invalid') }}</p>
    </template>
  </ConvertFlow>
</template>
