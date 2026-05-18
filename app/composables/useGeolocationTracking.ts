import { getGeolocationErrorMessage, isGeolocationSupported, positionToTrackPoint } from '~/services/geolocation'
import type { TrackPoint } from '~/types/workout-session'

export type GeolocationTrackingStatus = 'idle' | 'tracking' | 'unsupported' | 'denied' | 'error'

type UseGeolocationTrackingOptions = {
  onPoint: (point: TrackPoint) => void
}

export function useGeolocationTracking(options: UseGeolocationTrackingOptions) {
  const status = ref<GeolocationTrackingStatus>('idle')
  const errorMessage = ref<string | null>(null)
  const latestPoint = ref<TrackPoint | null>(null)
  const watchId = ref<number | null>(null)
  const isTracking = computed(() => status.value === 'tracking')

  function start() {
    if (!import.meta.client || !isGeolocationSupported()) {
      status.value = 'unsupported'
      errorMessage.value = 'GPS недоступен в этом браузере.'
      return
    }

    if (watchId.value !== null) return

    status.value = 'tracking'
    errorMessage.value = null
    window.navigator.geolocation.getCurrentPosition(
      handlePosition,
      handleError,
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 8000
      }
    )
    watchId.value = window.navigator.geolocation.watchPosition(
      handlePosition,
      handleError,
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 15000
      }
    )
  }

  function stop() {
    if (!import.meta.client || watchId.value === null) return
    window.navigator.geolocation.clearWatch(watchId.value)
    watchId.value = null
    status.value = 'idle'
  }

  function handlePosition(position: GeolocationPosition) {
    const point = positionToTrackPoint(position)
    latestPoint.value = point
    options.onPoint(point)
  }

  function handleError(error: GeolocationPositionError) {
    status.value = error.code === 1 ? 'denied' : 'error'
    errorMessage.value = getGeolocationErrorMessage(error)
  }

  onBeforeUnmount(stop)

  return {
    status,
    errorMessage,
    latestPoint,
    isTracking,
    start,
    stop
  }
}
