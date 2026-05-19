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
      <div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/56 via-white/0 to-[color:color-mix(in_srgb,var(--theme-primary-soft)_72%,transparent)]" />
      <div class="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[var(--theme-primary-soft)] via-[color:color-mix(in_srgb,var(--theme-primary-soft)_62%,transparent)] to-transparent" />

      <div class="pointer-events-none start-content relative z-10 flex h-full flex-col justify-between px-4 pb-4">
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
              <Button class="h-14 w-full rounded-[22px] border-[var(--theme-primary)] bg-[var(--theme-primary)] text-[#101010] shadow-[0_14px_34px_var(--theme-dark-glow)] active:brightness-95" size="lg">План</Button>
            </NuxtLink>
            <button
              class="mx-auto flex h-[104px] w-[104px] items-center justify-center rounded-full bg-white text-[#0b0b0c] shadow-[0_0_0_10px_var(--theme-dark-glow),0_20px_58px_rgba(0,0,0,0.2)] active:bg-[#f1f1ee] disabled:opacity-60"
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

    <Transition name="launch">
      <div v-if="isCountingDown" class="launch-overlay fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden bg-[#070808] text-white">
        <div class="launch-grid" />
        <div class="launch-streak launch-streak--one" />
        <div class="launch-streak launch-streak--two" />
        <div class="launch-streak launch-streak--three" />
        <div class="launch-panel">
          <p class="launch-eyebrow">RunBalance</p>
          <Transition name="countdown-number" mode="out-in">
            <span :key="countdownValue ?? 'idle'" class="launch-number">{{ countdownValue }}</span>
          </Transition>
          <div class="launch-progress" aria-hidden="true">
            <span :class="countdownValue === 3 ? 'is-active' : ''" />
            <span :class="countdownValue === 2 ? 'is-active' : ''" />
            <span :class="countdownValue === 1 ? 'is-active' : ''" />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.start-tracker-screen {
  height: calc(100dvh - 5.15rem - env(safe-area-inset-bottom, 0px));
  overflow: hidden;
  overscroll-behavior: none;
}

.start-content {
  padding-top: calc(env(safe-area-inset-top, 0px) + 16px);
}

.launch-enter-active,
.launch-leave-active {
  transition: opacity 0.22s ease;
}

.launch-enter-from,
.launch-leave-to {
  opacity: 0;
}

.countdown-number-enter-active,
.countdown-number-leave-active {
  transition: opacity 0.18s ease, transform 0.32s cubic-bezier(0.18, 0.92, 0.2, 1.16), filter 0.32s ease;
}

.countdown-number-enter-from {
  opacity: 0;
  filter: blur(8px);
  transform: translateY(64px) scale(0.64) skewY(-5deg);
}

.countdown-number-leave-to {
  opacity: 0;
  filter: blur(10px);
  transform: translateY(-72px) scale(1.18) skewY(4deg);
}

.launch-overlay {
  isolation: isolate;
}

.launch-grid {
  position: absolute;
  inset: -10%;
  background:
    linear-gradient(rgba(255, 255, 255, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: radial-gradient(circle, black 0 42%, transparent 78%);
  transform: perspective(420px) rotateX(58deg) translateY(110px);
  animation: launch-grid-move 1.1s linear infinite;
}

.launch-streak {
  position: absolute;
  left: -18%;
  width: 136%;
  height: 16px;
  border-radius: 999px;
  filter: blur(0.2px);
  opacity: 0.82;
  transform: rotate(-16deg);
  animation: launch-streak 0.72s cubic-bezier(0.3, 0, 0.2, 1) infinite;
}

.launch-streak--one {
  top: 34%;
  background: linear-gradient(90deg, transparent, var(--theme-primary), transparent);
}

.launch-streak--two {
  top: 49%;
  height: 10px;
  background: linear-gradient(90deg, transparent, var(--theme-secondary), transparent);
  animation-delay: 0.1s;
}

.launch-streak--three {
  top: 62%;
  height: 12px;
  background: linear-gradient(90deg, transparent, var(--theme-sport), transparent);
  animation-delay: 0.2s;
}

.launch-panel {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: min(78vw, 340px);
  aspect-ratio: 1;
  border-radius: 999px;
  background:
    radial-gradient(circle, rgba(255, 255, 255, 0.11) 0 43%, transparent 44%),
    conic-gradient(from 180deg, var(--theme-primary), var(--theme-secondary), var(--theme-sport), var(--theme-primary));
  box-shadow: 0 0 82px var(--theme-dark-glow), inset 0 0 0 12px rgba(255, 255, 255, 0.05);
}

.launch-panel::before {
  content: "";
  position: absolute;
  inset: 13px;
  border-radius: inherit;
  background: #070808;
}

.launch-eyebrow,
.launch-number,
.launch-progress {
  position: relative;
  z-index: 1;
}

.launch-eyebrow {
  align-self: end;
  margin: 0;
  color: rgba(255, 255, 255, 0.58);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.launch-number {
  align-self: center;
  font-size: 132px;
  font-weight: 500;
  line-height: 0.82;
  color: #ffffff;
  text-shadow: 0 0 34px rgba(255, 255, 255, 0.22);
}

.launch-progress {
  align-self: start;
  display: flex;
  gap: 8px;
}

.launch-progress span {
  width: 32px;
  height: 5px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
}

.launch-progress span.is-active {
  background: var(--theme-primary);
  box-shadow: 0 0 20px var(--theme-dark-glow);
}

@keyframes launch-grid-move {
  to {
    background-position: 0 42px, 42px 0;
  }
}

@keyframes launch-streak {
  from {
    opacity: 0;
    transform: translateX(-34%) rotate(-16deg);
  }
  35% {
    opacity: 0.86;
  }
  to {
    opacity: 0;
    transform: translateX(34%) rotate(-16deg);
  }
}
</style>
