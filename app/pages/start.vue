<script setup lang="ts">
import { Footprints, Map, Play, Radio } from '@lucide/vue'

const store = useRunBalanceStore()
</script>

<template>
  <div class="space-y-4 p-4">
    <header class="space-y-1 pt-3">
      <p class="text-sm font-medium text-slate-500">Старт</p>
      <h1 class="text-2xl font-semibold text-slate-950">Подготовка к пробежке</h1>
    </header>

    <Card class="p-4">
      <div class="flex items-center gap-3">
        <Play class="h-5 w-5 text-slate-500" />
        <div>
          <h2 class="font-semibold">{{ store.workoutOfTheDay.title }}</h2>
          <p class="text-sm text-slate-500">{{ store.workoutOfTheDay.plannedDistanceKm }} км · {{ store.workoutOfTheDay.plannedDurationMin }} мин · {{ store.targetZone?.name }}</p>
        </div>
      </div>
    </Card>

    <Card class="p-4">
      <div class="flex items-center gap-3">
        <Map class="h-5 w-5 text-slate-500" />
        <div>
          <h2 class="font-semibold">{{ store.route.name }}</h2>
          <p class="text-sm text-slate-500">Мок-маршрут для Phase 1, реальная генерация позже.</p>
        </div>
      </div>
    </Card>

    <Card class="p-4">
      <div class="flex items-center gap-3">
        <Footprints class="h-5 w-5 text-slate-500" />
        <div>
          <h2 class="font-semibold">{{ store.selectedShoe?.name }}</h2>
          <p class="text-sm text-slate-500">{{ store.selectedShoe?.brand }} {{ store.selectedShoe?.model }}</p>
        </div>
      </div>
    </Card>

    <Card class="border-slate-300 p-4">
      <div class="flex gap-3">
        <Radio class="mt-0.5 h-5 w-5 text-slate-500" />
        <div>
          <h2 class="font-semibold">Пульсометр позже</h2>
          <p class="mt-1 text-sm leading-5 text-slate-600">{{ store.heartRateSource.message }}</p>
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

