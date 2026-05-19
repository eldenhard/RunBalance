<script setup lang="ts">
import { HeartPulse, Pause, Play, Radio, Satellite, Square, Volume2, VolumeX } from '@lucide/vue'
import { createRouteFromTrack } from '~/services/routes'

const store = useRunBalanceStore()
const router = useRouter()
const workout = computed(() => store.currentWorkout)
const session = computed(() => store.activeSession)
const progress = computed(() => store.sessionProgress)
const targetZone = computed(() => store.targetZone)
const targetZoneAppearance = computed(() => store.targetZoneAppearance)
const voice = useVoiceAlerts()
const workoutEvent = ref<string | null>(null)
const gps = useGeolocationTracking({
  onPoint: (point) => {
    store.appendTrackPoint(point)
    const alert = store.evaluateWorkoutAlert()
    voice.speak(alert)
  }
})
const zoneDetail = computed(() => {
  if (!targetZone.value) return 'зона не выбрана'
  return `${targetZone.value.minBpm}-${targetZone.value.maxBpm} уд/мин`
})
const trackedDistanceKm = computed(() => session.value?.distanceKm ?? 0)
const currentPoint = computed(() => gps.latestPoint.value ?? session.value?.trackPoints.at(-1) ?? null)
const displayPaceSecPerKm = computed(() => session.value?.avgPaceSecPerKm ?? getCurrentPaceFromGps())
const liveRoute = computed(() => {
  if (session.value?.trackPoints.length && session.value.trackPoints.length >= 2) {
    return createRouteFromTrack(session.value.trackPoints, store.activeRoute, session.value.distanceKm)
  }

  return store.activeRoute
})
let runtimeInterval: ReturnType<typeof window.setInterval> | null = null
let finishHoldFrame: number | null = null
let lastHandledKilometer = 0
const finishHoldMs = 7000
const finishHoldProgress = ref(0)
const isHoldingFinish = computed(() => finishHoldProgress.value > 0)

onMounted(() => {
  store.restorePersistedActiveSession()
  lastHandledKilometer = Math.floor(trackedDistanceKm.value)
  if (session.value) {
    workoutEvent.value = 'Тренировка началась'
  }
  syncRuntimeTimer()
  if (session.value?.status === 'active' && !gps.isTracking.value) {
    gps.start()
  }
})

onBeforeUnmount(() => {
  stopRuntimeTimer()
  cancelFinishHold()
})

watch(() => session.value?.status, () => {
  syncRuntimeTimer()
})

watch(
  trackedDistanceKm,
  (distanceKm) => {
    const fullKilometer = Math.floor(distanceKm)
    if (fullKilometer <= lastHandledKilometer) return

    for (let kilometer = lastHandledKilometer + 1; kilometer <= fullKilometer; kilometer += 1) {
      if (kilometer > 0) {
        announceWorkoutEvent(getKilometerEventMessage(kilometer), { vibrationPattern: [80, 50, 80] })
      }
    }
    lastHandledKilometer = fullKilometer
  },
  { flush: 'sync' }
)

function togglePause() {
  if (session.value?.status === 'paused') {
    store.resumeWorkoutSession()
    announceWorkoutEvent('Продолжаем', { vibrationPattern: 70 })
    gps.start()
    return
  }

  store.pauseWorkoutSession()
  announceWorkoutEvent('Пауза', { vibrationPattern: [70, 40, 70] })
  gps.stop()
}

function toggleGps() {
  if (gps.isTracking.value) {
    gps.stop()
    return
  }

  gps.start()
}

async function finishWorkout() {
  gps.stop()
  announceWorkoutEvent('Тренировка завершена', { vibrationPattern: [100, 60, 100] })
  store.refreshActiveSession()
  await wait(900)
  store.finishActiveSession()
  await router.push('/workout/result')
}

function startFinishHold() {
  if (finishHoldFrame !== null) return

  voice.prime()
  const startedAt = performance.now()
  const tick = () => {
    const elapsed = performance.now() - startedAt
    finishHoldProgress.value = Math.min(100, (elapsed / finishHoldMs) * 100)

    if (elapsed >= finishHoldMs) {
      finishHoldFrame = null
      finishHoldProgress.value = 0
      void finishWorkout()
      return
    }

    finishHoldFrame = window.requestAnimationFrame(tick)
  }

  finishHoldFrame = window.requestAnimationFrame(tick)
}

function cancelFinishHold() {
  if (finishHoldFrame !== null) {
    window.cancelAnimationFrame(finishHoldFrame)
    finishHoldFrame = null
  }
  finishHoldProgress.value = 0
}

function syncRuntimeTimer() {
  stopRuntimeTimer()
  if (!session.value || session.value.status !== 'active') return

  runtimeInterval = window.setInterval(() => {
    store.refreshActiveSession()
  }, 1000)
}

function stopRuntimeTimer() {
  if (runtimeInterval !== null) {
    window.clearInterval(runtimeInterval)
    runtimeInterval = null
  }
}

function announceWorkoutEvent(message: string, options?: Parameters<typeof voice.announceEvent>[1]) {
  workoutEvent.value = message
  voice.announceEvent(message, options)
}

function getKilometerEventMessage(kilometer: number) {
  if (kilometer === 1) return 'Первый километр'
  return `${kilometer} километр`
}

function getCurrentPaceFromGps() {
  const speedMps = currentPoint.value?.speedMps
  if (!speedMps || speedMps < 0.7) return undefined

  return Math.round(1000 / speedMps)
}

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms))
}

const gpsStatusClass = computed(() => gps.status.value === 'tracking'
  ? 'border-[#b9ff38]/40 bg-[#b9ff38] text-[#0b0b0c] shadow-[0_0_24px_rgba(185,255,56,0.22)]'
  : 'border-white/10 bg-white/5 text-[#8f8f8f]')
const voiceStatusClass = computed(() => voice.isEnabled.value && voice.isSupported.value
  ? 'border-[#7cc7ff]/40 bg-[#7cc7ff] text-[#0b0b0c] shadow-[0_0_24px_rgba(124,199,255,0.2)]'
  : 'border-white/10 bg-white/5 text-[#8f8f8f]')
</script>

<template>
  <div class="theme-dark min-h-dvh space-y-6 p-4">
    <Card v-if="!session" class="p-5">
      <div class="space-y-4">
        <ScreenHeader eyebrow="Активная тренировка" title="Сессия ещё не началась" description="Запусти тренировку со стартового экрана, чтобы пошли реальные время, расстояние и темп." />
        <NuxtLink to="/start" class="block">
          <Button class="w-full" size="lg">К старту</Button>
        </NuxtLink>
      </div>
    </Card>

    <template v-else>
    <div class="flex items-center justify-between gap-4">
      <ScreenHeader
        eyebrow="Активная тренировка"
        :title="workout.title"
        :description="session?.status === 'paused' ? 'Пауза.' : ''"
      />
      <div class="flex shrink-0 items-center gap-2">
        <button
          type="button"
          :class="['flex h-10 w-10 items-center justify-center rounded-full border transition-colors', gpsStatusClass]"
          aria-label="GPS"
          @click="toggleGps"
        >
          <Satellite class="h-5 w-5" />
        </button>
        <button
          type="button"
          :class="['flex h-10 w-10 items-center justify-center rounded-full border transition-colors', voiceStatusClass]"
          aria-label="Голосовые подсказки"
          @click="voice.toggle()"
        >
          <Volume2 v-if="voice.isEnabled.value" class="h-5 w-5" />
          <VolumeX v-else class="h-5 w-5" />
        </button>
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#8f8f8f]"
          aria-label="Пульс недоступен"
        >
          <HeartPulse class="h-5 w-5" />
        </div>
      </div>
    </div>

    <div
      v-if="workoutEvent"
      class="inline-flex max-w-full items-center gap-2 rounded-full border border-[#7cc7ff]/25 bg-[#10202a] px-3 py-2 text-sm font-medium text-[#bfe8ff]"
      role="status"
    >
      <Radio class="h-4 w-4 shrink-0" />
      <span class="truncate">{{ workoutEvent }}</span>
    </div>

    <Card class="overflow-hidden border-[#26301b] bg-[#111411] p-0 shadow-[0_24px_60px_rgba(185,255,56,0.08)]">
      <ClientOnly>
        <RouteMap
          :route="liveRoute"
          :current-point="currentPoint"
          theme="dark"
          interactive
          :show-status-hint="false"
          class="h-64 w-full"
        />
      </ClientOnly>
    </Card>

    <section class="grid grid-cols-2 gap-4">
      <MetricTile label="Дистанция" :value="formatDistance(session?.distanceKm)" dark class="border-[#b9ff38]/20 bg-[#182010]" />
      <MetricTile label="Время" :value="formatDuration(session?.durationSec)" dark class="border-[#7cc7ff]/20 bg-[#101820]" />
      <MetricTile label="Темп" :value="formatPace(displayPaceSecPerKm)" dark class="border-[#ff7a2b]/20 bg-[#21160f]" />
      <MetricTile
        label="Зона"
        :value="targetZone?.name ?? '—'"
        :detail="zoneDetail"
        dark
        :class="targetZoneAppearance.tileClass"
      />
    </section>

    <Card v-if="session?.visualAlert || gps.errorMessage.value" class="border-[#463018] bg-[#21160f] p-4">
      <div class="flex gap-3">
        <Radio class="mt-0.5 h-5 w-5 shrink-0 text-[#ffb071]" />
        <div>
          <h2 class="font-medium text-white">Подсказка</h2>
          <p class="mt-1 text-sm leading-5 text-[#d9c2b2]">{{ gps.errorMessage.value ?? session?.visualAlert?.message }}</p>
        </div>
      </div>
    </Card>

    <section class="pt-2">
      <div class="mb-2 flex items-center justify-between text-sm text-[#b8b8b8]">
        <span>Прогресс</span>
        <span>{{ progress }}%</span>
      </div>
      <div class="h-1.5 rounded-full bg-[#252525]">
        <div class="h-full rounded-full bg-gradient-to-r from-[#b9ff38] via-[#7cc7ff] to-[#ff7a2b]" :style="{ width: `${progress}%` }" />
      </div>
    </section>

    <div class="grid grid-cols-2 gap-3 pt-4">
      <Button class="bg-white text-[#0b0b0c] active:bg-[#e8e8e8]" size="lg" @click="togglePause">
        <Play v-if="session?.status === 'paused'" class="h-5 w-5" />
        <Pause v-else class="h-5 w-5" />
        {{ session?.status === 'paused' ? 'Продолжить' : 'Пауза' }}
      </Button>
      <button
        type="button"
        class="relative h-12 touch-none select-none overflow-hidden rounded-[14px] bg-red-600 px-5 text-base font-medium text-white transition-colors active:bg-red-700"
        :style="{ '--finish-progress': `${finishHoldProgress}%` }"
        @pointerdown.prevent="startFinishHold"
        @pointerup.prevent="cancelFinishHold"
        @pointercancel.prevent="cancelFinishHold"
        @pointerleave.prevent="cancelFinishHold"
      >
        <span class="finish-hold-fill" />
        <span class="relative z-10 inline-flex items-center justify-center gap-2">
          <Square class="h-5 w-5" />
          {{ isHoldingFinish ? 'Удерживай' : 'Завершить' }}
        </span>
      </button>
    </div>
    </template>
  </div>
</template>

<style scoped>
.finish-hold-fill {
  position: absolute;
  inset: 0;
  width: var(--finish-progress);
  background: rgba(255, 255, 255, 0.24);
  transition: width 0.08s linear;
}
</style>
