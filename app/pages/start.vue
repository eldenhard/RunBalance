<script setup lang="ts">
import { Footprints, Map, Play, Radio, Route } from '@lucide/vue'

const store = useRunBalanceStore()
const router = useRouter()
const hasPlan = computed(() => store.plannedWorkouts.length > 0)
const countdownValue = ref<number | null>(null)
const isCountingDown = computed(() => countdownValue.value !== null)
let countdownTimer: ReturnType<typeof window.setTimeout> | null = null

async function startWorkout() {
  await startWithCountdown(hasPlan.value ? 'planned' : 'free')
}

async function startFreeWorkout() {
  await startWithCountdown('free')
}

async function startWithCountdown(mode: 'planned' | 'free') {
  if (isCountingDown.value) return

  await runCountdown()

  if (mode === 'planned') {
    store.startWorkoutSession()
  } else {
    store.startFreeWorkoutSession()
  }
  await router.push('/workout/active')
}

async function runCountdown() {
  for (const value of [3, 2, 1]) {
    countdownValue.value = value
    window.navigator.vibrate?.(35)
    await wait(820)
  }
  countdownValue.value = null
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    countdownTimer = window.setTimeout(resolve, ms)
  })
}

onBeforeUnmount(() => {
  if (countdownTimer) window.clearTimeout(countdownTimer)
})
</script>

<template>
  <div class="theme-dark min-h-dvh space-y-3 p-4">
    <ScreenHeader
      eyebrow="Готово к старту"
      :title="hasPlan ? store.adaptedWorkout.title : 'Свободный бег'"
      :description="hasPlan ? 'Маршрут и обувь готовы.' : 'Свободная GPS-запись.'"
    />

    <Card class="p-3">
      <div class="grid grid-cols-2 gap-3 border-b border-[var(--screen-border)] pb-3">
        <div>
          <p class="text-xs text-[var(--screen-muted)]">Дистанция</p>
          <p class="mt-1 text-[30px] font-medium leading-none">{{ hasPlan ? store.adaptedWorkout.plannedDistanceKm ?? '—' : '—' }}</p>
          <p class="mt-1 text-xs text-[var(--screen-muted)]">км</p>
        </div>
        <div>
          <p class="text-xs text-[var(--screen-muted)]">Время</p>
          <p class="mt-1 text-[30px] font-medium leading-none">{{ hasPlan ? store.adaptedWorkout.plannedDurationMin ?? '—' : '—' }}</p>
          <p class="mt-1 text-xs text-[var(--screen-muted)]">мин</p>
        </div>
      </div>

      <div class="mt-3 grid grid-cols-2 gap-3">
        <MetricTile label="Зона" :value="store.adaptedWorkout.targetZoneId?.toUpperCase() ?? '—'" dark />
        <MetricTile label="Готовность" :value="store.readinessScore" dark />
      </div>
    </Card>

    <Card class="p-3">
      <div class="grid grid-cols-3 gap-2">
        <NuxtLink to="/routes" class="rounded-2xl border border-[var(--screen-border)] p-3 active:bg-white/5">
          <Map class="h-5 w-5 text-[#b9ff38]" />
          <p class="mt-2 truncate text-xs text-[var(--screen-muted)]">Маршрут</p>
          <p class="truncate text-sm font-medium">{{ store.activeRoute?.name ?? 'Без маршрута' }}</p>
        </NuxtLink>
        <NuxtLink to="/shoes" class="rounded-2xl border border-[var(--screen-border)] p-3 active:bg-white/5">
          <Footprints class="h-5 w-5 text-[#75c7ff]" />
          <p class="mt-2 truncate text-xs text-[var(--screen-muted)]">Обувь</p>
          <p class="truncate text-sm font-medium">{{ store.selectedShoe?.name ?? 'Не указана' }}</p>
        </NuxtLink>
        <div class="rounded-2xl border border-[var(--screen-border)] p-3">
          <Radio class="h-5 w-5 text-[#ff7a2b]" />
          <p class="mt-2 truncate text-xs text-[var(--screen-muted)]">Датчики</p>
          <p class="truncate text-sm font-medium">GPS</p>
        </div>
      </div>
    </Card>

    <Card v-if="store.activeRoute" class="overflow-hidden p-0">
      <ClientOnly>
        <RouteMap :route="store.activeRoute" theme="dark" decorative-fallback class="h-24 w-full" />
      </ClientOnly>
      <div class="flex items-center gap-3 p-3">
        <Route class="h-5 w-5 text-[var(--screen-muted)]" />
        <div class="min-w-0 flex-1">
          <h2 class="truncate font-medium">{{ store.activeRoute.name }}</h2>
          <p class="truncate text-sm text-[var(--screen-muted)]">{{ store.activeRoute.distanceKm }} км · {{ store.activeRoute.elevationHint }}</p>
        </div>
      </div>
    </Card>

    <div class="sticky bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))] z-20 grid grid-cols-[1fr_84px_1fr] items-center gap-3 rounded-[28px] bg-[#0b0b0c]/90 pt-2 backdrop-blur">
      <NuxtLink to="/plan" class="block">
        <Button class="w-full" size="lg" variant="outline">План</Button>
      </NuxtLink>
      <button
        class="mx-auto flex h-[84px] w-[84px] items-center justify-center rounded-full bg-white text-[#0b0b0c] active:bg-[#e8e8e8] disabled:opacity-60"
        aria-label="Старт тренировки"
        :disabled="isCountingDown"
        @click="startWorkout"
      >
        <Play class="h-8 w-8 fill-current" />
      </button>
      <Button class="w-full" size="lg" variant="outline" :disabled="isCountingDown" @click="startFreeWorkout">Свободный</Button>
    </div>

    <Transition name="countdown">
      <div v-if="isCountingDown" class="fixed inset-0 z-[10000] flex items-center justify-center bg-[#0b0b0c] text-white">
        <div class="flex h-44 w-44 items-center justify-center rounded-full border border-white/15 bg-white/[0.03]">
          <span class="text-[96px] font-medium leading-none">{{ countdownValue }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.countdown-enter-active,
.countdown-leave-active {
  transition: opacity 0.18s ease;
}

.countdown-enter-from,
.countdown-leave-to {
  opacity: 0;
}
</style>
