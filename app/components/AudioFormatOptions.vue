<script setup lang="ts">
import { AUDIO_BITRATES, AUDIO_FORMATS, isLossy, type AudioBitrate, type AudioFormat } from '~/utils/audio'

const format = defineModel<AudioFormat>('format', { required: true })
const bitrate = defineModel<AudioBitrate>('bitrate', { required: true })

const { t } = useI18n()

const formatOptions = AUDIO_FORMATS.map((value) => ({ value, label: value.toUpperCase() }))
const bitrateOptions = AUDIO_BITRATES.map((value) => ({ value, label: `${value}k` }))
</script>

<template>
  <OptionGroup
    v-model="format"
    :legend="t('tool.audio.format')"
    :hint="t(`tool.audio.formatHint.${format}`)"
    :options="formatOptions"
  />
  <OptionGroup
    v-if="isLossy(format)"
    v-model="bitrate"
    :legend="t('tool.bitrate')"
    :hint="t('tool.bitrateHint')"
    :options="bitrateOptions"
  />
</template>
