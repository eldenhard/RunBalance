<script setup lang="ts">
import { Footprints, Gauge, HeartPulse, History, Home, MapPinned, Play, Save, StickyNote, Timer } from '@lucide/vue'
import type { Workout, WorkoutSplit } from '~/types/workout'

type WorkoutWithSplits = Workout & {
  splits?: WorkoutSplit[]
}

const store = useRunBalanceStore()
const workout = computed<WorkoutWithSplits>(() => store.currentWorkout as WorkoutWithSplits)
const resultRoute = computed(() => workout.value.routeSnapshot)
const splits = computed(() => workout.value.splits ?? [])
const resultShoe = computed(() => store.shoes.find((shoe) => shoe.id === workout.value.shoeId) ?? store.selectedShoe)
const effort = ref<'easy' | 'steady' | 'hard'>('steady')
const note = ref('')
const routeSaved = ref(false)

const effortOptions = [
  { value: 'easy', label: 'Легко', class: 'border-[#7cc7ff] bg-[#eef8ff] text-[#0f5c82]' },
  { value: 'steady', label: 'Ровно', class: 'border-[#b9ff38] bg-[#f3ffd8] text-[#3f5f00]' },
  { value: 'hard', label: 'Тяжело', class: 'border-[#ff7a2b] bg-[#fff1e8] text-[#8a3900]' }
] as const

function getSplitPace(split: WorkoutSplit) {
  return split.paceSecPerKm
}

function saveRouteFromResult() {
  if (!resultRoute.value || routeSaved.value) return
  store.saveRouteSnapshot(resultRoute.value, `${resultRoute.value.name} · ${new Date().toLocaleDateString('ru-RU')}`)
  routeSaved.value = true
}
</script>

<template>
  <div class="theme-light min-h-dvh space-y-4 bg-[#f7f6f2] p-4">
    <ScreenHeader eyebrow="Результат" title="Пробежка сохранена локально" />

    <section class="overflow-hidden rounded-[28px] bg-[#111111] text-white">
      <div class="relative p-5">
        <div class="absolute inset-x-5 top-0 h-1.5 rounded-full bg-gradient-to-r from-[#b9ff38] via-[#7cc7ff] to-[#ff7a2b]" />
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm text-white/60">{{ workout.title }}</p>
            <h1 class="mt-3 text-[52px] font-medium leading-none tracking-normal">{{ formatDistance(workout.distanceKm) }}</h1>
          </div>
          <Badge variant="secondary" class="border-white/10 bg-white/10 text-white">Финиш</Badge>
        </div>

        <div class="mt-6 grid grid-cols-2 gap-3">
          <div class="rounded-3xl border border-white/10 bg-white/[0.06] p-4">
            <div class="flex items-center gap-2 text-sm text-[#7cc7ff]">
              <Timer class="h-4 w-4" />
              Время
            </div>
            <p class="mt-2 text-2xl font-medium">{{ formatDuration(workout.durationSec) }}</p>
          </div>
          <div class="rounded-3xl border border-white/10 bg-white/[0.06] p-4">
            <div class="flex items-center gap-2 text-sm text-[#ffad72]">
              <Gauge class="h-4 w-4" />
              Темп
            </div>
            <p class="mt-2 text-2xl font-medium">{{ formatPace(workout.avgPaceSecPerKm) }}</p>
          </div>
        </div>

        <div class="mt-3 flex items-center justify-between rounded-3xl border border-[#b9ff38]/20 bg-[#b9ff38]/10 px-4 py-3">
          <div class="flex items-center gap-2 text-sm text-white/70">
            <HeartPulse class="h-4 w-4 text-[#b9ff38]" />
            Пульс
          </div>
          <p class="font-medium">{{ workout.avgHeartRate ? `${workout.avgHeartRate} уд/мин` : 'нет данных' }}</p>
        </div>
      </div>
    </section>

    <Card class="overflow-hidden p-0">
      <div v-if="resultRoute">
        <ClientOnly>
          <RouteMap :route="resultRoute" class="h-56 w-full" />
        </ClientOnly>
      </div>
      <div v-else class="flex h-44 items-center justify-center bg-[#ecebe6] text-sm text-[#767676]">
        Трек недоступен
      </div>

      <div class="space-y-4 p-4">
        <div class="flex items-start gap-3">
          <div class="rounded-2xl bg-[#eef8ff] p-2 text-[#0f5c82]">
            <MapPinned class="h-5 w-5" />
          </div>
          <div class="min-w-0 flex-1">
            <h2 class="truncate font-medium">{{ resultRoute?.name ?? 'GPS-трек' }}</h2>
            <p class="mt-1 text-sm text-[#767676]">
              {{ resultRoute ? 'Маршрут тренировки показан по записанному треку.' : 'Недостаточно точек GPS для карты.' }}
            </p>
          </div>
        </div>

        <Button class="w-full" :variant="routeSaved ? 'default' : 'outline'" :disabled="!resultRoute || routeSaved" @click="saveRouteFromResult">
          <Save class="h-4 w-4" />
          {{ routeSaved ? 'Маршрут сохранён' : 'Сохранить маршрут' }}
        </Button>
      </div>
    </Card>

    <Card class="p-4">
      <div class="mb-4 flex items-center gap-3">
        <div class="rounded-2xl bg-[#fff1e8] p-2 text-[#8a3900]">
          <StickyNote class="h-5 w-5" />
        </div>
        <div>
          <h2 class="font-medium">Самочувствие после финиша</h2>
          <p class="text-sm text-[#767676]">Локальная заметка для себя.</p>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="option in effortOptions"
          :key="option.value"
          type="button"
          class="h-11 rounded-2xl border text-sm font-medium"
          :class="effort === option.value ? option.class : 'border-[#deded9] bg-white text-[#767676]'"
          @click="effort = option.value"
        >
          {{ option.label }}
        </button>
      </div>

      <textarea
        v-model="note"
        class="mt-3 min-h-24 w-full resize-none rounded-3xl border border-[#deded9] bg-white p-4 text-[16px] outline-none"
        placeholder="Что запомнить про эту пробежку"
      />
    </Card>

    <Card v-if="resultShoe" class="p-4">
      <div class="flex items-center gap-3">
        <div class="rounded-2xl bg-[#f3ffd8] p-2 text-[#3f5f00]">
          <Footprints class="h-5 w-5" />
        </div>
        <div>
          <h2 class="font-medium">{{ resultShoe.name }}</h2>
          <p class="text-sm text-[#767676]">+{{ workout.distanceKm?.toFixed(1) ?? '0' }} км к ресурсу пары</p>
        </div>
      </div>
    </Card>

    <Card class="p-4">
      <div class="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 class="font-medium">Сплиты</h2>
          <p class="text-sm text-[#767676]">{{ splits.length ? 'Темп по отрезкам' : 'Пока без сплитов' }}</p>
        </div>
        <Badge variant="secondary">{{ splits.length || 0 }}</Badge>
      </div>

      <div v-if="splits.length" class="space-y-2">
        <div
          v-for="(split, index) in splits"
          :key="split.index ?? index"
          class="grid grid-cols-[44px_1fr_auto] items-center gap-3 rounded-3xl border border-[#deded9] bg-white p-3"
        >
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#111111] text-sm font-medium text-white">
            {{ split.index ?? index + 1 }}
          </div>
          <div>
            <p class="font-medium">{{ formatDistance(split.distanceKm) }}</p>
            <p class="text-sm text-[#767676]">{{ formatDuration(split.durationSec) }}</p>
          </div>
          <div class="text-right">
            <p class="font-medium">{{ formatPace(getSplitPace(split)) }}</p>
            <p class="text-sm text-[#767676]">отрезок</p>
          </div>
        </div>
      </div>
      <div v-else class="rounded-3xl border border-dashed border-[#deded9] bg-white p-4 text-sm text-[#767676]">
        Сплиты появятся после записи отрезков.
      </div>
    </Card>

    <div class="grid gap-3 pt-2">
      <NuxtLink to="/" class="block">
        <Button class="w-full" size="lg">
          <Home class="h-5 w-5" />
          На сегодня
        </Button>
      </NuxtLink>
      <div class="grid grid-cols-2 gap-3">
        <NuxtLink to="/history" class="block">
          <Button class="w-full" variant="outline">
            <History class="h-4 w-4" />
            История
          </Button>
        </NuxtLink>
        <NuxtLink to="/start" class="block">
          <Button class="w-full" variant="outline">
            <Play class="h-4 w-4" />
            Новый старт
          </Button>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
