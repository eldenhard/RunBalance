<script setup lang="ts">
const store = useRunBalanceStore()
</script>

<template>
  <div class="space-y-4 p-4">
    <header class="space-y-1 pt-3">
      <p class="text-sm font-medium text-slate-500">История</p>
      <h1 class="text-2xl font-semibold text-slate-950">Последние пробежки</h1>
    </header>

    <Card v-for="workout in store.history" :key="workout.id" class="p-4">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2 class="font-semibold">{{ workout.title }}</h2>
          <p class="text-sm text-slate-500">{{ formatDistance(workout.distanceKm) }} · {{ formatDuration(workout.durationSec) }} · {{ formatPace(workout.avgPaceSecPerKm) }}</p>
        </div>
        <Badge variant="secondary">{{ workout.type }}</Badge>
      </div>
    </Card>
  </div>
</template>

