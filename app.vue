<script setup lang="ts">
const store = useRunBalanceStore()

onMounted(() => {
  store.restoreLocalState()
  store.restorePersistedActiveSession()
})
</script>

<template>
  <AppShell>
    <NuxtPage />
  </AppShell>
</template>
