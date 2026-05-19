import type { Workout, WorkoutSplit } from '~/types/workout'
import type { TrackPoint, WorkoutSession } from '~/types/workout-session'

const EARTH_RADIUS_KM = 6371
const MAX_POINT_ACCURACY_M = 30
const MIN_MOVEMENT_M = 8
const MAX_RUNNING_SPEED_M_PER_SEC = 8
const SPLIT_DISTANCE_KM = 1
const DISTANCE_EPSILON_KM = 0.00001

export function createWorkoutSession(workout: Workout, startedAt: string): WorkoutSession {
  return {
    id: `session-${workout.id}`,
    workoutId: workout.id,
    status: 'active',
    workoutType: workout.type,
    startedAt,
    distanceKm: 0,
    durationSec: 0,
    splits: [],
    trackPoints: [],
    lastAlertAtSec: {}
  }
}

export function calculateTrackDistanceKm(trackPoints: TrackPoint[]) {
  let distance = 0
  for (let index = 1; index < trackPoints.length; index += 1) {
    const previousPoint = trackPoints[index - 1]
    const point = trackPoints[index]
    if (previousPoint && point && shouldCountTrackSegment(previousPoint, point)) {
      distance += getDistanceBetweenPointsKm(previousPoint, point)
    }
  }

  return Number(distance.toFixed(2))
}

export function calculateWorkoutSplits(trackPoints: TrackPoint[], startedAt: string): WorkoutSplit[] {
  const startedAtMs = new Date(startedAt).getTime()
  if (!Number.isFinite(startedAtMs) || trackPoints.length < 2) {
    return []
  }

  const splits: WorkoutSplit[] = []
  let totalDistanceKm = 0
  let currentSplitStartDistanceKm = 0
  let currentSplitStartMs = startedAtMs
  let nextSplitDistanceKm = SPLIT_DISTANCE_KM
  let lastCountedPointMs = startedAtMs

  for (let index = 1; index < trackPoints.length; index += 1) {
    const previousPoint = trackPoints[index - 1]
    const point = trackPoints[index]

    if (!previousPoint || !point || !shouldCountTrackSegment(previousPoint, point)) {
      continue
    }

    const segmentDistanceKm = getDistanceBetweenPointsKm(previousPoint, point)
    if (segmentDistanceKm <= 0) {
      continue
    }

    const segmentStartDistanceKm = totalDistanceKm
    const segmentEndDistanceKm = totalDistanceKm + segmentDistanceKm
    const segmentStartMs = Math.max(startedAtMs, getTrackPointTimeMs(previousPoint, startedAtMs))
    const segmentEndMs = Math.max(segmentStartMs, getTrackPointTimeMs(point, segmentStartMs))

    while (nextSplitDistanceKm <= segmentEndDistanceKm + DISTANCE_EPSILON_KM) {
      const splitEndMs = interpolateSegmentTimeMs(
        segmentStartMs,
        segmentEndMs,
        nextSplitDistanceKm - segmentStartDistanceKm,
        segmentDistanceKm
      )

      splits.push(createWorkoutSplit(splits.length + 1, SPLIT_DISTANCE_KM, splitEndMs - currentSplitStartMs))
      currentSplitStartDistanceKm = nextSplitDistanceKm
      currentSplitStartMs = splitEndMs
      nextSplitDistanceKm += SPLIT_DISTANCE_KM
    }

    totalDistanceKm = segmentEndDistanceKm
    lastCountedPointMs = segmentEndMs
  }

  const remainingDistanceKm = totalDistanceKm - currentSplitStartDistanceKm
  if (remainingDistanceKm > DISTANCE_EPSILON_KM) {
    splits.push(createWorkoutSplit(splits.length + 1, remainingDistanceKm, lastCountedPointMs - currentSplitStartMs))
  }

  return splits
}

export function updateWorkoutSessionMetrics(session: WorkoutSession, now: string): WorkoutSession {
  const durationSec = Math.max(0, Math.round((new Date(now).getTime() - new Date(session.startedAt).getTime()) / 1000))
  const distanceKm = calculateTrackDistanceKm(session.trackPoints)
  const avgPaceSecPerKm = distanceKm > 0 ? Math.round(durationSec / distanceKm) : undefined
  const splits = calculateWorkoutSplits(session.trackPoints, session.startedAt)

  return {
    ...session,
    distanceKm,
    durationSec,
    avgPaceSecPerKm,
    splits
  }
}

export function getWorkoutSessionProgress(session: WorkoutSession, workout: Workout) {
  const distanceProgress = workout.plannedDistanceKm
    ? (session.distanceKm / workout.plannedDistanceKm) * 100
    : 0
  const durationProgress = workout.plannedDurationMin
    ? (session.durationSec / (workout.plannedDurationMin * 60)) * 100
    : 0

  return Math.min(100, Math.round(Math.max(distanceProgress, durationProgress)))
}

export function serializeWorkoutSession(session: WorkoutSession) {
  return JSON.stringify(session)
}

export function restoreWorkoutSession(snapshot: string | null) {
  if (!snapshot) return null
  return JSON.parse(snapshot) as WorkoutSession
}

export function finishWorkoutSession(session: WorkoutSession, workout: Workout, finishedAt: string): Workout {
  const splits = session.splits ?? calculateWorkoutSplits(session.trackPoints, session.startedAt)

  return {
    ...workout,
    startedAt: session.startedAt,
    finishedAt,
    distanceKm: session.distanceKm,
    durationSec: session.durationSec,
    avgPaceSecPerKm: session.avgPaceSecPerKm,
    splits
  }
}

function createWorkoutSplit(index: number, distanceKm: number, durationMs: number): WorkoutSplit {
  const roundedDistanceKm = Number(distanceKm.toFixed(3))
  const durationSec = Math.max(0, Math.round(durationMs / 1000))

  return {
    index,
    distanceKm: roundedDistanceKm,
    durationSec,
    paceSecPerKm: roundedDistanceKm > 0 ? Math.round(durationSec / roundedDistanceKm) : undefined
  }
}

function interpolateSegmentTimeMs(segmentStartMs: number, segmentEndMs: number, distanceIntoSegmentKm: number, segmentDistanceKm: number) {
  const ratio = Math.min(1, Math.max(0, distanceIntoSegmentKm / segmentDistanceKm))
  return Math.round(segmentStartMs + (segmentEndMs - segmentStartMs) * ratio)
}

function getTrackPointTimeMs(point: TrackPoint, fallbackMs: number) {
  const timeMs = new Date(point.recordedAt).getTime()
  return Number.isFinite(timeMs) ? timeMs : fallbackMs
}

function getDistanceBetweenPointsKm(from: TrackPoint, to: TrackPoint) {
  const deltaLat = toRadians(to.latitude - from.latitude)
  const deltaLon = toRadians(to.longitude - from.longitude)
  const fromLat = toRadians(from.latitude)
  const toLat = toRadians(to.latitude)

  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(deltaLon / 2) ** 2

  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
}

function toRadians(value: number) {
  return (value * Math.PI) / 180
}

function shouldCountTrackSegment(from: TrackPoint, to: TrackPoint) {
  if ((from.accuracyM ?? 0) > MAX_POINT_ACCURACY_M || (to.accuracyM ?? 0) > MAX_POINT_ACCURACY_M) {
    return false
  }

  const distanceKm = getDistanceBetweenPointsKm(from, to)
  const distanceM = distanceKm * 1000
  const accuracyFloorM = Math.max(
    MIN_MOVEMENT_M,
    Math.round((((from.accuracyM ?? MIN_MOVEMENT_M) + (to.accuracyM ?? MIN_MOVEMENT_M)) / 2) * 0.6)
  )

  if (distanceM < accuracyFloorM) {
    return false
  }

  const elapsedSec = Math.max(
    1,
    Math.round((new Date(to.recordedAt).getTime() - new Date(from.recordedAt).getTime()) / 1000)
  )

  return distanceM / elapsedSec <= MAX_RUNNING_SPEED_M_PER_SEC
}
