<script setup lang="ts">
import { Footprints, Map, Play, Radio } from '@lucide/vue'

const store = useRunBalanceStore()
</script>

<template>
  <div class="theme-dark min-h-dvh space-y-4 p-4 dark">
    <ScreenHeader eyebrow="Готово к старту" title="Лёгкий бег" description="Минимум отвлечений перед началом тренировки." />

    <Card class="p-4">
      <div class="flex items-center gap-3">
        <Play class="h-5 w-5 text-slate-500" />
        <div>
          <h2 class="font-medium">{{ store.adaptedWorkout.title }}</h2>
          <p class="text-sm text-[#9b9b9b]">{{ store.adaptedWorkout.plannedDistanceKm }} км · {{ store.adaptedWorkout.plannedDurationMin }} мин · {{ store.adaptedWorkout.targetZoneId?.toUpperCase() }}</p>
        </div>
      </div>
    </Card>

    <Card class="p-4">
      <div class="flex items-center gap-3">
        <Map class="h-5 w-5 text-slate-500" />
        <div>
          <h2 class="font-semibold">{{ store.route.name }}</h2>
          <p class="text-sm text-[#9b9b9b]">Мок-маршрут для Phase 2, реальная генерация позже.</p>
        </div>
      </div>
    </Card>

    <Card class="p-4">
      <div class="flex items-center gap-3">
        <Footprints class="h-5 w-5 text-slate-500" />
        <div>
          <h2 class="font-semibold">{{ store.selectedShoe?.name }}</h2>
          <p class="text-sm text-[#9b9b9b]">{{ store.selectedShoe?.brand }} {{ store.selectedShoe?.model }}</p>
        </div>
      </div>
    </Card>

    <Card class="border-slate-300 p-4">
      <div class="flex gap-3">
        <Radio class="mt-0.5 h-5 w-5 text-[#9b9b9b]" />
        <div>
          <h2 class="font-medium">Пульсометр позже</h2>
          <p class="mt-1 text-sm leading-5 text-[#b8b8b8]">{{ store.heartRateSource.message }}</p>
        </div>
      </div>
    </Card>

    <div class="grid grid-cols-2 gap-3">
      <NuxtLink to="/workout/active">
        <Button class="w-full" size="lg">Старт</Button>
      </NuxtLink>
      <Button class="w-full" size="lg" variant="outline">Свободный бег</Button>
    </div>
  </div>
</template>
