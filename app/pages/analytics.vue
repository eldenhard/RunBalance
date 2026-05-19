<script setup lang="ts">
import { CalendarRange, Flame } from '@lucide/vue'

const store = useRunBalanceStore()
const report = computed(() => store.analyticsReport)
const maxWeeklyDistance = computed(() => {
  const distances = report.value.weeklyBuckets.map((bucket) => bucket.distanceKm)
  const max = Math.max(...distances, 0)
  return max > 0 ? max : 1
})
</script>

<template>
  <div class="theme-light min-h-dvh space-y-4 p-4">
    <ScreenHeader
      eyebrow="Аналитика"
      title="Локальные показатели"
    />

    <Card class="p-4">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <p class="text-xs text-[#767676]">Пробежек</p>
          <p class="mt-1 text-[28px] font-medium leading-none">{{ report.summary.totalRuns }}</p>
        </div>
        <div>
          <p class="text-xs text-[#767676]">Всего</p>
          <p class="mt-1 text-[28px] font-medium leading-none">{{ formatDistance(report.summary.totalDistanceKm) }}</p>
        </div>
        <div>
          <p class="text-xs text-[#767676]">В движении</p>
          <p class="mt-1 text-lg font-medium">{{ formatDuration(report.summary.totalDurationSec) }}</p>
        </div>
        <div>
          <p class="text-xs text-[#767676]">Средний темп</p>
          <p class="mt-1 text-lg font-medium">{{ formatPace(report.summary.avgPaceSecPerKm) }}</p>
        </div>
        <div>
          <p class="text-xs text-[#767676]">Самая длинная</p>
          <p class="mt-1 text-lg font-medium">{{ formatDistance(report.summary.longestRunKm) }}</p>
        </div>
        <div>
          <p class="text-xs text-[#767676]">Последняя</p>
          <p class="mt-1 text-lg font-medium">
            {{ report.summary.lastRunAt ? new Date(report.summary.lastRunAt).toLocaleDateString('ru-RU') : '—' }}
          </p>
        </div>
      </div>
    </Card>

    <Card class="p-4">
      <div class="mb-3 flex items-center gap-3">
        <CalendarRange class="h-5 w-5 text-[#111111]" />
        <div>
          <h2 class="font-medium">Последние 4 недели</h2>
        </div>
      </div>

      <div class="space-y-3">
        <div v-for="bucket in report.weeklyBuckets" :key="bucket.weekStart">
          <div class="flex items-baseline justify-between text-sm">
            <span class="text-[#62625e]">{{ bucket.weekLabel }}</span>
            <span class="font-medium">{{ formatDistance(bucket.distanceKm) }} · {{ bucket.runs }} б.</span>
          </div>
          <div class="mt-1 h-2 rounded-full bg-[#f0f0ed]">
            <div
              class="h-full rounded-full bg-[#111111]"
              :style="{ width: `${Math.round((bucket.distanceKm / maxWeeklyDistance) * 100)}%` }"
            />
          </div>
        </div>
      </div>
    </Card>

    <Card v-if="!report.summary.totalRuns" class="p-4">
      <div class="flex gap-3">
        <Flame class="mt-0.5 h-5 w-5 shrink-0 text-[#62625e]" />
        <p class="text-sm leading-5 text-[#62625e]">
          После первой завершённой тренировки здесь появятся реальные итоги. Свободный бег тоже учитывается.
        </p>
      </div>
    </Card>
  </div>
</template>
