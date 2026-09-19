<script setup lang="ts">
const { $pwa } = useNuxtApp()
const { t } = useI18n()

const IOS_KEY = 'install-hint-dismissed'
const isIos = ref(false)
const standalone = ref(false)
const iosDismissed = ref(false)

onMounted(() => {
  const ua = navigator.userAgent
  isIos.value =
    /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  standalone.value =
    matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true
  try {
    iosDismissed.value = localStorage.getItem(IOS_KEY) === '1'
  } catch {}
})

// Chromium browsers (Android, desktop) fire beforeinstallprompt; iOS Safari never does.
const showNative = computed(() => !!$pwa?.showInstallPrompt.value && !standalone.value)
const showIos = computed(() => isIos.value && !standalone.value && !iosDismissed.value)

function dismissIos() {
  iosDismissed.value = true
  try {
    localStorage.setItem(IOS_KEY, '1')
  } catch {}
}
</script>

<template>
  <aside
    v-if="showNative || showIos"
    class="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="min-w-0">
      <p class="font-medium">{{ t('install.title') }}</p>
      <p class="mt-0.5 text-sm text-mute">{{ showNative ? t('install.desc') : t('install.iosHint') }}</p>
    </div>
    <div class="flex shrink-0 gap-2">
      <button v-if="showNative" type="button" class="btn-primary !min-h-10 !px-4 text-sm" @click="$pwa?.install()">
        {{ t('install.action') }}
      </button>
      <button
        type="button"
        class="btn-ghost !min-h-10 !px-4 text-sm"
        @click="showNative ? $pwa?.cancelInstall() : dismissIos()"
      >
        {{ t('install.dismiss') }}
      </button>
    </div>
  </aside>
</template>
