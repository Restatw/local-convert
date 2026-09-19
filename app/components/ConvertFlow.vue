<script setup lang="ts">
import { ConvertAbortError, ConvertError, type ConvertErrorCode, type RunHooks } from '~/utils/convert'

type Phase = 'idle' | 'ready' | 'loading' | 'converting' | 'done' | 'error'
type ErrorCode = ConvertErrorCode | 'unknown'

const props = defineProps<{
  accept: string
  /** Extension of the produced file, without the dot. May depend on the source file. */
  outputExt: string | ((file: File) => string)
  /** Extra line under the drop zone title. Defaults to the video formats hint. */
  hint?: string
  /** Show the size change against the source file (for compression). */
  compare?: boolean
  /** For converters that run in the browser itself (no ffmpeg): no engine download, no percentage. */
  instant?: boolean
  /** Disables the convert button, e.g. while the options are invalid. */
  blocked?: boolean
  /** Take several files (at least two), in a user-defined order. Uses `runMany` instead of `run`. */
  multiple?: boolean
  /** Base name of the produced file when there are several sources. */
  outputBase?: string
  run?: (file: File, hooks: RunHooks) => Promise<Blob>
  runMany?: (files: File[], hooks: RunHooks) => Promise<Blob>
}>()

const { t } = useI18n()

const phase = ref<Phase>('idle')
const files = ref<File[]>([])
const progress = ref(0)
const errorCode = ref<ErrorCode>('unknown')
const result = ref<{ url: string; blob: Blob; name: string; sourceSize: number } | null>(null)
const supportsShare = ref(false)
const previewFailed = ref(false) // e.g. a browser that cannot play the produced MKV

let controller: AbortController | null = null

onMounted(() => {
  supportsShare.value = typeof navigator.canShare === 'function'
})

onBeforeUnmount(() => {
  controller?.abort()
  clearResult()
})

const kind = computed(() => result.value?.blob.type.split('/')[0])
const canConvert = computed(() => !props.blocked && files.value.length >= (props.multiple ? 2 : 1))
const resultFormat = computed(() => extensionOf(result.value?.name ?? '').toUpperCase())

const canShare = computed(() => {
  if (!supportsShare.value || !result.value) return false
  try {
    return navigator.canShare({ files: [toFile(result.value)] })
  } catch {
    return false
  }
})

const savings = computed(() => {
  if (!props.compare || !result.value) return null
  const { sourceSize, blob } = result.value
  const percent = Math.round((1 - blob.size / sourceSize) * 100)
  return { from: formatBytes(sourceSize), to: formatBytes(blob.size), percent }
})

function toFile({ blob, name }: { blob: Blob; name: string }) {
  return new File([blob], name, { type: blob.type })
}

function clearResult() {
  previewFailed.value = false
  if (result.value) URL.revokeObjectURL(result.value.url)
  result.value = null
}

function onSelect(selected: File[]) {
  clearResult()
  files.value = selected
  progress.value = 0
  phase.value = 'ready'
}

function addFiles(event: Event) {
  const input = event.target as HTMLInputElement
  files.value = [...files.value, ...Array.from(input.files ?? [])]
  input.value = ''
}

function move(index: number, delta: -1 | 1) {
  const next = [...files.value]
  const [item] = next.splice(index, 1)
  next.splice(index + delta, 0, item!)
  files.value = next
}

function remove(index: number) {
  files.value = files.value.filter((_, i) => i !== index)
  if (files.value.length === 0) reset()
}

function reset() {
  clearResult()
  files.value = []
  phase.value = 'idle'
}

async function start() {
  const sources = files.value
  const first = sources[0]
  if (!first || !canConvert.value) return
  clearResult()
  progress.value = 0
  phase.value = props.instant ? 'converting' : 'loading'
  controller = new AbortController()
  try {
    const hooks: RunHooks = {
      signal: controller.signal,
      onReady: () => (phase.value = 'converting'),
      onProgress: (ratio) => (progress.value = ratio),
    }
    const blob = props.multiple ? await props.runMany!(sources, hooks) : await props.run!(first, hooks)
    const ext = typeof props.outputExt === 'function' ? props.outputExt(first) : props.outputExt
    result.value = {
      blob,
      url: URL.createObjectURL(blob),
      name: props.outputBase ? `${props.outputBase}.${ext}` : replaceExtension(first.name, ext),
      sourceSize: sources.reduce((sum, source) => sum + source.size, 0),
    }
    phase.value = 'done'
  } catch (error) {
    if (error instanceof ConvertAbortError) {
      phase.value = 'ready'
      return
    }
    errorCode.value = error instanceof ConvertError ? error.code : 'unknown'
    phase.value = 'error'
  }
}

function cancel() {
  controller?.abort()
}

async function share() {
  if (!result.value) return
  try {
    await navigator.share({ files: [toFile(result.value)] })
  } catch {} // the user closing the share sheet rejects; nothing to do
}
</script>

<template>
  <section class="rounded-2xl border border-line bg-surface p-5 sm:p-6">
    <!-- 1. pick a file -->
    <FileDrop v-if="phase === 'idle'" :accept="accept" :multiple="multiple" @select="onSelect">
      <svg
        viewBox="0 0 24 24"
        class="size-10 text-accent"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M12 16V4m0 0L7 9m5-5l5 5" />
        <path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" />
      </svg>
      <span class="text-lg font-medium">{{ t('tool.drop') }}</span>
      <span class="text-sm text-mute">{{ hint ?? t('tool.dropHint') }}</span>
    </FileDrop>

    <div v-else class="flex flex-col gap-5">
      <!-- selected file(s) -->
      <template v-if="files.length && (phase === 'ready' || phase === 'error')">
        <div v-if="!multiple" class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="truncate font-medium" :title="files[0]!.name">{{ files[0]!.name }}</p>
            <p class="text-sm text-mute">{{ formatBytes(files[0]!.size) }}</p>
          </div>
          <button type="button" class="btn-ghost !min-h-10 shrink-0 !px-4 text-sm" @click="reset">
            {{ t('tool.change') }}
          </button>
        </div>
        <div v-else class="flex flex-col gap-3">
          <div class="flex items-center justify-between gap-3">
            <p class="font-medium">{{ t('tool.filesCount', { n: files.length }) }}</p>
            <button type="button" class="btn-ghost !min-h-10 shrink-0 !px-4 text-sm" @click="reset">
              {{ t('tool.change') }}
            </button>
          </div>
          <template v-if="phase === 'ready'">
            <ol class="flex flex-col gap-2">
              <li
                v-for="(item, index) in files"
                :key="`${index}-${item.name}-${item.size}`"
                class="flex items-center gap-2 rounded-xl border border-line bg-canvas p-2 pl-3"
              >
                <span class="w-5 shrink-0 text-sm tabular-nums text-mute">{{ index + 1 }}</span>
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-sm font-medium" :title="item.name">{{ item.name }}</span>
                  <span class="block text-xs text-mute">{{ formatBytes(item.size) }}</span>
                </span>
                <button
                  type="button"
                  class="btn-ghost !min-h-10 !px-3"
                  :disabled="index === 0"
                  :aria-label="t('tool.moveUp')"
                  @click="move(index, -1)"
                >
                  ↑
                </button>
                <button
                  type="button"
                  class="btn-ghost !min-h-10 !px-3"
                  :disabled="index === files.length - 1"
                  :aria-label="t('tool.moveDown')"
                  @click="move(index, 1)"
                >
                  ↓
                </button>
                <button type="button" class="btn-ghost !min-h-10 !px-3" :aria-label="t('tool.remove')" @click="remove(index)">
                  ✕
                </button>
              </li>
            </ol>
            <label class="btn-ghost cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent">
              + {{ t('tool.addFiles') }}
              <input type="file" class="sr-only" :accept="accept" multiple @change="addFiles" />
            </label>
            <p v-if="files.length < 2" class="text-sm text-mute">{{ t('tool.needTwo') }}</p>
          </template>
        </div>
      </template>

      <!-- 2. options -->
      <template v-if="phase === 'ready'">
        <slot name="options" :file="files[0]" :files="files" />
        <button type="button" class="btn-primary w-full" :disabled="!canConvert" @click="start">
          {{ t('tool.convert') }}
        </button>
      </template>

      <!-- 3. working -->
      <template v-else-if="phase === 'loading' || phase === 'converting'">
        <div class="flex flex-col gap-3" role="status" aria-live="polite">
          <template v-if="phase === 'loading'">
            <p class="font-medium">{{ t('tool.loadingEngine') }}</p>
            <div class="h-2 overflow-hidden rounded-full bg-raised">
              <div class="h-full w-full animate-pulse rounded-full bg-accent/60" />
            </div>
            <p class="text-sm text-mute">{{ t('tool.loadingEngineHint') }}</p>
          </template>
          <template v-else>
            <template v-if="instant">
              <p class="font-medium">{{ t('tool.converting') }}</p>
              <div class="h-2 overflow-hidden rounded-full bg-raised">
                <div class="h-full w-full animate-pulse rounded-full bg-accent/60" />
              </div>
            </template>
            <template v-else>
              <div class="flex items-baseline justify-between">
                <p class="font-medium">{{ t('tool.converting') }}</p>
                <p class="text-sm tabular-nums text-mute">{{ Math.round(progress * 100) }}%</p>
              </div>
              <div
                class="h-2 overflow-hidden rounded-full bg-raised"
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"
                :aria-valuenow="Math.round(progress * 100)"
              >
                <div class="h-full rounded-full bg-accent transition-[width]" :style="{ width: `${progress * 100}%` }" />
              </div>
            </template>
          </template>
        </div>
        <button type="button" class="btn-ghost w-full" @click="cancel">{{ t('tool.cancel') }}</button>
      </template>

      <!-- 4. result -->
      <template v-else-if="phase === 'done' && result">
        <div class="flex flex-col gap-1">
          <p class="font-medium text-accent">{{ t('tool.done') }}</p>
          <p class="truncate text-sm text-mute" :title="result.name">
            {{ result.name }} · {{ formatBytes(result.blob.size) }}
          </p>
          <p v-if="savings" class="text-sm text-mute">
            {{ savings.from }} → {{ savings.to }}
            <span :class="savings.percent > 0 ? 'text-accent' : 'text-danger'">
              ({{ savings.percent > 0 ? '−' : '+' }}{{ Math.abs(savings.percent) }}%)
            </span>
          </p>
        </div>
        <audio v-if="kind === 'audio'" :src="result.url" controls preload="metadata" class="w-full" />
        <video
          v-else-if="kind === 'video' && !previewFailed"
          :src="result.url"
          controls
          playsinline
          preload="metadata"
          class="mx-auto max-h-96 w-auto max-w-full rounded-xl bg-canvas"
          @error="previewFailed = true"
        />
        <img
          v-else-if="kind === 'image'"
          :src="result.url"
          :alt="result.name"
          class="mx-auto max-h-96 w-auto max-w-full rounded-xl bg-canvas"
        />
        <div class="flex flex-col gap-2 sm:flex-row">
          <a :href="result.url" :download="result.name" class="btn-primary flex-1">
            {{ t('tool.download', { format: resultFormat }) }}
          </a>
          <button v-if="canShare" type="button" class="btn-ghost flex-1" @click="share">
            {{ t('tool.share') }}
          </button>
        </div>
        <button type="button" class="btn-ghost w-full" @click="reset">{{ t('tool.another') }}</button>
      </template>

      <!-- error -->
      <template v-else-if="phase === 'error'">
        <div class="rounded-xl border border-danger/40 bg-danger/10 p-4" role="alert">
          <p class="font-medium text-danger">{{ t('tool.error.title') }}</p>
          <p class="mt-1 text-sm">{{ t(`tool.error.${errorCode}`) }}</p>
        </div>
        <button type="button" class="btn-primary w-full" @click="phase = 'ready'">{{ t('tool.error.retry') }}</button>
      </template>
    </div>
  </section>
</template>
