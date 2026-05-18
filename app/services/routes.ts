import type { Feature, LineString } from 'geojson'
import type { Route, RouteType } from '~/types/route'
import type { TrackPoint } from '~/types/workout-session'

export type RouteDraft = {
  name: string
  distanceKm: number
  type: RouteType
  surface?: string
  elevationHint?: string
  notes?: string
}

export function createRoute(draft: RouteDraft): Route {
  const safeName = draft.name.trim() || 'Новый маршрут'
  const safeDistance = Number.isFinite(draft.distanceKm) && draft.distanceKm > 0
    ? Number(draft.distanceKm.toFixed(2))
    : 0

  return {
    id: `route-${Date.now()}`,
    name: safeName,
    distanceKm: safeDistance,
    type: draft.type,
    surface: draft.surface?.trim() || 'не указано',
    elevationHint: draft.elevationHint?.trim() || 'нет данных',
    isPrivate: true,
    notes: draft.notes?.trim() || undefined,
    geojson: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: safeName },
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        }
      ]
    }
  }
}

export function pickSuggestedRoute(routes: Route[], targetDistanceKm?: number): Route | undefined {
  if (!routes.length) return undefined
  if (!targetDistanceKm || targetDistanceKm <= 0) return routes[0]

  return routes.slice().sort((left, right) => {
    return Math.abs(left.distanceKm - targetDistanceKm) - Math.abs(right.distanceKm - targetDistanceKm)
  })[0]
}

export function getRouteTypeLabel(type: RouteType) {
  return {
    loop: 'Петля',
    out_and_back: 'Туда-обратно',
    free: 'Свободный'
  }[type]
}

export function getRouteLineCoordinates(route: Route): [number, number][] {
  const lineFeature = route.geojson.features.find(
    (feature): feature is Feature<LineString> => feature.geometry.type === 'LineString'
  )
  if (!lineFeature) return []
  return lineFeature.geometry.coordinates
    .filter((coordinate): coordinate is [number, number] => Array.isArray(coordinate) && coordinate.length >= 2)
    .map(([longitude, latitude]) => [longitude, latitude])
}

export type RouteBounds = [[number, number], [number, number]]

export function createRouteFromTrack(trackPoints: TrackPoint[], baseRoute: Route): Route {
  const coordinates: [number, number][] = trackPoints.map((point) => [point.longitude, point.latitude])
  return {
    ...baseRoute,
    id: `${baseRoute.id}-track`,
    geojson: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: baseRoute.name },
          geometry: {
            type: 'LineString',
            coordinates
          }
        }
      ]
    }
  }
}

export function getRouteBounds(route: Route): RouteBounds | null {
  const coordinates = getRouteLineCoordinates(route)
  if (!coordinates.length) return null

  let minLng = coordinates[0]![0]
  let maxLng = coordinates[0]![0]
  let minLat = coordinates[0]![1]
  let maxLat = coordinates[0]![1]

  for (const [longitude, latitude] of coordinates) {
    if (longitude < minLng) minLng = longitude
    if (longitude > maxLng) maxLng = longitude
    if (latitude < minLat) minLat = latitude
    if (latitude > maxLat) maxLat = latitude
  }

  return [[minLng, minLat], [maxLng, maxLat]]
}
