<script setup lang="ts">
import { convertGifToMp4 } from './convert'

const { t } = useI18n()
</script>

<template>
  <ConvertFlow
    accept="image/gif,.gif"
    output-ext="mp4"
    :hint="t('tools.gif-to-mp4.dropHint')"
    :run="convertGifToMp4"
  />
</template>
