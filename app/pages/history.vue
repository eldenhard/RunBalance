<script setup lang="ts">
import { BarChart3, Trash2 } from '@lucide/vue'
import type { Workout } from '~/types/workout'

const store = useRunBalanceStore()
const summary = computed(() => store.analyticsReport.summary)
const swipedWorkoutId = ref<string | null>(null)
const pendingDeleteWorkout = ref<Workout | null>(null)
const dragWorkoutId = ref<string | null>(null)
const dragStartX = ref(0)
const dragDeltaX = ref(0)
const revealDistancePx = 92

function formatRunDate(workout: { finishedAt?: string, scheduledDate?: string }) {
  const source = workout.finishedAt ?? workout.scheduledDate
  if (!source) return '—'
  return new Date(source).toLocaleDateString('ru-RU')
}

function getWorkoutOffset(workoutId: string) {
  if (dragWorkoutId.value === workoutId) {
    return Math.max(-revealDistancePx, Math.min(0, dragDeltaX.value))
  }

  return swipedWorkoutId.value === workoutId ? -revealDistancePx : 0
}

function getWorkoutCardClass(workoutId: string) {
  const isOpen = swipedWorkoutId.value === workoutId || dragWorkoutId.value === workoutId
  return [
    'relative p-4 transition-transform duration-200 ease-out',
    isOpen ? 'rounded-r-none shadow-none' : ''
  ].join(' ')
}

function onSwipeStart(event: PointerEvent, workoutId: string) {
  dragWorkoutId.value = workoutId
  dragStartX.value = event.clientX
  dragDeltaX.value = swipedWorkoutId.value === workoutId ? -revealDistancePx : 0
}

function onSwipeMove(event: PointerEvent, workoutId: string) {
  if (dragWorkoutId.value !== workoutId) return
  const initialOffset = swipedWorkoutId.value === workoutId ? -revealDistancePx : 0
  dragDeltaX.value = initialOffset + event.clientX - dragStartX.value
}

function onSwipeEnd(workoutId: string) {
  if (dragWorkoutId.value !== workoutId) return
  swipedWorkoutId.value = getWorkoutOffset(workoutId) < -44 ? workoutId : null
  dragWorkoutId.value = null
  dragDeltaX.value = 0
}

function requestDelete(workout: Workout) {
  pendingDeleteWorkout.value = workout
}

function confirmDelete() {
  if (!pendingDeleteWorkout.value) return
  store.deleteHistoryWorkout(pendingDeleteWorkout.value.id)
  if (swipedWorkoutId.value === pendingDeleteWorkout.value.id) {
    swipedWorkoutId.value = null
  }
  pendingDeleteWorkout.value = null
}

function cancelDelete() {
  pendingDeleteWorkout.value = null
}
</script>

<template>
  <div class="theme-light space-y-4 p-4">
    <ScreenHeader eyebrow="История" title="Последние пробежки" />

    <Card class="p-4">
      <div class="grid grid-cols-3 gap-3">
        <div>
          <p class="text-xs text-[#767676]">Всего</p>
          <p class="mt-1 text-xl font-medium">{{ summary.totalRuns }}</p>
        </div>
        <div>
          <p class="text-xs text-[#767676]">Километры</p>
          <p class="mt-1 text-xl font-medium">{{ formatDistance(summary.totalDistanceKm) }}</p>
        </div>
        <div>
          <p class="text-xs text-[#767676]">Темп</p>
          <p class="mt-1 text-xl font-medium">{{ formatPace(summary.avgPaceSecPerKm) }}</p>
        </div>
      </div>
      <NuxtLink to="/analytics">
        <Button class="mt-4 w-full" variant="outline">
          <BarChart3 class="h-4 w-4" />
          Подробная аналитика
        </Button>
      </NuxtLink>
    </Card>

    <div v-if="store.history.length" class="space-y-4">
      <div
        v-for="workout in store.history"
        :key="workout.id"
        class="relative overflow-hidden rounded-[18px] bg-red-600"
      >
        <div class="absolute inset-y-0 right-0 flex w-[92px] items-stretch justify-end rounded-r-[18px] bg-red-600">
          <button
            class="flex w-full flex-col items-center justify-center gap-1 text-xs font-medium text-white"
            type="button"
            @click="requestDelete(workout)"
          >
            <Trash2 class="h-5 w-5" />
            Удалить
          </button>
        </div>

        <Card
          :class="getWorkoutCardClass(workout.id)"
          :style="{ transform: `translateX(${getWorkoutOffset(workout.id)}px)`, touchAction: 'pan-y' }"
          @pointerdown="onSwipeStart($event, workout.id)"
          @pointermove="onSwipeMove($event, workout.id)"
          @pointerup="onSwipeEnd(workout.id)"
          @pointercancel="onSwipeEnd(workout.id)"
          @pointerleave="onSwipeEnd(workout.id)"
        >
          <ClientOnly v-if="workout.routeSnapshot">
            <RouteMap :route="workout.routeSnapshot" class="mb-4 h-36 w-full" />
          </ClientOnly>
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h2 class="font-medium">{{ workout.title }}</h2>
              <p class="text-sm text-[#767676]">
                {{ formatRunDate(workout) }} · {{ formatDistance(workout.distanceKm) }} · {{ formatDuration(workout.durationSec) }}
              </p>
              <p class="mt-1 text-sm text-[#767676]">{{ formatPace(workout.avgPaceSecPerKm) }}</p>
            </div>
            <Badge variant="secondary">{{ workout.type }}</Badge>
          </div>
        </Card>
      </div>
    </div>

    <Card v-else class="p-4 text-sm text-[#767676]">
      История пока пустая. После первой завершённой тренировки результаты появятся здесь.
    </Card>

    <Teleport to="body">
      <div
        v-if="pendingDeleteWorkout"
        class="fixed inset-0 z-[10000] flex items-end bg-black/40 p-4 sm:items-center sm:justify-center"
        role="dialog"
        aria-modal="true"
      >
        <div class="w-full max-w-sm rounded-[24px] bg-white p-5 text-[#111111] shadow-2xl">
          <h2 class="text-xl font-medium">Удалить пробежку?</h2>
          <p class="mt-2 text-sm leading-5 text-[#767676]">
            {{ pendingDeleteWorkout.title }} будет удалена из истории и аналитики. Действие нельзя отменить.
          </p>
          <div class="mt-5 grid grid-cols-2 gap-3">
            <Button variant="outline" @click="cancelDelete">Отмена</Button>
            <Button variant="destructive" @click="confirmDelete">Удалить</Button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
