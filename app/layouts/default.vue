<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()

useHead({ htmlAttrs: { lang: locale } })
</script>

<template>
  <div class="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 pt-[env(safe-area-inset-top)] sm:px-6">
    <header class="flex h-16 items-center">
      <NuxtLink :to="localePath('/')" class="flex items-center gap-2.5 font-semibold tracking-tight">
        <img src="/icon.svg" alt="" width="28" height="28" class="size-7 rounded-lg" />
        {{ t('app.name') }}
      </NuxtLink>
    </header>

    <main class="flex-1 py-6 sm:py-10">
      <slot />
    </main>

    <footer class="py-8 pb-[max(2rem,env(safe-area-inset-bottom))] text-center text-sm text-mute">
      {{ t('footer.text') }}
    </footer>
  </div>
</template>
