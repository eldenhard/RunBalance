<script setup lang="ts">
import type { Map, StyleSpecification } from 'maplibre-gl'
import { cn } from '~/utils/cn'
import { getRouteBounds, getRouteLineCoordinates } from '~/services/routes'
import type { Route } from '~/types/route'

const props = withDefaults(defineProps<{
  route: Route
  theme?: 'light' | 'dark'
  interactive?: boolean
  class?: string
}>(), {
  theme: 'light',
  interactive: false
})

const container = ref<HTMLDivElement | null>(null)
const map = shallowRef<Map | null>(null)
const hasTrack = computed(() => getRouteLineCoordinates(props.route).length >= 2)

const palette = computed(() => {
  if (props.theme === 'dark') {
    return {
      land: '#101011',
      water: '#1f2937',
      road: '#252525',
      track: '#ffb071',
      trackCasing: '#000000',
      marker: '#ffffff'
    }
  }
  return {
    land: '#f7f7f5',
    water: '#e6ecf2',
    road: '#deded9',
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
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    sources: {
      'osm-raster': {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '© OpenStreetMap'
      }
    },
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: { 'background-color': palette.value.land }
      },
      {
        id: 'osm-raster-layer',
        type: 'raster',
        source: 'osm-raster',
        paint: {
          'raster-opacity': 0.85,
          'raster-saturation': props.theme === 'dark' ? -0.6 : -0.2
        }
      }
    ]
  }
}

async function ensureMap() {
  if (!import.meta.client) return
  if (map.value) {
    applyRoute()
    return
  }

  await nextTick()
  if (!container.value) return

  const maplibre = await import('maplibre-gl')
  const bounds = getRouteBounds(props.route)
  const fallbackCenter: [number, number] = bounds
    ? [
        (bounds[0][0] + bounds[1][0]) / 2,
        (bounds[0][1] + bounds[1][1]) / 2
      ]
    : [37.6173, 55.7558]

  const instance = new maplibre.Map({
    container: container.value,
    style: buildStyle(),
    center: fallbackCenter,
    zoom: 12,
    attributionControl: { compact: true },
    interactive: props.interactive
  })

  instance.on('load', () => {
    map.value = instance
    applyRoute()
  })
}

function applyRoute() {
  const instance = map.value
  if (!instance) return

  const coordinates = getRouteLineCoordinates(props.route)
  const sourceId = 'route-line'
  const layerCasingId = 'route-line-casing'
  const layerLineId = 'route-line-main'
  const startSourceId = 'route-start-marker'
  const startLayerId = 'route-start-circle'

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
      id: layerCasingId,
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
      id: layerLineId,
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
        id: startLayerId,
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

  const bounds = getRouteBounds(props.route)
  if (bounds && coordinates.length >= 2) {
    instance.fitBounds(bounds, { padding: 32, animate: false, maxZoom: 15 })
  }
}

onMounted(() => {
  ensureMap()
})

watch(() => props.route.id, () => {
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
    <ClientOnly>
      <div ref="container" class="h-full w-full" />
      <template #fallback>
        <div :class="cn('flex h-full w-full items-center justify-center text-sm', placeholderClass)">
          Карта загружается…
        </div>
      </template>
    </ClientOnly>

    <div
      v-if="!hasTrack"
      :class="cn('pointer-events-none absolute inset-0 flex items-center justify-center text-center text-xs', placeholderClass)"
    >
      <span class="max-w-[200px] px-3 leading-snug">
        Трек этого маршрута ещё не записан. После пробежки линия появится автоматически.
      </span>
    </div>
  </div>
</template>
