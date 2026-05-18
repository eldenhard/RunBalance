<script setup lang="ts">
import { Footprints, MapPinned } from '@lucide/vue'

const store = useRunBalanceStore()
const workout = computed(() => store.currentWorkout)
</script>

<template>
  <div class="space-y-4 p-4">
    <header class="space-y-1 pt-3">
      <p class="text-sm font-medium text-slate-500">Результат</p>
      <h1 class="text-2xl font-semibold text-slate-950">Пробежка сохранена локально</h1>
    </header>

    <Card class="p-4">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <p class="text-sm text-slate-500">Дистанция</p>
          <p class="text-3xl font-semibold">{{ formatDistance(workout.distanceKm) }}</p>
        </div>
        <div>
          <p class="text-sm text-slate-500">Время</p>
          <p class="text-3xl font-semibold">{{ formatDuration(workout.durationSec) }}</p>
        </div>
        <div>
          <p class="text-sm text-slate-500">Средний темп</p>
          <p class="text-2xl font-semibold">{{ formatPace(workout.avgPaceSecPerKm) }}</p>
        </div>
        <div>
          <p class="text-sm text-slate-500">Пульс</p>
          <p class="text-2xl font-semibold">—</p>
        </div>
      </div>
    </Card>

    <Card class="p-4">
      <div class="flex items-center gap-3">
        <MapPinned class="h-5 w-5 text-slate-500" />
        <div>
          <h2 class="font-semibold">{{ store.route.name }}</h2>
          <p class="text-sm text-slate-500">Карта маршрута будет подключена через MapLibre.</p>
        </div>
      </div>
      <div class="mt-4 h-32 rounded-md bg-slate-100" />
    </Card>

    <Card class="p-4">
      <div class="flex items-center gap-3">
        <Footprints class="h-5 w-5 text-slate-500" />
        <div>
          <h2 class="font-semibold">{{ store.selectedShoe?.name }}</h2>
          <p class="text-sm text-slate-500">+{{ workout.distanceKm?.toFixed(1) }} км к ресурсу пары</p>
        </div>
      </div>
    </Card>
  </div>
</template>

