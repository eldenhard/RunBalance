import { describe, expect, it } from 'vitest'
import {
  createWorkoutSession,
  finishWorkoutSession,
  getWorkoutSessionProgress,
  restoreWorkoutSession,
  serializeWorkoutSession,
  updateWorkoutSessionMetrics
} from '~/services/workoutSession'
import type { Workout } from '~/types/workout'

const plannedWorkout: Workout = {
  id: 'workout-today',
  type: 'easy',
  title: 'Лёгкий бег',
  plannedDurationMin: 40,
  plannedDistanceKm: 5,
  targetZoneId: 'z2',
  routeId: 'route-1',
  shoeId: 'shoe-1'
}

describe('workout session helpers', () => {
  it('creates an active local-first session from a planned workout', () => {
    const session = createWorkoutSession(plannedWorkout, '2026-05-18T10:00:00.000Z')

    expect(session).toMatchObject({
      id: 'session-workout-today',
      workoutId: 'workout-today',
      status: 'active',
      startedAt: '2026-05-18T10:00:00.000Z',
      distanceKm: 0,
      durationSec: 0
    })
  })

  it('updates distance, duration and pace from track points', () => {
    const session = createWorkoutSession(plannedWorkout, '2026-05-18T10:00:00.000Z')
    session.trackPoints = [
      { latitude: 55.7558, longitude: 37.6173, recordedAt: '2026-05-18T10:00:00.000Z' },
      { latitude: 55.758, longitude: 37.622, recordedAt: '2026-05-18T10:06:00.000Z' }
    ]

    const updated = updateWorkoutSessionMetrics(session, '2026-05-18T10:06:00.000Z')

    expect(updated.durationSec).toBe(360)
    expect(updated.distanceKm).toBeCloseTo(0.35, 1)
    expect(updated.avgPaceSecPerKm).toBeGreaterThan(900)
  })

  it('calculates progress by planned duration and distance', () => {
    const session = {
      ...createWorkoutSession(plannedWorkout, '2026-05-18T10:00:00.000Z'),
      distanceKm: 2.5,
      durationSec: 1200
    }

    expect(getWorkoutSessionProgress(session, plannedWorkout)).toBe(50)
  })

  it('serializes and restores active session snapshots', () => {
    const session = createWorkoutSession(plannedWorkout, '2026-05-18T10:00:00.000Z')

    expect(restoreWorkoutSession(serializeWorkoutSession(session))).toEqual(session)
  })

  it('creates a finished workout summary from the session', () => {
    const session = {
      ...createWorkoutSession(plannedWorkout, '2026-05-18T10:00:00.000Z'),
      distanceKm: 5.2,
      durationSec: 2400,
      avgPaceSecPerKm: 462
    }

    expect(finishWorkoutSession(session, plannedWorkout, '2026-05-18T10:40:00.000Z')).toMatchObject({
      id: 'workout-today',
      finishedAt: '2026-05-18T10:40:00.000Z',
      distanceKm: 5.2,
      durationSec: 2400,
      avgPaceSecPerKm: 462
    })
  })
})
