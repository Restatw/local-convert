<script setup lang="ts">
const props = defineProps<{ accept?: string; disabled?: boolean; multiple?: boolean }>()
const emit = defineEmits<{ select: [files: File[]] }>()

const dragging = ref(false)

function pick(files: FileList | null | undefined) {
  const list = Array.from(files ?? [])
  if (list.length) emit('select', props.multiple ? list : list.slice(0, 1))
}

function onChange(event: Event) {
  const input = event.target as HTMLInputElement
  pick(input.files)
  input.value = '' // allow choosing the same file again
}
</script>

<template>
  <label
    class="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition focus-within:border-accent"
    :class="dragging ? 'border-accent bg-raised' : 'border-line bg-surface hover:border-mute'"
    @dragover.prevent="dragging = true"
    @dragleave="dragging = false"
    @drop.prevent="(dragging = false), pick($event.dataTransfer?.files)"
  >
    <input type="file" class="sr-only" :accept="accept" :disabled="disabled" :multiple="multiple" @change="onChange" />
    <slot />
  </label>
</template>
