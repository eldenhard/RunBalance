<script setup lang="ts">
import { Activity, ArrowRight, ChevronRight, Heart, MapPinned, Play, ShieldCheck, Sparkles } from '@lucide/vue'

const store = useRunBalanceStore()
const hasRecovery = computed(() => store.recovery !== null)
const hasPlan = computed(() => store.plannedWorkouts.length > 0)
</script>

<template>
  <div class="theme-light space-y-4 p-4">
    <ScreenHeader
      eyebrow="Сегодня"
      :title="store.profile.displayName ? `Привет, ${store.profile.displayName}` : 'Готов к пробежке'"
    />

    <NuxtLink v-if="store.needsOnboarding" to="/welcome" class="block">
      <Card class="border-[#deded9] bg-white p-4">
        <div class="flex items-start gap-3">
          <Sparkles class="mt-0.5 h-5 w-5 text-[#111111]" />
          <div class="flex-1">
            <p class="text-xs text-[#767676]">Знакомство</p>
            <h2 class="mt-1 font-medium">Настрой профиль за минуту</h2>
          </div>
          <ChevronRight class="mt-1 h-5 w-5 text-[#767676]" />
        </div>
      </Card>
    </NuxtLink>

    <Card v-if="hasRecovery" class="border-[#d7edc6] bg-[#fbfff2] p-4">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-xs text-[#767676]">Готовность</p>
          <div class="mt-1 text-[44px] font-medium leading-none text-[#111111]">{{ store.readinessScore }}</div>
        </div>
        <Badge variant="success">{{ store.recoveryRecommendation.title }}</Badge>
      </div>
      <Progress class="mt-4" :value="store.readinessScore" />
      <p class="mt-3 text-sm leading-5 text-[#62625e]">{{ store.recoveryRecommendation.message }}</p>
    </Card>

    <NuxtLink v-else to="/recovery" class="block">
      <Card class="p-4">
        <div class="flex items-start gap-3">
          <Heart class="mt-0.5 h-5 w-5 text-[#111111]" />
          <div class="flex-1">
            <p class="text-xs text-[#767676]">Восстановление</p>
            <h2 class="mt-1 font-medium">Сделай check-in за 20 секунд</h2>
          </div>
          <ChevronRight class="mt-1 h-5 w-5 text-[#767676]" />
        </div>
      </Card>
    </NuxtLink>

    <Card class="overflow-hidden border-[#d9e8ff] bg-white p-4">
      <div class="-mx-4 -mt-4 mb-4 h-1.5 bg-gradient-to-r from-[#b9ff38] via-[#64c7ff] to-[#ff7a2b]" />
      <div class="mb-4 flex items-center justify-between">
        <div class="min-w-0">
          <p class="text-xs text-[#767676]">Тренировка дня</p>
          <h2 class="text-xl font-medium text-[#111111]">{{ hasPlan ? store.adaptedWorkout.title : 'План пуст' }}</h2>
          <p class="mt-1 text-sm text-[#767676]">
            <template v-if="hasPlan">{{ store.selectedWorkoutId ? `Запланирована на ${store.workoutOfTheDay.scheduledDate ?? 'сегодня'}` : 'Базовый шаблон без даты' }}</template>
            <template v-else>Создай первую тренировку или сразу беги свободным.</template>
          </p>
        </div>
        <Activity class="h-6 w-6 shrink-0 text-[#ff7a2b]" />
      </div>

      <div v-if="hasPlan" class="grid grid-cols-2 gap-3">
        <div class="rounded-2xl border border-[#deded9] bg-[#f7f7f5] p-3">
          <p class="text-xs text-[#767676]">Дистанция</p>
          <p class="text-lg font-medium">{{ store.adaptedWorkout.plannedDistanceKm ?? '—' }} км</p>
        </div>
        <div class="rounded-2xl border border-[#deded9] bg-[#f7f7f5] p-3">
          <p class="text-xs text-[#767676]">Время</p>
          <p class="text-lg font-medium">{{ store.adaptedWorkout.plannedDurationMin ?? '—' }} мин</p>
        </div>
        <div class="rounded-2xl border border-[#deded9] bg-[#f7f7f5] p-3">
          <p class="text-xs text-[#767676]">Зона</p>
          <p class="text-lg font-medium">{{ store.adaptedWorkout.targetZoneId?.toUpperCase() ?? '—' }}</p>
        </div>
        <div class="rounded-2xl border border-[#deded9] bg-[#f7f7f5] p-3">
          <p class="text-xs text-[#767676]">Кроссовки</p>
          <p class="truncate text-lg font-medium">{{ store.selectedShoe?.name ?? '—' }}</p>
        </div>
      </div>

      <NuxtLink v-else to="/plan" class="mt-2 block">
        <Button class="w-full" variant="outline">
          <ArrowRight class="h-4 w-4" />
          Перейти в План
        </Button>
      </NuxtLink>

      <p v-if="hasPlan" class="mt-3 text-sm text-[#62625e]">{{ store.adaptedWorkout.adaptationReason }}</p>
    </Card>

    <NuxtLink to="/routes" class="block">
      <Card v-if="store.activeRoute" class="overflow-hidden p-0">
        <ClientOnly>
          <RouteMap :route="store.activeRoute" class="h-40 w-full" />
        </ClientOnly>
        <div class="flex items-center gap-3 p-4">
          <MapPinned class="h-5 w-5 text-[#22c55e]" />
          <div class="min-w-0 flex-1">
            <h2 class="font-medium text-[#111111]">{{ store.activeRoute.name }}</h2>
            <p class="text-sm text-[#767676]">{{ store.activeRoute.distanceKm }} км · {{ store.activeRoute.surface }} · {{ store.activeRoute.elevationHint }}</p>
          </div>
        </div>
      </Card>
      <Card v-else class="p-4">
        <div class="flex items-start gap-3">
          <MapPinned class="mt-0.5 h-5 w-5 text-slate-500" />
          <div class="flex-1">
            <p class="text-xs text-[#767676]">Маршрут</p>
            <h2 class="mt-1 font-medium">Добавь первый маршрут</h2>
          </div>
          <ChevronRight class="mt-1 h-5 w-5 text-[#767676]" />
        </div>
      </Card>
    </NuxtLink>

    <Card class="border-[#deded9] bg-white p-4">
      <div class="flex gap-3">
        <ShieldCheck class="mt-0.5 h-5 w-5 shrink-0 text-[#767676]" />
        <p class="text-sm text-[#62625e]">
          Пульс пока не подключён. Эта версия работает по GPS.
        </p>
      </div>
    </Card>

    <NuxtLink to="/start">
      <Button class="w-full" size="lg">
        <Play class="h-5 w-5" />
        Начать тренировку
      </Button>
    </NuxtLink>
  </div>
</template>
