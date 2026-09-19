<script setup lang="ts">
// Previews a video or audio file and lets the user pick a start time (and, in `range` mode, an end time)
// by typing seconds or by pausing the player where they want it. An end of 0 means "until the end".
const props = defineProps<{ file: File; mode: 'range' | 'point' }>()
const start = defineModel<number>('start', { required: true })
const end = defineModel<number>('end', { default: 0 })

const { t } = useI18n()

const player = ref<HTMLMediaElement | null>(null)
const url = ref('')
const duration = ref(0)
const previewFailed = ref(false)

const isAudio = computed(() => props.file.type.startsWith('audio/'))

watch(
  () => props.file,
  (file) => {
    if (url.value) URL.revokeObjectURL(url.value)
    url.value = URL.createObjectURL(file)
    duration.value = 0
    previewFailed.value = false
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (url.value) URL.revokeObjectURL(url.value)
})

const round = (seconds: number) => Math.round(seconds * 10) / 10

function onMetadata() {
  const value = player.value?.duration
  if (value && Number.isFinite(value)) duration.value = round(value)
}

function useCurrent(target: typeof start) {
  if (player.value) target.value = round(player.value.currentTime)
}

const fields = computed(() =>
  props.mode === 'range'
    ? [
        { key: 'start', model: start, label: t('tool.clip.start') },
        { key: 'end', model: end, label: t('tool.clip.end') },
      ]
    : [{ key: 'start', model: start, label: t('tool.clip.time') }],
)
</script>

<template>
  <div class="flex flex-col gap-3">
    <audio v-if="isAudio" ref="player" :src="url" controls preload="metadata" class="w-full" @loadedmetadata="onMetadata" />
    <video
      v-else-if="!previewFailed"
      ref="player"
      :src="url"
      controls
      playsinline
      preload="metadata"
      class="mx-auto max-h-64 w-auto max-w-full rounded-xl bg-canvas"
      @loadedmetadata="onMetadata"
      @error="previewFailed = true"
    />
    <p v-else class="text-sm text-mute">{{ t('tool.clip.noPreview') }}</p>

    <div class="grid gap-3" :class="mode === 'range' ? 'sm:grid-cols-2' : ''">
      <div v-for="field in fields" :key="field.key" class="flex flex-col gap-2">
        <label :for="`clip-${field.key}`" class="text-sm font-medium">{{ field.label }}</label>
        <div class="flex items-center gap-2">
          <input
            :id="`clip-${field.key}`"
            v-model.number="field.model.value"
            type="number"
            inputmode="decimal"
            min="0"
            :max="duration || undefined"
            step="0.1"
            class="min-h-12 w-full min-w-0 rounded-xl border border-line bg-canvas px-4 text-base tabular-nums focus-visible:border-accent"
          />
          <span class="shrink-0 text-sm text-mute">{{ t('tool.clip.seconds') }}</span>
        </div>
        <button
          v-if="!previewFailed"
          type="button"
          class="btn-ghost !min-h-10 text-sm"
          @click="useCurrent(field.model)"
        >
          {{ t('tool.clip.useCurrent') }}
        </button>
        <p v-if="field.key === 'end'" class="text-sm text-mute">
          {{ Number(end) > 0 ? formatTime(Number(end)) : t('tool.clip.toEnd') }}
        </p>
        <p v-else class="text-sm text-mute">{{ formatTime(Number(field.model.value) || 0) }}</p>
      </div>
    </div>
    <p v-if="duration" class="text-sm text-mute">{{ t('tool.clip.total', { time: formatTime(duration) }) }}</p>
  </div>
</template>
