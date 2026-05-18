import { describe, expect, it } from 'vitest'
import type { Route } from '~/types/route'
import type { TrackPoint } from '~/types/workout-session'
import { createRoute, createRouteFromTrack, getRouteBounds, getRouteLineCoordinates, pickSuggestedRoute } from '~/services/routes'

const routes: Route[] = [
  {
    id: 'route-short',
    name: 'Короткий кружок',
    distanceKm: 3,
    type: 'loop',
    surface: 'парк',
    elevationHint: 'плоский',
    isPrivate: true,
    geojson: { type: 'FeatureCollection', features: [] }
  },
  {
    id: 'route-mid',
    name: 'Средний маршрут',
    distanceKm: 6,
    type: 'loop',
    surface: 'асфальт',
    elevationHint: 'минимум подъёмов',
    isPrivate: true,
    geojson: { type: 'FeatureCollection', features: [] }
  },
  {
    id: 'route-long',
    name: 'Длинный маршрут',
    distanceKm: 12,
    type: 'out_and_back',
    surface: 'асфальт',
    elevationHint: 'минимум подъёмов',
    isPrivate: true,
    geojson: { type: 'FeatureCollection', features: [] }
  }
]

describe('createRoute', () => {
  it('собирает корректные значения по умолчанию', () => {
    const route = createRoute({ name: '  Тестовая петля  ', distanceKm: 5.123, type: 'loop' })
    expect(route).toMatchObject({
      name: 'Тестовая петля',
      distanceKm: 5.12,
      type: 'loop',
      isPrivate: true,
      surface: 'не указано',
      elevationHint: 'нет данных'
    })
    expect(route.id.startsWith('route-')).toBe(true)
    expect(route.geojson.features.length).toBe(1)
  })

  it('подставляет минимальные значения при пустых входных данных', () => {
    const route = createRoute({ name: '', distanceKm: 0, type: 'free' })
    expect(route.name).toBe('Новый маршрут')
    expect(route.distanceKm).toBe(0)
  })
})

describe('pickSuggestedRoute', () => {
  it('возвращает undefined для пустого списка', () => {
    expect(pickSuggestedRoute([])).toBeUndefined()
  })

  it('возвращает первый маршрут, если плановая дистанция не задана', () => {
    expect(pickSuggestedRoute(routes)?.id).toBe('route-short')
  })

  it('выбирает маршрут с ближайшей дистанцией к плановой', () => {
    expect(pickSuggestedRoute(routes, 5.5)?.id).toBe('route-mid')
    expect(pickSuggestedRoute(routes, 10)?.id).toBe('route-long')
    expect(pickSuggestedRoute(routes, 2)?.id).toBe('route-short')
  })
})

const sampleRoute: Route = {
  id: 'route-sample',
  name: 'Тестовый',
  distanceKm: 4,
  type: 'loop',
  surface: 'парк',
  elevationHint: 'плоский',
  isPrivate: true,
  geojson: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [
            [37.6, 55.7],
            [37.62, 55.71],
            [37.61, 55.73]
          ]
        }
      }
    ]
  }
}

describe('route geometry helpers', () => {
  it('собирает координаты линии маршрута', () => {
    expect(getRouteLineCoordinates(sampleRoute)).toEqual([
      [37.6, 55.7],
      [37.62, 55.71],
      [37.61, 55.73]
    ])
  })

  it('считает bounding box по точкам', () => {
    expect(getRouteBounds(sampleRoute)).toEqual([
      [37.6, 55.7],
      [37.62, 55.73]
    ])
  })

  it('возвращает null для маршрута без точек', () => {
    expect(getRouteBounds({
      ...sampleRoute,
      geojson: {
        type: 'FeatureCollection',
        features: [
          { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } }
        ]
      }
    })).toBeNull()
  })

  it('строит маршрут из реальных GPS-точек сессии', () => {
    const trackPoints: TrackPoint[] = [
      { recordedAt: '2026-05-18T08:00:00Z', latitude: 55.7, longitude: 37.6 },
      { recordedAt: '2026-05-18T08:00:05Z', latitude: 55.71, longitude: 37.62 }
    ]
    const result = createRouteFromTrack(trackPoints, sampleRoute)
    expect(result.id).toBe('route-sample-track')
    expect(getRouteLineCoordinates(result)).toEqual([
      [37.6, 55.7],
      [37.62, 55.71]
    ])
  })
})
