export default defineNuxtPlugin(() => {
  const minVisibleMs = 1200
  const startedAt = performance.now()
  let hidden = false

  const hideSplash = () => {
    if (hidden) return
    hidden = true
    const splash = document.getElementById('rb-splash')
    if (!splash) return
    splash.classList.add('rb-splash--hide')
    window.setTimeout(() => splash.remove(), 400)
  }

  const scheduleHide = () => {
    const elapsed = performance.now() - startedAt
    const remaining = Math.max(0, minVisibleMs - elapsed)
    window.setTimeout(hideSplash, remaining)
  }

  window.addEventListener('runbalance:ready', scheduleHide, { once: true })

  window.setTimeout(() => {
    if (!hidden) scheduleHide()
  }, 3500)
})
