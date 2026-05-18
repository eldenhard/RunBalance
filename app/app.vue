<script setup lang="ts">
import AppShell from '~/components/layout/AppShell.vue'

const store = useRunBalanceStore()
const appReady = ref(false)

onMounted(async () => {
  const startedAt = performance.now()
  store.restoreLocalState()
  store.restorePersistedActiveSession()
  const elapsed = performance.now() - startedAt
  await new Promise((resolve) => window.setTimeout(resolve, Math.max(0, 1100 - elapsed)))
  appReady.value = true
  window.dispatchEvent(new Event('runbalance:ready'))
})
</script>

<template>
  <Transition name="rb-splash">
    <div v-if="!appReady" id="rb-splash" aria-hidden="true">
      <div class="rb-splash__ring" />
      <p class="rb-splash__title">RunBalance</p>
      <p class="rb-splash__subtitle">собираем твой день...</p>
    </div>
  </Transition>
  <AppShell>
    <NuxtPage />
  </AppShell>
</template>

<style scoped>
#rb-splash {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #0b0b0c;
  color: #ffffff;
  font-family: "Helvetica Neue", Arial, sans-serif;
}

.rb-splash__ring {
  width: 72px;
  height: 72px;
  border-radius: 9999px;
  border: 2px solid rgba(255, 255, 255, 0.18);
  border-top-color: #ffffff;
  animation: rb-spin 1.1s linear infinite;
}

.rb-splash__title {
  margin: 8px 0 0;
  font-size: 17px;
  font-weight: 500;
  letter-spacing: 0;
}

.rb-splash__subtitle {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
}

.rb-splash-leave-active {
  transition: opacity 0.35s ease;
}

.rb-splash-leave-to {
  opacity: 0;
}

@keyframes rb-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
