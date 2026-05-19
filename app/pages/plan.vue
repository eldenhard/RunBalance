<script setup lang="ts">
import { CalendarDays, CheckCircle2, CirclePlus, Flame, Map, Target, Trash2 } from '@lucide/vue'
import { getRouteTypeLabel } from '~/services/routes'
import type { UserGoal } from '~/types/profile'
import type { WorkoutType } from '~/types/workout'

const store = useRunBalanceStore()
type PlanSection = 'workouts' | 'routes' | 'goal'

const activeSection = ref<PlanSection>('workouts')
const createFeedback = ref(false)
const pendingDeleteWorkoutId = ref<string | null>(null)
let createFeedbackTimer: ReturnType<typeof window.setTimeout> | null = null

const workoutTypes: { value: WorkoutType, label: string }[] = [
  { value: 'easy', label: 'Лёгкий бег' },
  { value: 'recovery', label: 'Восстановление' },
  { value: 'long', label: 'Длинный бег' },
  { value: 'tempo', label: 'Темповый бег' },
  { value: 'intervals', label: 'Интервалы' },
  { value: 'fartlek', label: 'Фартлек' },
  { value: 'free', label: 'Свободный бег' }
]

const goalOptions: { value: UserGoal, label: string }[] = [
  { value: 'base', label: 'Базовая форма' },
  { value: 'return_to_running', label: 'Возвращение' },
  { value: '5k', label: '5 км' },
  { value: '10k', label: '10 км' },
  { value: 'half_marathon', label: 'Полумарафон' }
]

const sections: { value: PlanSection, label: string }[] = [
  { value: 'workouts', label: 'Тренировки' },
  { value: 'routes', label: 'Маршруты' },
  { value: 'goal', label: 'Цель' }
]

const currentGoalLabel = computed(() => goalOptions.find((option) => option.value === store.profile.goal)?.label ?? '—')
const activeRouteId = computed(() => store.activeRoute?.id ?? null)

const form = reactive({
  title: '',
  type: 'easy' as WorkoutType,
  scheduledDate: new Date().toISOString().slice(0, 10),
  plannedDistanceKm: '6',
  plannedDurationMin: '42',
  targetZoneId: store.profile.zones[1]?.id ?? store.profile.zones[0]?.id ?? '',
  shoeId: store.activeShoe?.id ?? store.shoes[0]?.id ?? '',
  routeId: store.activeRoute?.id ?? store.routes[0]?.id ?? ''
})

watch(() => store.profile.zones, (zones) => {
  if (!form.targetZoneId && zones.length) form.targetZoneId = zones[1]?.id ?? zones[0]!.id
})
watch(() => store.activeShoe, (shoe) => {
  if (!form.shoeId && shoe) form.shoeId = shoe.id
})
watch(() => store.activeRoute, (route) => {
  if (!form.routeId && route) form.routeId = route.id
})

function createWorkout() {
  if (createFeedback.value) return
  const title = form.title.trim() || workoutTypes.find((type) => type.value === form.type)?.label || 'Своя тренировка'
  store.createPlannedWorkout({
    title,
    type: form.type,
    scheduledDate: form.scheduledDate,
    plannedDistanceKm: toOptionalNumber(form.plannedDistanceKm),
    plannedDurationMin: toOptionalNumber(form.plannedDurationMin),
    targetZoneId: form.targetZoneId || undefined,
    shoeId: form.shoeId || undefined,
    routeId: form.routeId || undefined
  })
  createFeedback.value = true
  if (createFeedbackTimer) window.clearTimeout(createFeedbackTimer)
  createFeedbackTimer = window.setTimeout(() => {
    createFeedback.value = false
  }, 1100)
}

function toOptionalNumber(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

function requestDeleteWorkout(workoutId: string) {
  pendingDeleteWorkoutId.value = workoutId
}

function confirmDeleteWorkout() {
  if (!pendingDeleteWorkoutId.value) return
  store.deletePlannedWorkout(pendingDeleteWorkoutId.value)
  pendingDeleteWorkoutId.value = null
}

function cancelDeleteWorkout() {
  pendingDeleteWorkoutId.value = null
}

onBeforeUnmount(() => {
  if (createFeedbackTimer) window.clearTimeout(createFeedbackTimer)
})
</script>

<template>
  <div class="theme-light min-h-dvh space-y-4 p-4">
    <ScreenHeader eyebrow="План" title="Свои тренировки" />

    <div class="sticky top-[calc(env(safe-area-inset-top,0px)+8px)] z-20 rounded-[22px] border border-[#d8ead1] bg-white/90 p-1 shadow-[0_10px_30px_rgba(34,197,94,0.08)] backdrop-blur">
      <div class="grid grid-cols-3 gap-1">
        <button
          v-for="section in sections"
          :key="section.value"
          class="h-11 rounded-[18px] text-sm font-medium text-[#767676] transition"
          :class="activeSection === section.value ? 'bg-[#111111] text-white shadow-sm' : 'active:bg-[#f3ffd8]'"
          @click="activeSection = section.value"
        >
          {{ section.label }}
        </button>
      </div>
    </div>

    <Card v-if="activeSection === 'workouts'" class="border-[#e8dcff] bg-[#fdfbff] p-4">
      <div class="mb-4 flex items-center gap-3">
        <CirclePlus class="h-5 w-5 text-[#7c3aed]" />
        <div>
          <h2 class="font-medium">Новая тренировка</h2>
         
        </div>
      </div>

      <div class="grid gap-3">
        <label class="grid gap-1.5">
          <span class="text-sm font-medium">Название</span>
          <input v-model="form.title" class="plan-input h-12 rounded-2xl border border-[#deded9] bg-white px-4 text-[16px] outline-none" placeholder="Например, темповый 8 км" />
        </label>

        <div class="grid grid-cols-1 gap-3">
          <label class="grid min-w-0 gap-1.5">
            <span class="text-sm font-medium">Тип</span>
            <select v-model="form.type" class="plan-input h-12 w-full rounded-2xl border border-[#deded9] bg-white px-4 text-[16px] outline-none">
              <option v-for="type in workoutTypes" :key="type.value" :value="type.value">{{ type.label }}</option>
            </select>
          </label>

          <label class="grid min-w-0 gap-1.5">
            <span class="text-sm font-medium">Дата</span>
            <input v-model="form.scheduledDate" type="date" class="plan-input h-12 w-full rounded-2xl border border-[#deded9] bg-white px-4 text-[16px] outline-none" />
          </label>
        </div>

        <div class="grid grid-cols-1 gap-3">
          <label class="grid min-w-0 gap-1.5">
            <span class="text-sm font-medium">Дистанция, км</span>
            <input v-model="form.plannedDistanceKm" inputmode="decimal" class="plan-input h-12 w-full rounded-2xl border border-[#deded9] bg-white px-4 text-[16px] outline-none" />
          </label>

          <label class="grid min-w-0 gap-1.5">
            <span class="text-sm font-medium">Время, мин</span>
            <input v-model="form.plannedDurationMin" inputmode="numeric" class="plan-input h-12 w-full rounded-2xl border border-[#deded9] bg-white px-4 text-[16px] outline-none" />
          </label>
        </div>

        <div class="grid grid-cols-1 gap-3">
          <label class="grid min-w-0 gap-1.5">
            <span class="text-sm font-medium">Зона</span>
            <select v-model="form.targetZoneId" class="plan-input h-12 w-full rounded-2xl border border-[#deded9] bg-white px-4 text-[16px] outline-none">
              <option value="">Без зоны</option>
              <option v-for="zone in store.profile.zones" :key="zone.id" :value="zone.id">
                {{ zone.name }} · {{ zone.minBpm }}-{{ zone.maxBpm }}
              </option>
            </select>
          </label>

          <label class="grid min-w-0 gap-1.5">
            <span class="text-sm font-medium">Кроссовки</span>
            <select v-model="form.shoeId" class="plan-input h-12 w-full rounded-2xl border border-[#deded9] bg-white px-4 text-[16px] outline-none">
              <option value="">Без кроссовок</option>
              <option v-for="shoe in store.shoes" :key="shoe.id" :value="shoe.id">
                {{ shoe.name }}
              </option>
            </select>
          </label>
        </div>

        <label class="grid min-w-0 gap-1.5">
          <span class="text-sm font-medium">Маршрут</span>
          <select v-model="form.routeId" class="plan-input h-12 w-full rounded-2xl border border-[#deded9] bg-white px-4 text-[16px] outline-none">
            <option value="">Без привязки</option>
            <option v-for="savedRoute in store.routes" :key="savedRoute.id" :value="savedRoute.id">
              {{ savedRoute.name }} · {{ savedRoute.distanceKm }} км
            </option>
          </select>
        </label>

        <Button
          class="mt-2 w-full transition-transform"
          :class="createFeedback ? 'scale-[0.98] border-[var(--theme-primary)] bg-[var(--theme-primary)] text-[var(--theme-on-primary)]' : ''"
          size="lg"
          :disabled="createFeedback"
          @click="createWorkout"
        >
          <CheckCircle2 v-if="createFeedback" class="h-5 w-5" />
          <CirclePlus v-else class="h-5 w-5" />
          {{ createFeedback ? 'Добавлено' : 'Создать тренировку' }}
        </Button>
      </div>
    </Card>

    <Card v-if="activeSection === 'workouts'" class="p-4">
      <div class="mb-4 flex items-center gap-3">
        <CalendarDays class="h-5 w-5 text-[#111111]" />
        <div>
          <h2 class="font-medium">Запланированные</h2>
        </div>
      </div>

      <div v-if="store.plannedWorkouts.length" class="space-y-3">
        <div
          v-for="workout in store.plannedWorkouts"
          :key="workout.id"
          class="rounded-3xl border border-[#deded9] bg-[#fbfbf9] p-4"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <h3 class="truncate font-medium">{{ workout.title }}</h3>
                <Badge v-if="store.selectedWorkoutId === workout.id" variant="secondary">Сегодня</Badge>
              </div>
              <p class="mt-1 text-sm text-[#767676]">
                {{ workout.scheduledDate }} · {{ workout.plannedDistanceKm ?? '—' }} км · {{ workout.plannedDurationMin ?? '—' }} мин
              </p>
            </div>
            <Badge variant="secondary">{{ workout.type }}</Badge>
          </div>

          <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div class="rounded-2xl border border-[#e5e5df] bg-white p-3">
              <p class="text-xs text-[#767676]">Целевая зона</p>
              <p class="mt-1 font-medium">{{ workout.targetZoneId?.toUpperCase() ?? '—' }}</p>
            </div>
            <div class="rounded-2xl border border-[#e5e5df] bg-white p-3">
              <p class="text-xs text-[#767676]">Кроссовки</p>
              <p class="mt-1 font-medium">{{ store.shoes.find((shoe) => shoe.id === workout.shoeId)?.name ?? '—' }}</p>
            </div>
            <div class="rounded-2xl border border-[#e5e5df] bg-white p-3 sm:col-span-2">
              <div class="flex items-center gap-2 text-xs text-[#767676]">
                <Map class="h-3.5 w-3.5" />
                <span>Маршрут</span>
              </div>
              <p class="mt-1 font-medium">{{ store.routes.find((item) => item.id === workout.routeId)?.name ?? '—' }}</p>
            </div>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-3">
            <Button
              class="w-full"
              :class="store.selectedWorkoutId === workout.id ? 'bg-[#111111] text-white active:bg-[#111111]' : ''"
              :variant="store.selectedWorkoutId === workout.id ? 'default' : 'outline'"
              @click="store.selectPlannedWorkout(workout.id)"
            >
              <Flame class="h-4 w-4" :class="store.selectedWorkoutId === workout.id ? 'text-red-500' : ''" />
              {{ store.selectedWorkoutId === workout.id ? 'Сегодня' : 'На сегодня' }}
            </Button>
            <Button class="w-full" variant="outline" @click="requestDeleteWorkout(workout.id)">
              <Trash2 class="h-4 w-4" />
              Удалить
            </Button>
          </div>
        </div>
      </div>

      <div v-else class="rounded-3xl border border-dashed border-[#deded9] bg-white p-4 text-sm text-[#767676]">
        План пуст. Создай свою тренировку выше, и она появится на «Сегодня» и «Старт».
      </div>
    </Card>

    <template v-else-if="activeSection === 'routes'">
      <Card class="p-4">
        <NuxtLink to="/routes" class="flex items-start gap-3">
          <Map class="mt-0.5 h-5 w-5 text-[#111111]" />
          <div class="flex-1">
            <h2 class="font-medium">Управление маршрутами</h2>
          </div>
          <span class="text-sm font-medium text-[#111111]">{{ store.routes.length }}</span>
        </NuxtLink>
      </Card>

      <Card class="p-4">
        <div class="mb-4 flex items-center gap-3">
          <Map class="h-5 w-5 text-[#111111]" />
          <div>
            <h2 class="font-medium">Маршруты в плане</h2>
          </div>
        </div>

        <div v-if="store.routes.length" class="space-y-3">
          <div
            v-for="savedRoute in store.routes"
            :key="savedRoute.id"
            class="rounded-3xl border border-[#deded9] bg-[#fbfbf9] p-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="truncate font-medium">{{ savedRoute.name }}</h3>
                  <Badge v-if="activeRouteId === savedRoute.id" variant="secondary">Сегодня</Badge>
                </div>
                <p class="mt-1 text-sm text-[#767676]">
                  {{ savedRoute.distanceKm }} км · {{ getRouteTypeLabel(savedRoute.type) }} · {{ savedRoute.surface }}
                </p>
              </div>
              <Badge variant="secondary">{{ getRouteTypeLabel(savedRoute.type) }}</Badge>
            </div>

            <div class="mt-4 grid grid-cols-2 gap-3">
              <Button
                class="w-full"
                :class="activeRouteId === savedRoute.id ? 'bg-[#111111] text-white active:bg-[#111111]' : ''"
                :variant="activeRouteId === savedRoute.id ? 'default' : 'outline'"
                @click="store.selectRouteForToday(savedRoute.id)"
              >
                <Flame class="h-4 w-4" :class="activeRouteId === savedRoute.id ? 'text-red-500' : ''" />
                {{ activeRouteId === savedRoute.id ? 'Сегодня' : 'На сегодня' }}
              </Button>
              <NuxtLink to="/routes" class="block">
                <Button class="w-full" variant="outline">Открыть</Button>
              </NuxtLink>
            </div>
          </div>
        </div>

        <div v-else class="rounded-3xl border border-dashed border-[#deded9] bg-white p-4 text-sm text-[#767676]">
          Маршрутов пока нет. Открой раздел маршрутов и сохрани первую петлю.
        </div>
      </Card>
    </template>

    <template v-else>
      <Card class="p-4">
        <div class="mb-4 flex items-center gap-3">
          <Target class="h-5 w-5 text-[#111111]" />
          <div>
            <h2 class="font-medium">Цель и ориентиры</h2>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-2xl border border-[#e5e5df] bg-[#fbfbf9] p-3">
            <p class="text-xs text-[#767676]">Цель</p>
            <p class="mt-1 text-lg font-medium">{{ currentGoalLabel }}</p>
          </div>
          <div class="rounded-2xl border border-[#e5e5df] bg-[#fbfbf9] p-3">
            <p class="text-xs text-[#767676]">Макс. пульс</p>
            <p class="mt-1 text-lg font-medium">{{ store.profile.maxHeartRate || '—' }}</p>
          </div>
          <div class="rounded-2xl border border-[#e5e5df] bg-[#fbfbf9] p-3">
            <p class="text-xs text-[#767676]">Зон</p>
            <p class="mt-1 text-lg font-medium">{{ store.profile.zones.length }}</p>
          </div>
          <div class="rounded-2xl border border-[#e5e5df] bg-[#fbfbf9] p-3">
            <p class="text-xs text-[#767676]">Готовность</p>
            <p class="mt-1 text-lg font-medium">{{ store.readinessScore }}</p>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-3">
          <NuxtLink to="/profile" class="block">
            <Button class="w-full" variant="outline">Профиль</Button>
          </NuxtLink>
          <NuxtLink to="/heart-rate-zones" class="block">
            <Button class="w-full">Зоны</Button>
          </NuxtLink>
        </div>
      </Card>
    </template>

    <Teleport to="body">
      <div
        v-if="pendingDeleteWorkoutId"
        class="fixed inset-0 z-[10000] flex items-end bg-black/40 p-4 sm:items-center sm:justify-center"
        role="dialog"
        aria-modal="true"
      >
        <div class="w-full max-w-sm rounded-[24px] bg-white p-5 text-[#111111] shadow-2xl">
          <h2 class="text-xl font-medium">Удалить тренировку?</h2>
          <p class="mt-2 text-sm leading-5 text-[#767676]">
            Тренировка исчезнет из плана. Завершённые пробежки в истории не изменятся.
          </p>
          <div class="mt-5 grid grid-cols-2 gap-3">
            <Button variant="outline" @click="cancelDeleteWorkout">Отмена</Button>
            <Button variant="destructive" @click="confirmDeleteWorkout">Удалить</Button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.plan-input {
  min-width: 0;
  max-width: 100%;
}

input[type="date"].plan-input {
  -webkit-appearance: none;
  appearance: none;
}

input[type="date"].plan-input::-webkit-date-and-time-value {
  min-width: 0;
  text-align: left;
}
</style>
