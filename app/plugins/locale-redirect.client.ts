// There is no language switch: the language follows the system. Any Chinese becomes Traditional
// Chinese and everything else English. This runs after hydration so it never disagrees with the
// prerendered HTML (zh-TW at "/", English under "/en"); on a mismatch it swaps to the same page in
// the other language. It applies to every page, so shared links open in the visitor's language.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => {
    const i18n = nuxtApp.$i18n
    const target = navigator.language.toLowerCase().startsWith('zh') ? 'zh-TW' : 'en'
    if (target === i18n.locale.value) return

    const path = nuxtApp.$switchLocalePath(target)
    if (path) navigateTo(path, { replace: true })
  })
})
