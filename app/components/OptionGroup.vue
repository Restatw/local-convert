<script setup lang="ts" generic="T extends string | number">
defineProps<{
  legend: string
  hint?: string
  options: { value: T; label: string }[]
}>()
const model = defineModel<T>({ required: true })
const name = useId()

const columns: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
}
</script>

<template>
  <fieldset class="flex flex-col gap-2">
    <legend class="text-sm font-medium">{{ legend }}</legend>
    <div class="grid gap-2" :class="columns[options.length] ?? 'grid-cols-2'">
      <label
        v-for="option in options"
        :key="option.value"
        class="grid min-h-12 cursor-pointer place-items-center rounded-xl border border-line bg-canvas px-2 text-center text-sm transition has-[:checked]:border-accent has-[:checked]:bg-accent has-[:checked]:font-medium has-[:checked]:text-accent-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent"
      >
        <input v-model="model" type="radio" :name="name" :value="option.value" class="sr-only" />
        {{ option.label }}
      </label>
    </div>
    <p v-if="hint" class="text-sm text-mute">{{ hint }}</p>
  </fieldset>
</template>
