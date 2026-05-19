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
  decorativeFallback?: boolean
  showStatusHint?: boolean
  showAttribution?: boolean
  class?: string
}>(), {
  theme: 'light',
  interactive: false,
  decorativeFallback: false,
  showStatusHint: true,
  showAttribution: true
})

const store = useRunBalanceStore()
const container = ref<HTMLDivElement | null>(null)
const map = shallowRef<Map | null>(null)
const isMounted = ref(false)
const isMapReady = ref(false)
const hasSetInitialCamera = ref(false)
const errorMessage = ref<string | null>(null)
const routeCoordinates = computed(() => props.route ? getRouteLineCoordinates(props.route) : [])
const hasTrack = computed(() => routeCoordinates.value.length >= 2)
const mapPoint = computed<[number, number] | null>(() => {
  if (props.currentPoint) return [props.currentPoint.longitude, props.currentPoint.latitude]
  return routeCoordinates.value[0] ?? null
})
const hasCurrentPoint = computed(() => Boolean(mapPoint.value))
const routeSignature = computed(() => JSON.stringify({
  route: routeCoordinates.value,
  point: mapPoint.value
}))

const palette = computed(() => {
  if (props.theme === 'dark') {
    return {
      land: '#101011',
      track: '#b9ff38',
      trackCasing: '#000000',
      marker: '#ffffff',
      current: store.appThemePalette.marker
    }
  }
  return {
    land: '#f7f7f5',
    track: '#111111',
    trackCasing: '#ffffff',
    marker: '#ffffff',
    current: store.appThemePalette.marker
  }
})

const fallbackClass = computed(() => [
  props.decorativeFallback ? 'route-map-fallback--decorative' : 'route-map-fallback--plain',
  props.theme === 'dark' ? 'route-map-fallback--dark' : 'route-map-fallback--light'
].join(' '))

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
          'raster-saturation': props.theme === 'dark' ? -0.18 : 0,
          'raster-contrast': props.theme === 'dark' ? -0.02 : 0
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
      : mapPoint.value
        ? mapPoint.value
      : [37.6173, 55.7558]

    const instance = new maplibre.Map({
      container: container.value,
      style: buildStyle(),
      center: fallbackCenter,
      zoom: bounds ? 13 : 11,
      attributionControl: props.showAttribution ? { compact: true } : false,
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
    instance.on('idle', () => {
      isMapReady.value = true
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

  const point = mapPoint.value
  if (point) {
    const currentData = {
      type: 'FeatureCollection' as const,
      features: [{
        type: 'Feature' as const,
        properties: {},
        geometry: {
          type: 'Point' as const,
          coordinates: point
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
          'circle-radius': 18,
          'circle-color': palette.value.current,
          'circle-opacity': 0.2
        }
      })
      instance.addLayer({
        id: 'route-current-dot',
        type: 'circle',
        source: currentSourceId,
        paint: {
          'circle-radius': 7,
          'circle-color': palette.value.current,
          'circle-stroke-color': palette.value.marker,
          'circle-stroke-width': 4
        }
      })
    }
  }

  const bounds = props.route ? getRouteBounds(props.route) : null
  if (!hasSetInitialCamera.value && bounds && coordinates.length >= 2) {
    instance.fitBounds(bounds, { padding: 32, animate: false, maxZoom: 15 })
    hasSetInitialCamera.value = true
  } else if (!hasSetInitialCamera.value && point) {
    instance.jumpTo({
      center: point,
      zoom: 16
    })
    hasSetInitialCamera.value = true
  }

  requestAnimationFrame(() => instance.resize())
}

onMounted(() => {
  isMounted.value = true
  ensureMap()
})

watch(() => props.route?.id, () => {
  hasSetInitialCamera.value = false
  ensureMap()
})

watch(routeSignature, () => {
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
    <div :class="cn('route-map-fallback absolute inset-0 transition-opacity duration-200', fallbackClass, isMapReady ? 'opacity-0' : 'opacity-100')">
      <template v-if="decorativeFallback">
        <div class="route-map-fallback__park route-map-fallback__park--one" />
        <div class="route-map-fallback__park route-map-fallback__park--two" />
        <div class="route-map-fallback__water" />
        <div class="route-map-fallback__road route-map-fallback__road--one" />
        <div class="route-map-fallback__road route-map-fallback__road--two" />
        <div class="route-map-fallback__road route-map-fallback__road--three" />
        <div class="route-map-fallback__road route-map-fallback__road--four" />
      </template>
      <div v-if="hasCurrentPoint" class="route-map-fallback__dot" />
    </div>
    <div
      v-if="isMounted"
      ref="container"
      :class="[
        'absolute inset-0 transition-opacity duration-200',
        isMapReady ? 'opacity-100' : 'opacity-0'
      ]"
    />
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
      v-else-if="showStatusHint && !hasTrack"
      :class="cn('pointer-events-none absolute inset-x-4 bottom-3 rounded-full px-3 py-1 text-center text-[11px] leading-snug backdrop-blur', placeholderClass)"
    >
      {{ hasCurrentPoint ? 'Стартовая точка записана.' : 'Ждём первую GPS-точку.' }}
    </div>
  </div>
</template>

<style scoped>
.route-map-fallback {
  background-color: #eef1ec;
}

.route-map-fallback--plain {
  background: #eef1ec;
}

.route-map-fallback--decorative {
  background:
    linear-gradient(115deg, transparent 0 42%, rgba(255, 255, 255, 0.1) 42% 43%, transparent 43% 100%),
    linear-gradient(25deg, transparent 0 50%, rgba(255, 255, 255, 0.08) 50% 51%, transparent 51% 100%),
    repeating-linear-gradient(0deg, transparent 0 42px, rgba(255, 255, 255, 0.045) 42px 43px),
    repeating-linear-gradient(90deg, transparent 0 54px, rgba(255, 255, 255, 0.04) 54px 55px);
}

.route-map-fallback--light {
  background-color: #eef1ec;
}

.route-map-fallback--dark {
  background: #171918;
}

.route-map-fallback__park,
.route-map-fallback__water,
.route-map-fallback__road,
.route-map-fallback__dot {
  position: absolute;
  pointer-events: none;
}

.route-map-fallback__park {
  border-radius: 999px;
  background: rgba(177, 195, 176, 0.2);
}

.route-map-fallback__park--one {
  width: 42%;
  height: 28%;
  right: -8%;
  top: 10%;
  transform: rotate(-18deg);
}

.route-map-fallback__park--two {
  width: 34%;
  height: 24%;
  left: -10%;
  bottom: 8%;
  transform: rotate(20deg);
}

.route-map-fallback__water {
  width: 62%;
  height: 18%;
  left: 20%;
  bottom: 24%;
  border-radius: 999px;
  background: rgba(151, 169, 178, 0.18);
  transform: rotate(-10deg);
}

.route-map-fallback__road {
  height: 9px;
  border-radius: 999px;
  background: rgba(240, 240, 237, 0.38);
  box-shadow: 0 0 0 2px rgba(10, 10, 10, 0.08);
}

.route-map-fallback__road--one {
  width: 120%;
  left: -10%;
  top: 32%;
  transform: rotate(14deg);
}

.route-map-fallback__road--two {
  width: 90%;
  left: 12%;
  top: 58%;
  transform: rotate(-24deg);
}

.route-map-fallback__road--three {
  width: 76%;
  left: -8%;
  top: 70%;
  transform: rotate(8deg);
}

.route-map-fallback__road--four {
  width: 74%;
  right: -18%;
  top: 42%;
  transform: rotate(72deg);
}

.route-map-fallback__dot {
  left: 50%;
  top: 50%;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: #ff3b30;
  border: 4px solid #ffffff;
  box-shadow: 0 0 0 12px rgba(255, 59, 48, 0.2);
  transform: translate(-50%, -50%);
}
</style>
