export function formatPace(secondsPerKm?: number) {
  if (!secondsPerKm) return '—'
  const minutes = Math.floor(secondsPerKm / 60)
  const seconds = Math.round(secondsPerKm % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}/км`
}

export function formatDuration(totalSeconds?: number) {
  if (!totalSeconds) return '—'
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)
  if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function formatDistance(distanceKm?: number) {
  if (distanceKm === undefined) return '—'
  return `${distanceKm.toFixed(1)} км`
}

