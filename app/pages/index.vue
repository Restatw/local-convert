<script setup lang="ts">
import { categories, tools, type Category } from '~/tools/registry'

const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: () => `${t('app.name')} · ${t('app.tagline')}`,
  description: () => t('home.subtitle'),
})

const features = ['private', 'open', 'offline'] as const

const query = ref('')
const active = ref<Category | 'all'>('all')

// Categories without tools stay hidden until the first tool is registered.
const available = categories.filter((category) => tools.some((tool) => tool.category === category))

const chips = ['all', ...available] as const

const haystack = (id: string) =>
  [id, t(`tools.${id}.title`), t(`tools.${id}.desc`), t(`tools.${id}.keywords`)].join(' ').toLowerCase()

const groups = computed(() => {
  const terms = query.value.toLowerCase().split(/\s+/).filter(Boolean)
  return available
    .filter((category) => active.value === 'all' || active.value === category)
    .map((category) => ({
      category,
      tools: tools.filter((tool) => tool.category === category && terms.every((term) => haystack(tool.id).includes(term))),
    }))
    .filter((group) => group.tools.length > 0)
})
</script>

<template>
  <div class="flex flex-col gap-10">
    <section class="flex flex-col gap-4">
      <h1 class="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{{ t('home.title') }}</h1>
      <p class="max-w-xl text-lg text-mute text-pretty">{{ t('home.subtitle') }}</p>
    </section>

    <InstallPrompt />

    <section class="flex flex-col gap-6">
      <div class="flex flex-col gap-3">
        <div class="relative">
          <label for="tool-search" class="sr-only">{{ t('home.searchLabel') }}</label>
          <svg
            viewBox="0 0 24 24"
            class="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-mute"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            id="tool-search"
            v-model="query"
            type="search"
            enterkeyhint="search"
            autocomplete="off"
            :placeholder="t('home.searchPlaceholder')"
            class="min-h-12 w-full rounded-xl border border-line bg-surface pr-4 pl-11 text-base placeholder:text-mute focus-visible:border-accent"
          />
        </div>

        <div v-if="available.length > 1" class="-mx-1 flex flex-wrap gap-2 px-1" role="group" :aria-label="t('home.categories')">
          <button
            v-for="key in chips"
            :key="key"
            type="button"
            :aria-pressed="active === key"
            class="min-h-10 rounded-full border px-4 text-sm transition active:scale-[0.98]"
            :class="
              active === key
                ? 'border-accent bg-accent font-medium text-accent-ink'
                : 'border-line bg-surface text-ink hover:bg-raised'
            "
            @click="active = key"
          >
            {{ key === 'all' ? t('home.all') : t(`categories.${key}`) }}
          </button>
        </div>
      </div>

      <section v-for="group in groups" :key="group.category" :aria-labelledby="`cat-${group.category}`" class="flex flex-col gap-3">
        <h2 :id="`cat-${group.category}`" class="text-sm font-medium tracking-wide text-mute uppercase">
          {{ t(`categories.${group.category}`) }}
        </h2>
        <ul class="grid gap-3 sm:grid-cols-2">
          <li v-for="tool in group.tools" :key="tool.id">
            <NuxtLink
              :to="localePath(`/tools/${tool.id}`)"
              class="group flex h-full items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition hover:border-mute hover:bg-raised active:scale-[0.99]"
            >
              <span class="grid size-12 shrink-0 place-items-center rounded-xl bg-accent text-accent-ink">
                <svg
                  viewBox="0 0 24 24"
                  class="size-6"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                  v-html="tool.icon"
                />
              </span>
              <span class="min-w-0">
                <span class="block font-medium">{{ t(`tools.${tool.id}.title`) }}</span>
                <span class="mt-0.5 block text-sm text-mute">{{ t(`tools.${tool.id}.desc`) }}</span>
              </span>
            </NuxtLink>
          </li>
        </ul>
      </section>

      <p v-if="groups.length === 0" class="py-6 text-center text-mute" role="status">
        {{ t('home.noResults', { query: query.trim() }) }}
      </p>
    </section>

    <section class="grid gap-3 sm:grid-cols-3">
      <div v-for="key in features" :key="key" class="rounded-2xl border border-line p-4">
        <p class="font-medium">{{ t(`home.features.${key}.title`) }}</p>
        <p class="mt-1 text-sm text-mute">{{ t(`home.features.${key}.desc`) }}</p>
      </div>
    </section>
  </div>
</template>
