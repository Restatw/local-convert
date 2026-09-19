<script setup lang="ts">
import { VIDEO_ACCEPT } from '~/utils/convert'
import { TRIM_MODES, trimVideo, trimVideoExt, type TrimMode } from './convert'

const { t } = useI18n()

const start = ref(0)
const end = ref(0)
const mode = ref<TrimMode>('fast')

const modeOptions = TRIM_MODES.map((value) => ({ value, label: t(`tools.video-trim.mode.${value}`) }))

const startSeconds = computed(() => Math.max(0, Number(start.value) || 0))
const endSeconds = computed(() => Math.max(0, Number(end.value) || 0))
const invalid = computed(() => endSeconds.value > 0 && endSeconds.value <= startSeconds.value)
</script>

<template>
  <ConvertFlow
    :accept="VIDEO_ACCEPT"
    :output-ext="(file) => trimVideoExt(file, mode)"
    :blocked="invalid"
    :run="(file, hooks) => trimVideo(file, { start: startSeconds, end: endSeconds, mode, ...hooks })"
  >
    <template #options="{ file }">
      <MediaClipPicker v-if="file" v-model:start="start" v-model:end="end" :file="file" mode="range" />
      <p v-if="invalid" class="text-sm text-danger" role="alert">{{ t('tool.clip.invalid') }}</p>
      <OptionGroup
        v-model="mode"
        :legend="t('tools.video-trim.modeLabel')"
        :hint="t(`tools.video-trim.modeHint.${mode}`)"
        :options="modeOptions"
      />
    </template>
  </ConvertFlow>
</template>
