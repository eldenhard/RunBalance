<script setup lang="ts">
import { Footprints, MapPinned } from '@lucide/vue'

const store = useRunBalanceStore()
const workout = computed(() => store.currentWorkout)
</script>

<template>
  <div class="theme-light space-y-4 p-4">
    <ScreenHeader eyebrow="Результат" title="Пробежка сохранена локально" />

    <Card class="p-4">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <p class="text-sm text-[#767676]">Дистанция</p>
          <p class="text-3xl font-medium">{{ formatDistance(workout.distanceKm) }}</p>
        </div>
        <div>
          <p class="text-sm text-[#767676]">Время</p>
          <p class="text-3xl font-medium">{{ formatDuration(workout.durationSec) }}</p>
        </div>
        <div>
          <p class="text-sm text-[#767676]">Средний темп</p>
          <p class="text-2xl font-medium">{{ formatPace(workout.avgPaceSecPerKm) }}</p>
        </div>
        <div>
          <p class="text-sm text-[#767676]">Пульс</p>
          <p class="text-2xl font-medium">—</p>
        </div>
      </div>
    </Card>

    <Card class="p-4">
      <div class="flex items-center gap-3">
        <MapPinned class="h-5 w-5 text-slate-500" />
        <div>
          <h2 class="font-medium">{{ store.route.name }}</h2>
          <p class="text-sm text-[#767676]">Карта маршрута будет подключена через MapLibre.</p>
        </div>
      </div>
      <div class="mt-4 h-32 rounded-2xl bg-[#f0f0ed]" />
    </Card>

    <Card class="p-4">
      <div class="flex items-center gap-3">
        <Footprints class="h-5 w-5 text-slate-500" />
        <div>
          <h2 class="font-medium">{{ store.selectedShoe?.name }}</h2>
          <p class="text-sm text-[#767676]">+{{ workout.distanceKm?.toFixed(1) }} км к ресурсу пары</p>
        </div>
      </div>
    </Card>
  </div>
</template>
