<script setup lang="ts">
const store = useRunBalanceStore()
const showSplash = ref(true)

onMounted(async () => {
  store.restoreLocalState()
  store.restorePersistedActiveSession()
  const minDelay = new Promise((resolve) => window.setTimeout(resolve, 900))
  await Promise.all([minDelay])
  showSplash.value = false
})
</script>

<template>
  <AppShell>
    <NuxtPage />
  </AppShell>
  <AppSplash :show="showSplash" />
</template>
