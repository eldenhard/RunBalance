<script setup lang="ts">
import type { Map, StyleSpecification } from 'maplibre-gl'
import { cn } from '~/utils/cn'
import { getRouteBounds, getRouteLineCoordinates } from '~/services/routes'
import type { Route } from '~/types/route'
import type { TrackPoint } from '~/types/workout-session'

const props = withDefaults(defineProps<{
  route?: Route
  currentPoint?: TrackPoint | null
  theme?: 'light' | 'dark'
  interactive?: boolean
  class?: string
}>(), {
  theme: 'light',
  interactive: false
})

const container = ref<HTMLDivElement | null>(null)
const map = shallowRef<Map | null>(null)
const isMounted = ref(false)
const errorMessage = ref<string | null>(null)
const routeCoordinates = computed(() => props.route ? getRouteLineCoordinates(props.route) : [])
const hasTrack = computed(() => routeCoordinates.value.length >= 2)
const hasCurrentPoint = computed(() => Boolean(props.currentPoint))
const routeSignature = computed(() => JSON.stringify({
  route: routeCoordinates.value,
  point: props.currentPoint ? [props.currentPoint.longitude, props.currentPoint.latitude] : null
}))

const palette = computed(() => {
  if (props.theme === 'dark') {
    return {
      land: '#101011',
      track: '#ffb071',
      trackCasing: '#000000',
      marker: '#ffffff'
    }
  }
  return {
    land: '#f7f7f5',
    track: '#111111',
    trackCasing: '#ffffff',
    marker: '#111111'
  }
})

const placeholderClass = computed(() => props.theme === 'dark'
  ? 'bg-[#101011] text-[#9b9b9b]'
  : 'bg-[#f0f0ed] text-[#767676]')

function buildStyle(): StyleSpecification {
  return {
    version: 8,
    sources: {
      'osm': {
        type: 'raster',
        tiles: [
          'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
        ],
        tileSize: 256,
        attribution: '© OpenStreetMap',
        maxzoom: 19
      }
    },
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: { 'background-color': palette.value.land }
      },
      {
        id: 'osm-layer',
        type: 'raster',
        source: 'osm',
        paint: {
          'raster-opacity': 1,
          'raster-saturation': props.theme === 'dark' ? -0.6 : -0.15
        }
      }
    ]
  }
}

async function ensureMap() {
  if (!import.meta.client || !container.value) return
  if (map.value) {
    applyRoute()
    return
  }

  try {
    const maplibre = await import('maplibre-gl')
    const bounds = props.route ? getRouteBounds(props.route) : null
    const fallbackCenter: [number, number] = bounds
      ? [
          (bounds[0][0] + bounds[1][0]) / 2,
          (bounds[0][1] + bounds[1][1]) / 2
        ]
      : props.currentPoint
        ? [props.currentPoint.longitude, props.currentPoint.latitude]
      : [37.6173, 55.7558]

    const instance = new maplibre.Map({
      container: container.value,
      style: buildStyle(),
      center: fallbackCenter,
      zoom: bounds ? 13 : 11,
      attributionControl: { compact: true },
      interactive: props.interactive,
      cooperativeGestures: false,
      pitchWithRotate: false,
      dragRotate: false
    })

    instance.on('error', (event) => {
      const message = event?.error?.message
      if (message && !message.includes('Failed to fetch')) {
        errorMessage.value = message
      }
    })

    instance.on('load', () => {
      map.value = instance
      applyRoute()
    })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось загрузить карту'
  }
}

function applyRoute() {
  const instance = map.value
  if (!instance) return

  const coordinates = routeCoordinates.value
  const sourceId = 'route-line'
  const startSourceId = 'route-start-marker'
  const currentSourceId = 'route-current-marker'

  const geojson = {
    type: 'FeatureCollection' as const,
    features: coordinates.length >= 2
      ? [{
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'LineString' as const,
            coordinates
          }
        }]
      : []
  }

  const existing = instance.getSource(sourceId)
  if (existing && 'setData' in existing) {
    ;(existing as { setData: (data: typeof geojson) => void }).setData(geojson)
  } else {
    instance.addSource(sourceId, { type: 'geojson', data: geojson })
    instance.addLayer({
      id: 'route-line-casing',
      type: 'line',
      source: sourceId,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': palette.value.trackCasing,
        'line-width': 7,
        'line-opacity': 0.9
      }
    })
    instance.addLayer({
      id: 'route-line-main',
      type: 'line',
      source: sourceId,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': palette.value.track,
        'line-width': 4
      }
    })
  }

  if (coordinates.length >= 1) {
    const startCoordinate = coordinates[0]!
    const startData = {
      type: 'FeatureCollection' as const,
      features: [{
        type: 'Feature' as const,
        properties: {},
        geometry: { type: 'Point' as const, coordinates: startCoordinate }
      }]
    }
    const startSource = instance.getSource(startSourceId)
    if (startSource && 'setData' in startSource) {
      ;(startSource as { setData: (data: typeof startData) => void }).setData(startData)
    } else {
      instance.addSource(startSourceId, { type: 'geojson', data: startData })
      instance.addLayer({
        id: 'route-start-circle',
        type: 'circle',
        source: startSourceId,
        paint: {
          'circle-radius': 5,
          'circle-color': palette.value.marker,
          'circle-stroke-color': palette.value.trackCasing,
          'circle-stroke-width': 2
        }
      })
    }
  }

  if (props.currentPoint) {
    const currentData = {
      type: 'FeatureCollection' as const,
      features: [{
        type: 'Feature' as const,
        properties: {},
        geometry: {
          type: 'Point' as const,
          coordinates: [props.currentPoint.longitude, props.currentPoint.latitude]
        }
      }]
    }
    const currentSource = instance.getSource(currentSourceId)
    if (currentSource && 'setData' in currentSource) {
      ;(currentSource as { setData: (data: typeof currentData) => void }).setData(currentData)
    } else {
      instance.addSource(currentSourceId, { type: 'geojson', data: currentData })
      instance.addLayer({
        id: 'route-current-pulse',
        type: 'circle',
        source: currentSourceId,
        paint: {
          'circle-radius': 12,
          'circle-color': palette.value.track,
          'circle-opacity': 0.18
        }
      })
      instance.addLayer({
        id: 'route-current-dot',
        type: 'circle',
        source: currentSourceId,
        paint: {
          'circle-radius': 6,
          'circle-color': palette.value.marker,
          'circle-stroke-color': palette.value.track,
          'circle-stroke-width': 3
        }
      })
    }
  }

  const bounds = props.route ? getRouteBounds(props.route) : null
  if (bounds && coordinates.length >= 2) {
    instance.fitBounds(bounds, { padding: 32, animate: false, maxZoom: 15 })
  } else if (props.currentPoint) {
    instance.jumpTo({
      center: [props.currentPoint.longitude, props.currentPoint.latitude],
      zoom: 16
    })
  }

  requestAnimationFrame(() => instance.resize())
}

onMounted(() => {
  isMounted.value = true
  ensureMap()
})

watch([() => props.route?.id, routeSignature], () => {
  ensureMap()
})

onBeforeUnmount(() => {
  if (map.value) {
    map.value.remove()
    map.value = null
  }
})
</script>

<template>
  <div :class="cn('relative overflow-hidden rounded-2xl', $props.class)">
    <div v-if="isMounted" ref="container" class="absolute inset-0" />
    <div
      v-else
      :class="cn('flex h-full w-full items-center justify-center text-xs', placeholderClass)"
    >
      Карта загружается…
    </div>

    <div
      v-if="errorMessage"
      :class="cn('pointer-events-none absolute inset-0 flex items-center justify-center px-4 text-center text-xs leading-snug', placeholderClass)"
    >
      Карта не открылась: {{ errorMessage }}
    </div>

    <div
      v-else-if="!hasTrack"
      :class="cn('pointer-events-none absolute inset-x-4 bottom-3 rounded-full px-3 py-1 text-center text-[11px] leading-snug', placeholderClass)"
    >
      {{ hasCurrentPoint ? 'Трек появится после движения.' : 'Ждём первую GPS-точку.' }}
    </div>
  </div>
</template>
