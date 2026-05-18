<script setup lang="ts">
const store = useRunBalanceStore()

onMounted(async () => {
  store.restoreLocalState()
  store.restorePersistedActiveSession()
  await new Promise((resolve) => window.setTimeout(resolve, 300))
  window.dispatchEvent(new Event('runbalance:ready'))
})
</script>

<template>
  <AppShell>
    <NuxtPage />
  </AppShell>
</template>
