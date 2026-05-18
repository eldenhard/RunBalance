import { describe, expect, it } from 'vitest'
import { getGeolocationErrorMessage, positionToTrackPoint } from '~/services/geolocation'

describe('geolocation helpers', () => {
  it('normalizes browser geolocation position into a track point', () => {
    const position = {
      coords: {
        latitude: 55.7558,
        longitude: 37.6173,
        accuracy: 12
      },
      timestamp: Date.parse('2026-05-18T10:00:00.000Z')
    } as GeolocationPosition

    expect(positionToTrackPoint(position)).toEqual({
      latitude: 55.7558,
      longitude: 37.6173,
      accuracyM: 12,
      recordedAt: '2026-05-18T10:00:00.000Z'
    })
  })

  it('maps permission denied errors to product wording', () => {
    expect(getGeolocationErrorMessage({ code: 1 } as GeolocationPositionError)).toBe('Геолокация выключена. Разреши доступ к GPS, чтобы записывать тренировку.')
  })

  it('maps unavailable errors to a recoverable message', () => {
    expect(getGeolocationErrorMessage({ code: 2 } as GeolocationPositionError)).toBe('GPS временно недоступен. Тренировка сохранится, попробуем продолжить запись позже.')
  })
})
