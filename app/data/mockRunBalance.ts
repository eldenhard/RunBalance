import type { UserProfile } from '~/types/profile'
import type { RecoveryCheckIn } from '~/types/recovery'
import type { Route } from '~/types/route'
import type { Shoe } from '~/types/shoe'
import type { Workout } from '~/types/workout'
import type { TrackPoint } from '~/types/workout-session'
import { createDefaultHeartRateZones } from '~/services/heartRateZones'

export const mockProfile: UserProfile = {
  id: 'runner-1',
  displayName: 'Элден',
  goal: '10k',
  maxHeartRate: 190,
  trainingDays: [1, 3, 5],
  zones: createDefaultHeartRateZones(190)
}

export const mockRecovery: RecoveryCheckIn = {
  id: 'recovery-1',
  date: '2026-05-18',
  sleepQuality: 4,
  fatigue: 3,
  soreness: 'light',
  stress: 4,
  restingHeartRate: 54,
  hrvMs: 62,
  readinessScore: 78
}

export const mockShoes: Shoe[] = [
  {
    id: 'shoe-1',
    name: 'Daily Trainer',
    brand: 'Nike',
    model: 'Pegasus 41',
    startedAt: '2026-02-12',
    mileageKm: 312,
    resourceKm: 800,
    status: 'active'
  },
  {
    id: 'shoe-2',
    name: 'Tempo Pair',
    brand: 'ASICS',
    model: 'Novablast 4',
    startedAt: '2026-03-05',
    mileageKm: 128,
    resourceKm: 700,
    status: 'active'
  },
  {
    id: 'shoe-3',
    name: 'Old Reliable',
    brand: 'Saucony',
    model: 'Ride 16',
    startedAt: '2025-08-20',
    mileageKm: 718,
    resourceKm: 800,
    status: 'replace_soon'
  }
]

export const mockRoute: Route = {
  id: 'route-1',
  name: 'Парк и набережная',
  distanceKm: 6.2,
  type: 'loop',
  surface: 'асфальт + парк',
  elevationHint: 'минимум подъёмов',
  isPrivate: true,
  geojson: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { name: 'Парк и набережная' },
        geometry: {
          type: 'LineString',
          coordinates: [
            [37.6173, 55.7558],
            [37.622, 55.758],
            [37.629, 55.756],
            [37.624, 55.752],
            [37.6173, 55.7558]
          ]
        }
      }
    ]
  }
}

export const todayWorkout: Workout = {
  id: 'workout-today',
  type: 'easy',
  title: 'Лёгкий бег',
  plannedDurationMin: 42,
  plannedDistanceKm: 6,
  targetZoneId: 'z2',
  routeId: mockRoute.id,
  shoeId: 'shoe-1',
  heartRateSource: 'unavailable'
}

export const activeWorkout: Workout = {
  ...todayWorkout,
  id: 'workout-active',
  startedAt: '2026-05-18T07:20:00.000Z',
  distanceKm: 3.4,
  durationSec: 1530,
  avgPaceSecPerKm: 450,
  heartRateSource: 'unavailable'
}

export const mockActiveTrackPoints: TrackPoint[] = [
  { latitude: 55.7558, longitude: 37.6173, recordedAt: '2026-05-18T07:20:00.000Z' },
  { latitude: 55.758, longitude: 37.622, recordedAt: '2026-05-18T07:28:30.000Z' },
  { latitude: 55.756, longitude: 37.629, recordedAt: '2026-05-18T07:37:00.000Z' },
  { latitude: 55.752, longitude: 37.624, recordedAt: '2026-05-18T07:45:30.000Z' }
]

export const workoutHistory: Workout[] = [
  {
    id: 'history-1',
    title: 'Восстановительный бег',
    type: 'recovery',
    finishedAt: '2026-05-16T08:05:00.000Z',
    distanceKm: 4.8,
    durationSec: 2260,
    avgPaceSecPerKm: 471,
    shoeId: 'shoe-1'
  },
  {
    id: 'history-2',
    title: 'Темповый блок',
    type: 'tempo',
    finishedAt: '2026-05-14T17:30:00.000Z',
    distanceKm: 7.2,
    durationSec: 3060,
    avgPaceSecPerKm: 425,
    shoeId: 'shoe-2'
  },
  {
    id: 'history-3',
    title: 'Длинная спокойная',
    type: 'long',
    finishedAt: '2026-05-11T09:40:00.000Z',
    distanceKm: 12.4,
    durationSec: 6120,
    avgPaceSecPerKm: 494,
    shoeId: 'shoe-1'
  }
]
