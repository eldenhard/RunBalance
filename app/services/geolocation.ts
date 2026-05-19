import type { TrackPoint } from '~/types/workout-session'

export function positionToTrackPoint(position: GeolocationPosition): TrackPoint {
  const speedMps = position.coords.speed
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracyM: Math.round(position.coords.accuracy),
    recordedAt: new Date(position.timestamp).toISOString(),
    speedMps: typeof speedMps === 'number' && Number.isFinite(speedMps) && speedMps > 0 ? speedMps : undefined
  }
}

export function getGeolocationErrorMessage(error: Pick<GeolocationPositionError, 'code'>) {
  if (error.code === 1) {
    return 'Геолокация выключена. Разреши доступ к GPS, чтобы записывать тренировку.'
  }

  if (error.code === 2) {
    return 'GPS временно недоступен. Тренировка сохранится, попробуем продолжить запись позже.'
  }

  if (error.code === 3) {
    return 'GPS не успел получить точку. Продолжаем тренировку и попробуем ещё раз.'
  }

  return 'Не удалось получить GPS-точку. Тренировка остаётся сохранённой локально.'
}

export function isGeolocationSupported() {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator
}
