import { describe, expect, it } from 'vitest'
import type { Workout } from '~/types/workout'
import { buildAnalyticsReport } from '~/services/analytics'

const referenceNow = new Date('2026-05-18T08:00:00.000Z')

const history: Workout[] = [
  {
    id: 'history-1',
    type: 'easy',
    title: 'Лёгкий бег',
    finishedAt: '2026-05-17T07:00:00.000Z',
    distanceKm: 6,
    durationSec: 36 * 60,
    avgPaceSecPerKm: 360
  },
  {
    id: 'history-2',
    type: 'long',
    title: 'Длинный бег',
    finishedAt: '2026-05-11T07:00:00.000Z',
    distanceKm: 14,
    durationSec: 84 * 60,
    avgPaceSecPerKm: 360
  },
  {
    id: 'history-3',
    type: 'tempo',
    title: 'Темповый бег',
    finishedAt: '2026-05-05T07:00:00.000Z',
    distanceKm: 8,
    durationSec: 40 * 60,
    avgPaceSecPerKm: 300
  }
]

describe('buildAnalyticsReport', () => {
  it('возвращает пустой отчёт при отсутствии истории', () => {
    const report = buildAnalyticsReport([], referenceNow)
    expect(report.summary.totalRuns).toBe(0)
    expect(report.summary.totalDistanceKm).toBe(0)
    expect(report.summary.avgPaceSecPerKm).toBeUndefined()
    expect(report.weeklyBuckets).toHaveLength(4)
  })

  it('собирает суммарные показатели по реальным тренировкам', () => {
    const report = buildAnalyticsReport(history, referenceNow)
    expect(report.summary.totalRuns).toBe(3)
    expect(report.summary.totalDistanceKm).toBeCloseTo(28, 5)
    expect(report.summary.longestRunKm).toBe(14)
    expect(report.summary.totalDurationSec).toBe((36 + 84 + 40) * 60)
    expect(report.summary.avgPaceSecPerKm).toBe(Math.round(((36 + 84 + 40) * 60) / 28))
    expect(report.summary.lastRunAt).toBe('2026-05-17T07:00:00.000Z')
  })

  it('распределяет тренировки по неделям', () => {
    const report = buildAnalyticsReport(history, referenceNow)
    const totals = report.weeklyBuckets.map((bucket) => bucket.distanceKm)
    expect(totals.reduce((sum, value) => sum + value, 0)).toBeCloseTo(28, 5)

    const currentWeek = report.weeklyBuckets[report.weeklyBuckets.length - 1]
    expect(currentWeek?.distanceKm).toBe(0)
    expect(currentWeek?.runs).toBe(0)

    const previousWeek = report.weeklyBuckets[report.weeklyBuckets.length - 2]
    expect(previousWeek?.distanceKm).toBe(20)
    expect(previousWeek?.runs).toBe(2)
  })

  it('игнорирует тренировки без даты завершения', () => {
    const report = buildAnalyticsReport([
      ...history,
      { id: 'draft', type: 'easy', title: 'Чёрная' }
    ], referenceNow)
    expect(report.summary.totalRuns).toBe(3)
  })
})
