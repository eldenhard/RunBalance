<script setup lang="ts">
import { Footprints, Map, Play, Radio } from '@lucide/vue'

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
  <div class="theme-dark min-h-dvh space-y-4 p-4">
    <ScreenHeader
      eyebrow="Готово к старту"
      :title="hasPlan ? store.adaptedWorkout.title : 'Свободный бег'"
      :description="hasPlan ? 'Маршрут, обувь и старт.' : 'Можно стартовать сразу.'"
    />

    <Card class="p-4">
      <div class="grid grid-cols-2 gap-4 border-b border-[var(--screen-border)] pb-4">
        <div>
          <p class="text-xs text-[var(--screen-muted)]">Дистанция</p>
          <p class="mt-1 text-[38px] font-medium leading-none">{{ hasPlan ? store.adaptedWorkout.plannedDistanceKm ?? '—' : '—' }}</p>
          <p class="mt-1 text-xs text-[var(--screen-muted)]">км</p>
        </div>
        <div>
          <p class="text-xs text-[var(--screen-muted)]">Время</p>
          <p class="mt-1 text-[38px] font-medium leading-none">{{ hasPlan ? store.adaptedWorkout.plannedDurationMin ?? '—' : '—' }}</p>
          <p class="mt-1 text-xs text-[var(--screen-muted)]">мин</p>
        </div>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-3">
        <MetricTile label="Зона" :value="store.adaptedWorkout.targetZoneId?.toUpperCase() ?? '—'" dark />
        <MetricTile label="Готовность" :value="store.readinessScore" dark />
      </div>
    </Card>

    <Card v-if="store.activeRoute" class="overflow-hidden p-0">
      <ClientOnly>
        <RouteMap :route="store.activeRoute" theme="dark" class="h-40 w-full" />
      </ClientOnly>
      <div class="flex items-start gap-3 p-4">
        <Map class="mt-0.5 h-5 w-5 text-[var(--screen-muted)]" />
        <div class="flex-1">
          <h2 class="font-medium">{{ store.activeRoute.name }}</h2>
          <p class="text-sm text-[var(--screen-muted)]">{{ store.activeRoute.distanceKm }} км · {{ store.activeRoute.elevationHint }}</p>
        </div>
        <NuxtLink to="/routes" class="text-xs font-medium text-[var(--screen-muted)] underline-offset-2 hover:underline">
          Сменить
        </NuxtLink>
      </div>
    </Card>

    <NuxtLink v-else to="/routes" class="block">
      <Card class="p-4">
        <div class="flex items-start gap-3">
          <Map class="mt-0.5 h-5 w-5 text-[var(--screen-muted)]" />
          <div class="flex-1">
            <h2 class="font-medium">Маршрут не выбран</h2>
            <p class="text-sm text-[var(--screen-muted)]">Можно стартовать без маршрута — трек запишется по GPS.</p>
          </div>
        </div>
      </Card>
    </NuxtLink>

    <Card v-if="store.selectedShoe" class="p-4">
      <div class="flex items-center gap-3">
        <Footprints class="h-5 w-5 text-[var(--screen-muted)]" />
        <div>
          <h2 class="font-medium">{{ store.selectedShoe.name }}</h2>
          <p class="text-sm text-[var(--screen-muted)]">{{ store.selectedShoe.brand }} {{ store.selectedShoe.model }}</p>
        </div>
      </div>
    </Card>

    <NuxtLink v-else to="/shoes" class="block">
      <Card class="p-4">
        <div class="flex items-center gap-3">
          <Footprints class="h-5 w-5 text-[var(--screen-muted)]" />
          <div>
            <h2 class="font-medium">Кроссовки не указаны</h2>
            <p class="text-sm text-[var(--screen-muted)]">Добавь пару — будем считать ресурс автоматически.</p>
          </div>
        </div>
      </Card>
    </NuxtLink>

    <Card class="p-4">
      <div class="flex gap-3">
        <Radio class="mt-0.5 h-5 w-5 text-[var(--screen-muted)]" />
        <div>
          <h2 class="font-medium">Пульсометр позже</h2>
          <p class="mt-1 text-sm text-[var(--screen-muted)]">Сейчас тренировка идёт по GPS, времени и темпу.</p>
        </div>
      </div>
    </Card>

    <div class="grid grid-cols-[1fr_84px_1fr] items-center gap-3 pt-2">
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
