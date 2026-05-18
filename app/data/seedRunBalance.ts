import type { UserProfile } from '~/types/profile'
import type { RecoveryCheckIn } from '~/types/recovery'
import type { Route } from '~/types/route'
import type { Shoe } from '~/types/shoe'
import type { Workout } from '~/types/workout'
import { createDefaultHeartRateZones } from '~/services/heartRateZones'

export const seedProfile: UserProfile = {
  id: 'runner-1',
  displayName: 'Элден',
  goal: '10k',
  maxHeartRate: 190,
  trainingDays: [1, 3, 5],
  zones: createDefaultHeartRateZones(190).map((zone) => ({
    ...zone,
    color: zone.id
  }))
}

export const seedRecovery: RecoveryCheckIn = {
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

export const seedShoes: Shoe[] = [
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
  }
]

function makeEmptyRouteGeojson(name: string): Route['geojson'] {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { name },
        geometry: {
          type: 'LineString',
          coordinates: []
        }
      }
    ]
  }
}

export const seedRoute: Route = {
  id: 'route-1',
  name: 'Парк и набережная',
  distanceKm: 6.2,
  type: 'loop',
  surface: 'асфальт + парк',
  elevationHint: 'минимум подъёмов',
  isPrivate: true,
  notes: 'Любимое петлевое кольцо рядом с домом.',
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

export const seedRoutes: Route[] = [
  seedRoute,
  {
    id: 'route-2',
    name: 'Короткий кружок',
    distanceKm: 3.4,
    type: 'loop',
    surface: 'парк',
    elevationHint: 'плоский',
    isPrivate: true,
    notes: 'Подходит для восстановительных пробежек.',
    geojson: makeEmptyRouteGeojson('Короткий кружок')
  },
  {
    id: 'route-3',
    name: 'Длинная набережная',
    distanceKm: 12.5,
    type: 'out_and_back',
    surface: 'асфальт',
    elevationHint: 'минимум подъёмов',
    isPrivate: true,
    notes: 'Туда-обратно вдоль воды для длинных тренировок.',
    geojson: makeEmptyRouteGeojson('Длинная набережная')
  }
]

export const seedPlannedWorkouts: Workout[] = [
  {
    id: 'workout-plan-1',
    type: 'easy',
    title: 'Лёгкий бег',
    scheduledDate: '2026-05-18',
    plannedDurationMin: 42,
    plannedDistanceKm: 6,
    targetZoneId: 'z2',
    routeId: seedRoute.id,
    shoeId: 'shoe-1',
    heartRateSource: 'unavailable'
  }
]

export const seedHistory: Workout[] = []
