<script setup lang="ts">
import { VIDEO_ACCEPT } from '~/utils/convert'
import { MP3_BITRATES, convertToMp3, type Mp3Bitrate } from './convert'

const { t } = useI18n()

const bitrate = ref<Mp3Bitrate>(192)
const bitrateOptions = MP3_BITRATES.map((value) => ({ value, label: `${value}k` }))
</script>

<template>
  <ConvertFlow
    :accept="VIDEO_ACCEPT"
    output-ext="mp3"
    :run="(file, hooks) => convertToMp3(file, { bitrate, ...hooks })"
  >
    <template #options>
      <OptionGroup
        v-model="bitrate"
        :legend="t('tool.bitrate')"
        :hint="t('tool.bitrateHint')"
        :options="bitrateOptions"
      />
    </template>
  </ConvertFlow>
</template>
