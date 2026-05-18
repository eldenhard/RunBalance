<script setup lang="ts">
import { Activity, MapPinned, Play, ShieldCheck } from '@lucide/vue'

const store = useRunBalanceStore()
</script>

<template>
  <div class="space-y-4 p-4">
    <header class="space-y-1 pt-3">
      <p class="text-sm font-medium text-slate-500">Сегодня</p>
      <h1 class="text-2xl font-semibold tracking-normal text-slate-950">Спокойная нагрузка</h1>
    </header>

    <Card class="p-4">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-sm text-slate-500">Готовность</p>
          <div class="mt-1 text-4xl font-semibold text-slate-950">{{ store.recovery.readinessScore }}</div>
        </div>
        <Badge variant="success">можно бежать</Badge>
      </div>
      <Progress class="mt-4" :value="store.recovery.readinessScore" />
      <p class="mt-3 text-sm leading-5 text-slate-600">
        Сон и стресс в норме, есть лёгкая крепатура. Лучше держать тренировку в лёгкой зоне.
      </p>
    </Card>

    <Card class="p-4">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <p class="text-sm text-slate-500">Тренировка дня</p>
          <h2 class="text-xl font-semibold text-slate-950">{{ store.workoutOfTheDay.title }}</h2>
        </div>
        <Activity class="h-6 w-6 text-slate-400" />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-md bg-slate-50 p-3">
          <p class="text-xs text-slate-500">Дистанция</p>
          <p class="text-lg font-semibold">{{ store.workoutOfTheDay.plannedDistanceKm }} км</p>
        </div>
        <div class="rounded-md bg-slate-50 p-3">
          <p class="text-xs text-slate-500">Время</p>
          <p class="text-lg font-semibold">{{ store.workoutOfTheDay.plannedDurationMin }} мин</p>
        </div>
        <div class="rounded-md bg-slate-50 p-3">
          <p class="text-xs text-slate-500">Зона</p>
          <p class="text-lg font-semibold">{{ store.targetZone?.name }}</p>
        </div>
        <div class="rounded-md bg-slate-50 p-3">
          <p class="text-xs text-slate-500">Кроссовки</p>
          <p class="truncate text-lg font-semibold">{{ store.selectedShoe?.name }}</p>
        </div>
      </div>
    </Card>

    <Card class="p-4">
      <div class="flex items-center gap-3">
        <MapPinned class="h-5 w-5 text-slate-500" />
        <div class="min-w-0 flex-1">
          <h2 class="font-semibold text-slate-950">{{ store.route.name }}</h2>
          <p class="text-sm text-slate-500">{{ store.route.distanceKm }} км · {{ store.route.surface }} · {{ store.route.elevationHint }}</p>
        </div>
      </div>
    </Card>

    <Card class="border-amber-200 bg-amber-50 p-4">
      <div class="flex gap-3">
        <ShieldCheck class="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
        <p class="text-sm leading-5 text-amber-900">
          Live-пульс недоступен в iOS Safari PWA. В этой версии тренировка работает без пульсометра, позже добавим Capacitor BLE для Polar H10.
        </p>
      </div>
    </Card>

    <NuxtLink to="/start">
      <Button class="w-full" size="lg">
        <Play class="h-5 w-5" />
        Начать тренировку
      </Button>
    </NuxtLink>
  </div>
</template>

