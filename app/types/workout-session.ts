import type { WorkoutType } from './workout'

export type WorkoutSessionStatus = 'idle' | 'active' | 'paused' | 'finished'

export type TrackPoint = {
  latitude: number
  longitude: number
  recordedAt: string
  accuracyM?: number
}

export type WorkoutSession = {
  id: string
  workoutId: string
  status: WorkoutSessionStatus
  workoutType: WorkoutType
  startedAt: string
  pausedAt?: string
  finishedAt?: string
  distanceKm: number
  durationSec: number
  avgPaceSecPerKm?: number
  trackPoints: TrackPoint[]
  lastAlertAtSec: Partial<Record<WorkoutAlertKind, number>>
  visualAlert?: WorkoutAlert
}

export type WorkoutAlertKind = 'heart_rate_high' | 'heart_rate_low' | 'pace_fast' | 'stage_started'

export type WorkoutAlert = {
  kind: WorkoutAlertKind
  message: string
  createdAtSec: number
}
