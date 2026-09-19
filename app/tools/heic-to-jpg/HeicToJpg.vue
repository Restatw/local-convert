<script setup lang="ts">
import { HEIC_ACCEPT, IMAGE_QUALITIES, type ImageQuality } from '~/utils/image'
import { HEIC_FORMATS, convertHeic, type HeicFormat } from './convert'

const { t } = useI18n()

const format = ref<HeicFormat>('jpg')
const quality = ref<ImageQuality>('high')

const formatOptions = HEIC_FORMATS.map((value) => ({ value, label: value.toUpperCase() }))
const qualityOptions = IMAGE_QUALITIES.map((value) => ({ value, label: t(`tool.imageQuality.${value}`) }))
</script>

<template>
  <ConvertFlow
    :accept="HEIC_ACCEPT"
    :output-ext="format"
    :hint="t('tools.heic-to-jpg.dropHint')"
    instant
    :run="(file, hooks) => convertHeic(file, { format, quality, ...hooks })"
  >
    <template #options>
      <OptionGroup
        v-model="format"
        :legend="t('tools.heic-to-jpg.format')"
        :hint="t(`tools.heic-to-jpg.formatHint.${format}`)"
        :options="formatOptions"
      />
      <OptionGroup
        v-if="format === 'jpg'"
        v-model="quality"
        :legend="t('tool.imageQuality.label')"
        :hint="t('tool.imageQuality.hint')"
        :options="qualityOptions"
      />
    </template>
  </ConvertFlow>
</template>
