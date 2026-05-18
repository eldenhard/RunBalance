import type { Workout } from '~/types/workout'

export type AnalyticsSummary = {
  totalRuns: number
  totalDistanceKm: number
  totalDurationSec: number
  avgPaceSecPerKm?: number
  longestRunKm: number
  lastRunAt?: string
}

export type WeeklyBucket = {
  weekStart: string
  weekLabel: string
  distanceKm: number
  durationSec: number
  runs: number
}

export type AnalyticsReport = {
  summary: AnalyticsSummary
  weeklyBuckets: WeeklyBucket[]
}

export function buildAnalyticsReport(history: Workout[], now = new Date()): AnalyticsReport {
  const completed = history.filter((workout) => Boolean(workout.finishedAt))

  if (!completed.length) {
    return {
      summary: {
        totalRuns: 0,
        totalDistanceKm: 0,
        totalDurationSec: 0,
        longestRunKm: 0
      },
      weeklyBuckets: buildWeeklySkeleton(now)
    }
  }

  let totalDistanceKm = 0
  let totalDurationSec = 0
  let longestRunKm = 0
  let lastRunAt: string | undefined

  for (const workout of completed) {
    const distance = workout.distanceKm ?? 0
    const duration = workout.durationSec ?? 0
    totalDistanceKm += distance
    totalDurationSec += duration
    longestRunKm = Math.max(longestRunKm, distance)
    if (workout.finishedAt && (!lastRunAt || workout.finishedAt > lastRunAt)) {
      lastRunAt = workout.finishedAt
    }
  }

  const avgPaceSecPerKm = totalDistanceKm > 0
    ? Math.round(totalDurationSec / totalDistanceKm)
    : undefined

  return {
    summary: {
      totalRuns: completed.length,
      totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
      totalDurationSec,
      avgPaceSecPerKm,
      longestRunKm: Number(longestRunKm.toFixed(2)),
      lastRunAt
    },
    weeklyBuckets: buildWeeklyBuckets(completed, now)
  }
}

function buildWeeklySkeleton(now: Date): WeeklyBucket[] {
  const weeks: WeeklyBucket[] = []
  for (let weeksBack = 3; weeksBack >= 0; weeksBack -= 1) {
    const reference = new Date(now)
    reference.setDate(reference.getDate() - weeksBack * 7)
    const weekStart = startOfIsoWeek(reference)
    weeks.push({
      weekStart: weekStart.toISOString().slice(0, 10),
      weekLabel: formatWeekLabel(weekStart),
      distanceKm: 0,
      durationSec: 0,
      runs: 0
    })
  }
  return weeks
}

function buildWeeklyBuckets(workouts: Workout[], now: Date): WeeklyBucket[] {
  const skeleton = buildWeeklySkeleton(now)
  const index = new Map(skeleton.map((bucket) => [bucket.weekStart, bucket]))

  for (const workout of workouts) {
    const finishedAt = workout.finishedAt ?? workout.startedAt
    if (!finishedAt) continue
    const weekKey = startOfIsoWeek(new Date(finishedAt)).toISOString().slice(0, 10)
    const bucket = index.get(weekKey)
    if (!bucket) continue
    bucket.distanceKm = Number((bucket.distanceKm + (workout.distanceKm ?? 0)).toFixed(2))
    bucket.durationSec += workout.durationSec ?? 0
    bucket.runs += 1
  }

  return skeleton
}

function startOfIsoWeek(date: Date): Date {
  const cloned = new Date(date)
  cloned.setHours(0, 0, 0, 0)
  const day = cloned.getDay()
  const diffToMonday = (day + 6) % 7
  cloned.setDate(cloned.getDate() - diffToMonday)
  return cloned
}

function formatWeekLabel(weekStart: Date): string {
  const month = weekStart.toLocaleDateString('ru-RU', { month: 'short' })
  const day = weekStart.getDate()
  return `с ${day} ${month}`
}
