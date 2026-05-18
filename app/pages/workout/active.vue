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
const currentPoint = computed(() => gps.latestPoint.value ?? session.value?.trackPoints.at(-1) ?? null)
const liveRoute = computed(() => {
  if (session.value?.trackPoints.length) {
    return createRouteFromTrack(session.value.trackPoints, store.activeRoute, session.value.distanceKm)
  }

  return store.activeRoute
})
let runtimeInterval: ReturnType<typeof window.setInterval> | null = null

onMounted(() => {
  store.restorePersistedActiveSession()
  syncRuntimeTimer()
  if (session.value?.status === 'active' && !gps.isTracking.value) {
    gps.start()
  }
})

onBeforeUnmount(() => {
  stopRuntimeTimer()
})

watch(() => session.value?.status, () => {
  syncRuntimeTimer()
})

function togglePause() {
  if (session.value?.status === 'paused') {
    store.resumeWorkoutSession()
    gps.start()
    return
  }

  store.pauseWorkoutSession()
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
  store.finishActiveSession()
  await router.push('/workout/result')
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

const gpsStatusClass = computed(() => gps.status.value === 'tracking'
  ? 'border-white/20 bg-white text-[#0b0b0c]'
  : 'border-white/10 bg-white/5 text-[#8f8f8f]')
const voiceStatusClass = computed(() => voice.isEnabled.value && voice.isSupported.value
  ? 'border-white/20 bg-white text-[#0b0b0c]'
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

    <Card class="overflow-hidden p-0">
      <ClientOnly>
        <RouteMap :route="liveRoute" :current-point="currentPoint" theme="dark" class="h-56 w-full" />
      </ClientOnly>
    </Card>

    <section class="grid grid-cols-2 gap-4">
      <MetricTile label="Дистанция" :value="formatDistance(session?.distanceKm)" dark />
      <MetricTile label="Время" :value="formatDuration(session?.durationSec)" dark />
      <MetricTile label="Темп" :value="formatPace(session?.avgPaceSecPerKm)" dark />
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
        <div class="h-full rounded-full bg-white" :style="{ width: `${progress}%` }" />
      </div>
    </section>

    <div class="grid grid-cols-2 gap-3 pt-4">
      <Button class="bg-white text-[#0b0b0c] active:bg-[#e8e8e8]" size="lg" @click="togglePause">
        <Play v-if="session?.status === 'paused'" class="h-5 w-5" />
        <Pause v-else class="h-5 w-5" />
        {{ session?.status === 'paused' ? 'Продолжить' : 'Пауза' }}
      </Button>
      <Button class="w-full" variant="destructive" size="lg" @click="finishWorkout">
        <Square class="h-5 w-5" />
        Завершить
      </Button>
    </div>
    </template>
  </div>
</template>
