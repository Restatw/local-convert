<script setup lang="ts">
import { AUDIO_ACCEPT, VIDEO_ACCEPT } from '~/utils/convert'
import type { AudioBitrate, AudioFormat } from '~/utils/audio'
import { convertAudio } from '../audio-convert/convert'
import { VOLUME_FILTER, VOLUME_MODES, type VolumeMode } from './convert'

const { t } = useI18n()

const mode = ref<VolumeMode>('normalize')
const format = ref<AudioFormat>('mp3')
const bitrate = ref<AudioBitrate>(192)

const modeOptions = VOLUME_MODES.map((value) => ({ value, label: t(`tools.audio-volume.mode.${value}`) }))
</script>

<template>
  <ConvertFlow
    :accept="`${AUDIO_ACCEPT},${VIDEO_ACCEPT}`"
    :output-ext="format"
    :hint="t('tools.audio-convert.dropHint')"
    :run="(file, hooks) => convertAudio(file, { format, bitrate, filter: VOLUME_FILTER[mode], ...hooks })"
  >
    <template #options>
      <OptionGroup
        v-model="mode"
        :legend="t('tools.audio-volume.modeLabel')"
        :hint="t(`tools.audio-volume.modeHint.${mode}`)"
        :options="modeOptions"
      />
      <AudioFormatOptions v-model:format="format" v-model:bitrate="bitrate" />
    </template>
  </ConvertFlow>
</template>
