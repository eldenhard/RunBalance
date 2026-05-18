import type { FeatureCollection } from 'geojson'

export type RouteType = 'loop' | 'out_and_back' | 'free'

export type Route = {
  id: string
  name: string
  distanceKm: number
  type: RouteType
  geojson: FeatureCollection
  isPrivate: boolean
  surface: string
  elevationHint: string
}
