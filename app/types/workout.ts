import type { HeartRateSourceStatus } from './heart-rate'

export type WorkoutType = 'easy' | 'recovery' | 'long' | 'tempo' | 'intervals' | 'fartlek' | 'free'

export type Workout = {
  id: string
  type: WorkoutType
  title: string
  scheduledDate?: string
  plannedDurationMin?: number
  plannedDistanceKm?: number
  targetZoneId?: string
  routeId?: string
  shoeId?: string
  startedAt?: string
  finishedAt?: string
  distanceKm?: number
  durationSec?: number
  avgPaceSecPerKm?: number
  avgHeartRate?: number
  maxHeartRate?: number
  heartRateSource?: HeartRateSourceStatus
}
