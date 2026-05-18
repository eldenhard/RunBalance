<script setup lang="ts">
import { Activity, MapPinned, Play, ShieldCheck } from '@lucide/vue'

const store = useRunBalanceStore()
</script>

<template>
  <div class="theme-light space-y-4 p-4">
    <ScreenHeader eyebrow="Сегодня" title="Спокойная нагрузка" description="Решение на день без лишнего шума: нагрузка, зона, маршрут и обувь." />

    <Card class="p-4">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-xs text-[#767676]">Готовность</p>
          <div class="mt-1 text-[44px] font-medium leading-none text-[#111111]">{{ store.recovery.readinessScore }}</div>
        </div>
        <Badge variant="success">можно бежать</Badge>
      </div>
      <Progress class="mt-4" :value="store.recovery.readinessScore" />
      <p class="mt-3 text-sm leading-5 text-[#62625e]">{{ store.recoveryRecommendation.message }}</p>
    </Card>

    <Card class="p-4">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <p class="text-xs text-[#767676]">Тренировка дня</p>
          <h2 class="text-xl font-medium text-[#111111]">{{ store.adaptedWorkout.title }}</h2>
        </div>
        <Activity class="h-6 w-6 text-[#767676]" />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-2xl border border-[#deded9] bg-[#f7f7f5] p-3">
          <p class="text-xs text-[#767676]">Дистанция</p>
          <p class="text-lg font-medium">{{ store.adaptedWorkout.plannedDistanceKm }} км</p>
        </div>
        <div class="rounded-2xl border border-[#deded9] bg-[#f7f7f5] p-3">
          <p class="text-xs text-[#767676]">Время</p>
          <p class="text-lg font-medium">{{ store.adaptedWorkout.plannedDurationMin }} мин</p>
        </div>
        <div class="rounded-2xl border border-[#deded9] bg-[#f7f7f5] p-3">
          <p class="text-xs text-[#767676]">Зона</p>
          <p class="text-lg font-medium">{{ store.adaptedWorkout.targetZoneId?.toUpperCase() }}</p>
        </div>
        <div class="rounded-2xl border border-[#deded9] bg-[#f7f7f5] p-3">
          <p class="text-xs text-[#767676]">Кроссовки</p>
          <p class="truncate text-lg font-medium">{{ store.selectedShoe?.name }}</p>
        </div>
      </div>
      <p class="mt-3 text-sm leading-5 text-[#62625e]">{{ store.adaptedWorkout.adaptationReason }}</p>
    </Card>

    <Card class="p-4">
      <div class="flex items-center gap-3">
        <MapPinned class="h-5 w-5 text-slate-500" />
        <div class="min-w-0 flex-1">
          <h2 class="font-medium text-[#111111]">{{ store.route.name }}</h2>
          <p class="text-sm text-[#767676]">{{ store.route.distanceKm }} км · {{ store.route.surface }} · {{ store.route.elevationHint }}</p>
        </div>
      </div>
    </Card>

    <Card class="border-[#deded9] bg-white p-4">
      <div class="flex gap-3">
        <ShieldCheck class="mt-0.5 h-5 w-5 shrink-0 text-[#767676]" />
        <p class="text-sm leading-5 text-[#62625e]">
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
