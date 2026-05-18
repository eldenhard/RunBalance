<script setup lang="ts">
import { MapPin, Pause, Play, Radio, Square, Volume2, VolumeX, ZapOff } from '@lucide/vue'
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
const gpsLabel = computed(() => {
  if (gps.status.value === 'tracking') return 'GPS пишет трек'
  if (gps.status.value === 'denied') return 'GPS выключен'
  if (gps.status.value === 'unsupported') return 'GPS недоступен'
  if (gps.status.value === 'error') return 'GPS ждёт сигнал'
  return 'GPS готов'
})
const voiceLabel = computed(() => {
  if (!voice.isSupported.value) return 'Голос недоступен'
  return voice.isEnabled.value ? 'Голос включён' : 'Голос выключен'
})
const zoneDetail = computed(() => {
  if (!targetZone.value) return 'зона не выбрана'
  return `${targetZone.value.minBpm}-${targetZone.value.maxBpm} уд/мин`
})
const liveRoute = computed(() => {
  if (session.value?.trackPoints.length && store.activeRoute) {
    return createRouteFromTrack(session.value.trackPoints, store.activeRoute)
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
</script>

<template>
  <div class="theme-dark min-h-dvh space-y-5 p-4">
    <Card v-if="!session" class="p-5">
      <div class="space-y-4">
        <ScreenHeader eyebrow="Активная тренировка" title="Сессия ещё не началась" description="Запусти тренировку со стартового экрана, чтобы пошли реальные время, расстояние и темп." />
        <NuxtLink to="/start" class="block">
          <Button class="w-full" size="lg">К старту</Button>
        </NuxtLink>
      </div>
    </Card>

    <template v-else>
    <ScreenHeader
      eyebrow="Активная тренировка"
      :title="workout.title"
      :description="session?.status === 'paused' ? 'Пауза.' : 'Тренировка идёт и сохраняется локально.'"
    />

    <Card v-if="liveRoute" class="overflow-hidden p-0">
      <ClientOnly>
        <RouteMap :route="liveRoute" theme="dark" class="h-44 w-full" />
      </ClientOnly>
    </Card>

    <section class="grid grid-cols-2 gap-3">
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

    <Card class="p-4">
      <div class="flex gap-3">
        <ZapOff class="mt-0.5 h-5 w-5 shrink-0 text-[#9b9b9b]" />
        <div>
          <h2 class="font-medium text-white">Пульс не подключён</h2>
          <p class="mt-1 text-sm leading-5 text-[#b8b8b8]">Сейчас работаем по GPS, времени и темпу.</p>
        </div>
      </div>
    </Card>

    <section class="grid grid-cols-2 gap-3">
      <Card class="p-4">
        <div class="flex items-center gap-3">
          <MapPin class="h-5 w-5 text-[var(--screen-muted)]" />
          <div>
            <p class="text-xs text-[var(--screen-muted)]">Трекинг</p>
            <p class="mt-1 font-medium">{{ gpsLabel }}</p>
          </div>
        </div>
        <Button class="mt-4 w-full" variant="outline" @click="toggleGps">
          {{ gps.isTracking.value ? 'Остановить GPS' : 'Включить GPS' }}
        </Button>
      </Card>

      <Card class="p-4">
        <div class="flex items-center gap-3">
          <Volume2 v-if="voice.isEnabled.value" class="h-5 w-5 text-[var(--screen-muted)]" />
          <VolumeX v-else class="h-5 w-5 text-[var(--screen-muted)]" />
          <div>
            <p class="text-xs text-[var(--screen-muted)]">Подсказки</p>
            <p class="mt-1 font-medium">{{ voiceLabel }}</p>
          </div>
        </div>
        <Button class="mt-4 w-full" variant="outline" @click="voice.toggle()">
          {{ voice.isEnabled.value ? 'Выключить' : 'Включить' }}
        </Button>
      </Card>
    </section>

    <section>
      <div class="mb-2 flex items-center justify-between text-sm text-[#b8b8b8]">
        <span>Прогресс</span>
        <span>{{ progress }}%</span>
      </div>
      <div class="h-1.5 rounded-full bg-[#252525]">
        <div class="h-full rounded-full bg-white" :style="{ width: `${progress}%` }" />
      </div>
    </section>

    <div class="grid grid-cols-2 gap-3 pt-3">
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
