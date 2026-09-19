<script setup lang="ts">
import { IMAGE_ACCEPT, IMAGE_FORMATS, IMAGE_QUALITIES, type ImageFormat, type ImageQuality } from '~/utils/image'
import { MAX_SIDES, convertImage, type MaxSide } from './convert'

const { t } = useI18n()

const format = ref<ImageFormat>('jpg')
const quality = ref<ImageQuality>('balanced')
const maxSide = ref<MaxSide>(0)

const formatOptions = IMAGE_FORMATS.map((value) => ({ value, label: value.toUpperCase() }))
const qualityOptions = IMAGE_QUALITIES.map((value) => ({ value, label: t(`tool.imageQuality.${value}`) }))
const sizeOptions = MAX_SIDES.map((value) => ({
  value,
  label: value ? `${value} px` : t('tools.image-convert.original'),
}))
</script>

<template>
  <ConvertFlow
    :accept="IMAGE_ACCEPT"
    :output-ext="format"
    :hint="t('tools.image-convert.dropHint')"
    instant
    :run="(file, hooks) => convertImage(file, { format, quality, maxSide, ...hooks })"
  >
    <template #options>
      <OptionGroup
        v-model="format"
        :legend="t('tools.image-convert.format')"
        :hint="t(`tools.image-convert.formatHint.${format}`)"
        :options="formatOptions"
      />
      <OptionGroup
        v-if="format !== 'png'"
        v-model="quality"
        :legend="t('tool.imageQuality.label')"
        :hint="t('tool.imageQuality.hint')"
        :options="qualityOptions"
      />
      <OptionGroup
        v-model="maxSide"
        :legend="t('tools.image-convert.size')"
        :hint="t('tools.image-convert.sizeHint')"
        :options="sizeOptions"
      />
    </template>
  </ConvertFlow>
</template>
