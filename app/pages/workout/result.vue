<script setup lang="ts">
import { Footprints, History, Home, MapPinned, Play } from '@lucide/vue'
import { createRouteFromTrack } from '~/services/routes'

const store = useRunBalanceStore()
const workout = computed(() => store.currentWorkout)
const resultRoute = computed(() => {
  const trackPoints = store.activeSession?.trackPoints ?? []
  if (trackPoints.length >= 2 && store.activeRoute) {
    return createRouteFromTrack(trackPoints, store.activeRoute)
  }
  return store.activeRoute
})
</script>

<template>
  <div class="theme-light space-y-4 p-4">
    <ScreenHeader eyebrow="Результат" title="Пробежка сохранена локально" />

    <Card class="p-4">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <p class="text-sm text-[#767676]">Дистанция</p>
          <p class="text-3xl font-medium">{{ formatDistance(workout.distanceKm) }}</p>
        </div>
        <div>
          <p class="text-sm text-[#767676]">Время</p>
          <p class="text-3xl font-medium">{{ formatDuration(workout.durationSec) }}</p>
        </div>
        <div>
          <p class="text-sm text-[#767676]">Средний темп</p>
          <p class="text-2xl font-medium">{{ formatPace(workout.avgPaceSecPerKm) }}</p>
        </div>
        <div>
          <p class="text-sm text-[#767676]">Пульс</p>
          <p class="text-2xl font-medium">—</p>
        </div>
      </div>
    </Card>

    <Card v-if="resultRoute" class="overflow-hidden p-0">
      <ClientOnly>
        <RouteMap :route="resultRoute" class="h-44 w-full" />
      </ClientOnly>
      <div class="flex items-center gap-3 p-4">
        <MapPinned class="h-5 w-5 text-slate-500" />
        <div>
          <h2 class="font-medium">{{ resultRoute.name }}</h2>
          <p class="text-sm text-[#767676]">
            {{ store.activeSession?.trackPoints.length ? 'Трек собран из реальных GPS-точек сессии.' : 'GPS-точки не сохранились — показываем плановый маршрут.' }}
          </p>
        </div>
      </div>
    </Card>

    <Card v-if="store.selectedShoe" class="p-4">
      <div class="flex items-center gap-3">
        <Footprints class="h-5 w-5 text-slate-500" />
        <div>
          <h2 class="font-medium">{{ store.selectedShoe.name }}</h2>
          <p class="text-sm text-[#767676]">+{{ workout.distanceKm?.toFixed(1) ?? '0' }} км к ресурсу пары</p>
        </div>
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
