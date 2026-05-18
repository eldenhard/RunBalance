export default defineNuxtPlugin(() => {
  if (!('serviceWorker' in navigator)) return

  let reloading = false

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return
    reloading = true
    window.location.reload()
  })

  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistration().then((registration) => {
      registration?.update()
    }).catch(() => {
      // PWA update checks are best-effort; the app must still open normally.
    })
  })
})
