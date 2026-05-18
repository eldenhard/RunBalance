<script setup lang="ts">
const store = useRunBalanceStore()
</script>

<template>
  <div class="space-y-4 p-4">
    <header class="space-y-1 pt-3">
      <p class="text-sm font-medium text-slate-500">Профиль</p>
      <h1 class="text-2xl font-semibold text-slate-950">{{ store.profile.displayName }}</h1>
    </header>

    <Card class="p-4">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <p class="text-sm text-slate-500">Цель</p>
          <p class="text-xl font-semibold">10 км</p>
        </div>
        <div>
          <p class="text-sm text-slate-500">Макс. пульс</p>
          <p class="text-xl font-semibold">{{ store.profile.maxHeartRate }}</p>
        </div>
      </div>
    </Card>

    <Card class="p-4">
      <h2 class="font-semibold">Пульсовые зоны</h2>
      <div class="mt-3 space-y-2">
        <div v-for="zone in store.profile.zones" :key="zone.id" class="flex justify-between rounded-md bg-slate-50 p-3 text-sm">
          <span class="font-medium">{{ zone.name }}</span>
          <span class="text-slate-500">{{ zone.minBpm }}–{{ zone.maxBpm }}</span>
        </div>
      </div>
    </Card>

    <NuxtLink to="/shoes">
      <Button class="w-full" variant="outline">Открыть кроссовки</Button>
    </NuxtLink>
  </div>
</template>

