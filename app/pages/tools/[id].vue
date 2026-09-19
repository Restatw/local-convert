<script setup lang="ts">
import { getTool } from '~/tools/registry'

const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()

const tool = getTool(String(route.params.id))
if (!tool) {
  throw createError({ statusCode: 404, statusMessage: 'Tool not found', fatal: true })
}
const ToolComponent = defineAsyncComponent(tool.component)

useSeoMeta({
  title: () => `${t(`tools.${tool.id}.seoTitle`)} · ${t('app.name')}`,
  description: () => t(`tools.${tool.id}.desc`),
})
</script>

<template>
  <div v-if="tool" class="flex flex-col gap-6">
    <div class="flex flex-col gap-2">
      <NuxtLink :to="localePath('/')" class="inline-flex w-fit items-center gap-1 text-sm text-mute hover:text-ink">
        <span aria-hidden="true">←</span> {{ t('tool.back') }}
      </NuxtLink>
      <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">{{ t(`tools.${tool.id}.title`) }}</h1>
      <p class="text-mute">{{ t(`tools.${tool.id}.desc`) }}</p>
    </div>

    <ToolComponent />

    <p class="text-center text-sm text-mute">{{ t('tool.localNote') }}</p>
  </div>
</template>
