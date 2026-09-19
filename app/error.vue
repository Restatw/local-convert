<script setup lang="ts">
defineProps<{ error: { statusCode: number } }>()
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <NuxtLayout>
    <div class="flex flex-col items-start gap-4 py-10">
      <p class="text-6xl font-semibold text-accent">{{ error.statusCode }}</p>
      <h1 class="text-2xl font-semibold">{{ t('notFound.title') }}</h1>
      <NuxtLink :to="localePath('/')" class="btn-primary" @click="clearError()">{{ t('notFound.back') }}</NuxtLink>
    </div>
  </NuxtLayout>
</template>
