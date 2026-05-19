<script setup lang="ts">
import { Maximize2, Play, X } from '@lucide/vue'

const store = useRunBalanceStore()
const router = useRouter()
const hasPlan = computed(() => store.plannedWorkouts.length > 0)
const countdownValue = ref<number | null>(null)
const isCountingDown = computed(() => countdownValue.value !== null)
const isMapExpanded = ref(false)
const gps = useGeolocationTracking({
  onPoint: () => {}
})
const currentPoint = computed(() => gps.latestPoint.value ?? null)
let countdownTimer: ReturnType<typeof window.setTimeout> | null = null

async function startWorkout() {
  await startWithCountdown(hasPlan.value ? 'planned' : 'free')
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
  gps.stop()
})

onMounted(() => {
  gps.start()
})
</script>

<template>
  <div class="theme-dark start-tracker-screen p-0">
    <section class="relative h-full overflow-hidden">
      <ClientOnly>
        <RouteMap
          :route="store.activeRoute"
          :current-point="currentPoint"
          theme="dark"
          interactive
          class="absolute inset-0 h-full w-full rounded-none"
        />
      </ClientOnly>
      <div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0b0b0c]/82 via-[#0b0b0c]/20 to-[#0b0b0c]/82" />

      <div class="pointer-events-none relative z-10 flex h-full flex-col justify-between p-4">
        <div class="space-y-4 pt-2">
          <div class="pointer-events-auto flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-sm font-medium text-white/55">Готово к старту</p>
              <h1 class="mt-1 truncate text-[38px] font-medium leading-none text-white">{{ hasPlan ? store.adaptedWorkout.title : 'Свободный бег' }}</h1>
            </div>
            <button
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur active:bg-black/65"
              aria-label="Развернуть карту"
              @click="isMapExpanded = true"
            >
              <Maximize2 class="h-5 w-5" />
            </button>
          </div>

          <div class="grid grid-cols-4 gap-2 rounded-[28px] border border-white/10 bg-black/50 p-3 backdrop-blur">
            <div>
              <p class="text-[11px] text-white/50">Км</p>
              <p class="mt-1 text-xl font-medium">{{ hasPlan ? store.adaptedWorkout.plannedDistanceKm ?? '—' : '—' }}</p>
            </div>
            <div>
              <p class="text-[11px] text-white/50">Мин</p>
              <p class="mt-1 text-xl font-medium">{{ hasPlan ? store.adaptedWorkout.plannedDurationMin ?? '—' : '—' }}</p>
            </div>
            <div>
              <p class="text-[11px] text-white/50">Зона</p>
              <p class="mt-1 text-xl font-medium">{{ store.adaptedWorkout.targetZoneId?.toUpperCase() ?? '—' }}</p>
            </div>
            <div>
              <p class="text-[11px] text-white/50">Готов.</p>
              <p class="mt-1 text-xl font-medium">{{ store.readinessScore }}</p>
            </div>
          </div>
        </div>

        <div class="pointer-events-auto pb-2">
          <div class="grid grid-cols-[1fr_104px_1fr] items-end gap-3">
            <NuxtLink to="/plan" class="block">
              <Button class="h-14 w-full rounded-[22px] border-white/15 bg-black/45 text-white backdrop-blur" size="lg" variant="outline">План</Button>
            </NuxtLink>
            <button
              class="mx-auto flex h-[104px] w-[104px] items-center justify-center rounded-full bg-white text-[#0b0b0c] shadow-[0_18px_54px_rgba(255,255,255,0.24)] active:bg-[#e8e8e8] disabled:opacity-60"
              aria-label="Старт тренировки"
              :disabled="isCountingDown"
              @click="startWorkout"
            >
              <Play class="h-10 w-10 fill-current" />
            </button>
            <div aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>

    <Teleport to="body">
      <div v-if="isMapExpanded" class="fixed inset-0 z-[10001] bg-[#0b0b0c]">
        <ClientOnly>
          <RouteMap
            :route="store.activeRoute"
            :current-point="currentPoint"
            theme="dark"
            interactive
            class="h-full w-full rounded-none"
          />
        </ClientOnly>
        <button
          class="absolute right-4 top-[calc(env(safe-area-inset-top,0px)+16px)] flex h-12 w-12 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur active:bg-black/85"
          aria-label="Закрыть карту"
          @click="isMapExpanded = false"
        >
          <X class="h-6 w-6" />
        </button>
      </div>
    </Teleport>

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
.start-tracker-screen {
  height: calc(100dvh - env(safe-area-inset-top, 0px) - 20px - 5.15rem - env(safe-area-inset-bottom, 0px));
  overflow: hidden;
  overscroll-behavior: none;
}

.countdown-enter-active,
.countdown-leave-active {
  transition: opacity 0.18s ease;
}

.countdown-enter-from,
.countdown-leave-to {
  opacity: 0;
}
</style>
