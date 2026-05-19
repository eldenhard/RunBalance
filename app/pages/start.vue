<script setup lang="ts">
import { Maximize2, Play, X } from '@lucide/vue'

const store = useRunBalanceStore()
const router = useRouter()
const voice = useVoiceAlerts()
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
  voice.prime()
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
  voice.announceEvent('Тренировка началась', { vibrate: false })
  await wait(520)
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
          :current-point="currentPoint"
          theme="light"
          interactive
          :show-status-hint="false"
          :show-attribution="false"
          class="absolute inset-0 h-full w-full rounded-none"
        />
      </ClientOnly>
      <div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/80 via-white/5 to-[#f7fff0]/72" />
      <div class="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#f7fff0] via-[#f7fff0]/72 to-transparent" />

      <div class="pointer-events-none relative z-10 flex h-full flex-col justify-between p-4">
        <div class="space-y-4 pt-2">
          <div class="pointer-events-auto flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-sm font-medium text-[#4b4b48]">Готово к старту</p>
              <h1 class="mt-1 truncate text-[38px] font-medium leading-none text-[#101010]">{{ hasPlan ? store.adaptedWorkout.title : 'Свободный бег' }}</h1>
            </div>
            <button
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/80 text-[#101010] shadow-[0_12px_30px_rgba(0,0,0,0.1)] backdrop-blur active:bg-white"
              aria-label="Развернуть карту"
              @click="isMapExpanded = true"
            >
              <Maximize2 class="h-5 w-5" />
            </button>
          </div>

          <div class="grid grid-cols-4 gap-2 rounded-[28px] border border-white/70 bg-white/82 p-3 text-[#111111] shadow-[0_18px_44px_rgba(0,0,0,0.12)] backdrop-blur-md">
            <div>
              <p class="text-[11px] text-[#696966]">Км</p>
              <p class="mt-1 text-xl font-medium">{{ hasPlan ? store.adaptedWorkout.plannedDistanceKm ?? '—' : '—' }}</p>
            </div>
            <div>
              <p class="text-[11px] text-[#696966]">Мин</p>
              <p class="mt-1 text-xl font-medium">{{ hasPlan ? store.adaptedWorkout.plannedDurationMin ?? '—' : '—' }}</p>
            </div>
            <div>
              <p class="text-[11px] text-[#696966]">Зона</p>
              <p class="mt-1 text-xl font-medium">{{ store.adaptedWorkout.targetZoneId?.toUpperCase() ?? '—' }}</p>
            </div>
            <div>
              <p class="text-[11px] text-[#696966]">Готов.</p>
              <p class="mt-1 text-xl font-medium">{{ store.readinessScore }}</p>
            </div>
          </div>
        </div>

        <div class="pointer-events-auto pb-2">
          <div class="grid grid-cols-[1fr_104px_1fr] items-end gap-3">
            <NuxtLink to="/plan" class="block">
              <Button class="h-14 w-full rounded-[22px] border-[#b9ff38] bg-[#b9ff38] text-[#101010] shadow-[0_14px_34px_rgba(107,145,18,0.2)] active:bg-[#a9f424]" size="lg">План</Button>
            </NuxtLink>
            <button
              class="mx-auto flex h-[104px] w-[104px] items-center justify-center rounded-full bg-white text-[#0b0b0c] shadow-[0_0_0_10px_rgba(185,255,56,0.24),0_20px_58px_rgba(0,0,0,0.2)] active:bg-[#f1f1ee] disabled:opacity-60"
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
            :current-point="currentPoint"
            theme="light"
            interactive
            :show-status-hint="false"
            :show-attribution="false"
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
      <div v-if="isCountingDown" class="fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden bg-[#080909] text-white">
        <div class="countdown-orbit countdown-orbit--one" />
        <div class="countdown-orbit countdown-orbit--two" />
        <div class="relative flex flex-col items-center">
          <p class="mb-6 text-sm font-medium uppercase tracking-[0.22em] text-[#b9ff38]">Старт через</p>
          <div class="countdown-ring flex h-52 w-52 items-center justify-center rounded-full">
          <Transition name="countdown-number" mode="out-in">
            <span :key="countdownValue ?? 'idle'" class="text-[96px] font-medium leading-none">{{ countdownValue }}</span>
          </Transition>
          </div>
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
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.countdown-enter-from,
.countdown-leave-to {
  opacity: 0;
  transform: scale(0.88);
}

.countdown-number-enter-active,
.countdown-number-leave-active {
  transition: opacity 0.2s ease, transform 0.34s cubic-bezier(0.2, 0.95, 0.2, 1.12);
}

.countdown-number-enter-from {
  opacity: 0;
  transform: scale(0.38) rotate(-6deg);
}

.countdown-number-leave-to {
  opacity: 0;
  transform: scale(1.48) rotate(4deg);
}

.countdown-ring {
  position: relative;
  background:
    radial-gradient(circle, rgba(255, 255, 255, 0.1) 0 47%, transparent 48%),
    conic-gradient(from 210deg, #b9ff38, #64c7ff, #ff7a2b, #b9ff38);
  box-shadow: 0 0 64px rgba(185, 255, 56, 0.22);
}

.countdown-ring::before {
  content: "";
  position: absolute;
  inset: 11px;
  border-radius: inherit;
  background: #080909;
}

.countdown-ring span {
  position: relative;
  z-index: 1;
}

.countdown-orbit {
  position: absolute;
  border-radius: 999px;
  filter: blur(2px);
  opacity: 0.22;
}

.countdown-orbit--one {
  --countdown-x: -92px;
  --countdown-y: -120px;
  width: 280px;
  height: 280px;
  background: #b9ff38;
  transform: translate(var(--countdown-x), var(--countdown-y));
  animation: countdown-pulse 1.1s ease-in-out infinite;
}

.countdown-orbit--two {
  --countdown-x: 104px;
  --countdown-y: 118px;
  width: 230px;
  height: 230px;
  background: #64c7ff;
  transform: translate(var(--countdown-x), var(--countdown-y));
  animation: countdown-pulse 1.1s ease-in-out infinite 0.18s;
}

@keyframes countdown-pulse {
  0%,
  100% {
    transform: translate(var(--countdown-x), var(--countdown-y)) scale(0.95);
    opacity: 0.16;
  }
  50% {
    transform: translate(var(--countdown-x), var(--countdown-y)) scale(1.08);
    opacity: 0.3;
  }
}
</style>
