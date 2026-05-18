<script setup lang="ts">
const store = useRunBalanceStore()
const appReady = ref(false)

onMounted(async () => {
  store.restoreLocalState()
  store.restorePersistedActiveSession()
  await new Promise((resolve) => window.setTimeout(resolve, 300))
  appReady.value = true
  window.dispatchEvent(new Event('runbalance:ready'))
})
</script>

<template>
  <ClientOnly>
    <AppShell v-if="appReady">
      <NuxtPage />
    </AppShell>
    <template #fallback>
      <div class="min-h-dvh bg-[#0b0b0c]" />
    </template>
  </ClientOnly>
</template>
