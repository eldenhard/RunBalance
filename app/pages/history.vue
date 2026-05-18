<script setup lang="ts">
import { BarChart3 } from '@lucide/vue'

const store = useRunBalanceStore()
const summary = computed(() => store.analyticsReport.summary)

function formatRunDate(workout: { finishedAt?: string, scheduledDate?: string }) {
  const source = workout.finishedAt ?? workout.scheduledDate
  if (!source) return '—'
  return new Date(source).toLocaleDateString('ru-RU')
}
</script>

<template>
  <div class="theme-light space-y-4 p-4">
    <ScreenHeader eyebrow="История" title="Последние пробежки" description="Только реально завершённые тренировки и их собственные метрики." />

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
      <Card v-for="workout in store.history" :key="workout.id" class="p-4">
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

    <Card v-else class="p-4 text-sm text-[#767676]">
      История пока пустая. После первой завершённой тренировки результаты появятся здесь.
    </Card>
  </div>
</template>
