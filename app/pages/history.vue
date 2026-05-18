<script setup lang="ts">
const store = useRunBalanceStore()
</script>

<template>
  <div class="theme-light space-y-4 p-4">
    <ScreenHeader eyebrow="История" title="Последние пробежки" />

    <div v-if="store.history.length" class="space-y-4">
      <Card v-for="workout in store.history" :key="workout.id" class="p-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="font-medium">{{ workout.title }}</h2>
            <p class="text-sm text-[#767676]">{{ formatDistance(workout.distanceKm) }} · {{ formatDuration(workout.durationSec) }} · {{ formatPace(workout.avgPaceSecPerKm) }}</p>
          </div>
          <Badge variant="secondary">{{ workout.type }}</Badge>
        </div>
      </Card>
    </div>

    <Card v-else class="p-4 text-sm text-[#767676]">
      История пока пустая. После первой завершённой тренировки результаты появятся здесь.
    </Card>
  </div>
</template>
