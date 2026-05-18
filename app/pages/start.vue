<script setup lang="ts">
import { Footprints, Map, Play, Radio } from '@lucide/vue'

const store = useRunBalanceStore()
const router = useRouter()

async function startWorkout() {
  store.startWorkoutSession()
  await router.push('/workout/active')
}
</script>

<template>
  <div class="theme-dark min-h-dvh space-y-4 p-4">
    <ScreenHeader
      eyebrow="Готово к старту"
      :title="store.adaptedWorkout.title"
      description="Проверь маршрут, обувь и начинай без лишних отвлечений."
    />

    <Card class="p-4">
      <div class="grid grid-cols-2 gap-4 border-b border-[var(--screen-border)] pb-4">
        <div>
          <p class="text-xs text-[var(--screen-muted)]">Дистанция</p>
          <p class="mt-1 text-[38px] font-medium leading-none">{{ store.adaptedWorkout.plannedDistanceKm }}</p>
          <p class="mt-1 text-xs text-[var(--screen-muted)]">км</p>
        </div>
        <div>
          <p class="text-xs text-[var(--screen-muted)]">Время</p>
          <p class="mt-1 text-[38px] font-medium leading-none">{{ store.adaptedWorkout.plannedDurationMin }}</p>
          <p class="mt-1 text-xs text-[var(--screen-muted)]">мин</p>
        </div>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-3">
        <MetricTile label="Зона" :value="store.adaptedWorkout.targetZoneId?.toUpperCase() ?? '—'" dark />
        <MetricTile label="Готовность" :value="store.recovery.readinessScore" dark />
      </div>
    </Card>

    <Card class="p-4">
      <div class="flex items-center gap-3">
        <Map class="h-5 w-5 text-[var(--screen-muted)]" />
        <div>
          <h2 class="font-medium">{{ store.route.name }}</h2>
          <p class="text-sm text-[var(--screen-muted)]">{{ store.route.distanceKm }} км · {{ store.route.elevationHint }}</p>
        </div>
      </div>
    </Card>

    <Card class="p-4">
      <div class="flex items-center gap-3">
        <Footprints class="h-5 w-5 text-[var(--screen-muted)]" />
        <div>
          <h2 class="font-medium">{{ store.selectedShoe?.name }}</h2>
          <p class="text-sm text-[var(--screen-muted)]">{{ store.selectedShoe?.brand }} {{ store.selectedShoe?.model }}</p>
        </div>
      </div>
    </Card>

    <Card class="p-4">
      <div class="flex gap-3">
        <Radio class="mt-0.5 h-5 w-5 text-[var(--screen-muted)]" />
        <div>
          <h2 class="font-medium">Пульсометр позже</h2>
          <p class="mt-1 text-sm leading-5 text-[var(--screen-muted)]">Пока тренировка идёт по GPS, времени и темпу. Polar H10 добавим через Capacitor BLE.</p>
        </div>
      </div>
    </Card>

    <div class="grid grid-cols-[1fr_84px_1fr] items-center gap-3 pt-2">
      <NuxtLink to="/plan" class="block">
        <Button class="w-full" size="lg" variant="outline">План</Button>
      </NuxtLink>
      <button class="mx-auto flex h-[84px] w-[84px] items-center justify-center rounded-full bg-white text-[#0b0b0c] active:bg-[#e8e8e8]" aria-label="Старт тренировки" @click="startWorkout">
        <Play class="h-8 w-8 fill-current" />
      </button>
      <Button class="w-full" size="lg" variant="outline" @click="startWorkout">Свободный</Button>
    </div>
  </div>
</template>
