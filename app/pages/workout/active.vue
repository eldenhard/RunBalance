<script setup lang="ts">
import { Pause, Play, Radio, Square, ZapOff } from '@lucide/vue'

const store = useRunBalanceStore()
const router = useRouter()
const workout = computed(() => store.currentWorkout)
const session = computed(() => store.activeSession)
const progress = computed(() => store.sessionProgress)

onMounted(() => {
  store.restorePersistedActiveSession()
})

function togglePause() {
  if (session.value?.status === 'paused') {
    store.resumeWorkoutSession()
    return
  }

  store.pauseWorkoutSession()
}

async function finishWorkout() {
  store.finishActiveSession()
  await router.push('/workout/result')
}
</script>

<template>
  <div class="theme-dark min-h-dvh space-y-5 p-4">
    <ScreenHeader
      eyebrow="Активная тренировка"
      :title="workout.title"
      :description="session?.status === 'paused' ? 'Пауза. Продолжи, когда будешь готов.' : 'Сессия сохраняется локально во время тренировки.'"
    />

    <section class="grid grid-cols-2 gap-3">
      <MetricTile label="Дистанция" :value="formatDistance(session?.distanceKm)" dark />
      <MetricTile label="Время" :value="formatDuration(session?.durationSec)" dark />
      <MetricTile label="Темп" :value="formatPace(session?.avgPaceSecPerKm)" dark />
      <MetricTile label="Зона" :value="store.targetZone?.name ?? '—'" dark />
    </section>

    <Card v-if="session?.visualAlert" class="border-[#463018] bg-[#21160f] p-4">
      <div class="flex gap-3">
        <Radio class="mt-0.5 h-5 w-5 shrink-0 text-[#ffb071]" />
        <div>
          <h2 class="font-medium text-white">Подсказка</h2>
          <p class="mt-1 text-sm leading-5 text-[#d9c2b2]">{{ session.visualAlert.message }}</p>
        </div>
      </div>
    </Card>

    <Card class="p-4">
      <div class="flex gap-3">
        <ZapOff class="mt-0.5 h-5 w-5 shrink-0 text-[#9b9b9b]" />
        <div>
          <h2 class="font-medium text-white">Пульс не подключён</h2>
          <p class="mt-1 text-sm leading-5 text-[#b8b8b8]">
            Сейчас тренировка идёт по GPS, времени и темпу. События подсказок уже дублируются визуально.
          </p>
        </div>
      </div>
    </Card>

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
  </div>
</template>
