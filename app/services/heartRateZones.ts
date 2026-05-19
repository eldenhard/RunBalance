import type { HeartRateZone } from '~/types/heart-rate'

type HeartRateZoneAppearance = {
  accent: string
  tileClass: string
  badgeClass: string
}

export function createDefaultHeartRateZones(maxHeartRate: number): HeartRateZone[] {
  return [
    { id: 'z1', name: 'Zone 1', minBpm: Math.round(maxHeartRate * 0.5), maxBpm: Math.round(maxHeartRate * 0.6) },
    { id: 'z2', name: 'Zone 2', minBpm: Math.round(maxHeartRate * 0.61), maxBpm: Math.round(maxHeartRate * 0.7) },
    { id: 'z3', name: 'Zone 3', minBpm: Math.round(maxHeartRate * 0.71), maxBpm: Math.round(maxHeartRate * 0.8) },
    { id: 'z4', name: 'Zone 4', minBpm: Math.round(maxHeartRate * 0.81), maxBpm: Math.round(maxHeartRate * 0.9) },
    { id: 'z5', name: 'Zone 5', minBpm: Math.round(maxHeartRate * 0.91), maxBpm: maxHeartRate }
  ]
}

export function findHeartRateZone(zones: HeartRateZone[], bpm: number) {
  return zones.find((zone) => bpm >= zone.minBpm && bpm <= zone.maxBpm)
}

export function getHeartRateZoneAppearance(zoneId?: string): HeartRateZoneAppearance {
  switch (zoneId) {
    case 'z1':
      return {
        accent: '#0ea5e9',
        tileClass: 'border-[#38bdf8]/45 bg-[#082333] text-[#e0f7ff]',
        badgeClass: 'border border-[#7dd3fc] bg-[#ecfeff] text-[#075985]'
      }
    case 'z2':
      return {
        accent: '#22c55e',
        tileClass: 'border-[#86efac]/45 bg-[#0b2516] text-[#ecfdf3]',
        badgeClass: 'border border-[#86efac] bg-[#f0fdf4] text-[#166534]'
      }
    case 'z3':
      return {
        accent: '#eab308',
        tileClass: 'border-[#fde047]/45 bg-[#2b2508] text-[#fff9c7]',
        badgeClass: 'border border-[#facc15] bg-[#fffbea] text-[#854d0e]'
      }
    case 'z4':
      return {
        accent: '#f97316',
        tileClass: 'border-[#fdba74]/45 bg-[#2d1608] text-[#fff1e6]',
        badgeClass: 'border border-[#fb923c] bg-[#fff7ed] text-[#9a3412]'
      }
    case 'z5':
      return {
        accent: '#f43f5e',
        tileClass: 'border-[#fda4af]/45 bg-[#2d1117] text-[#fff1f3]',
        badgeClass: 'border border-[#fb7185] bg-[#fff1f2] text-[#9f1239]'
      }
    default:
      return {
        accent: '#8a8a8a',
        tileClass: 'border-[#252525] bg-[#151515] text-white',
        badgeClass: 'border border-[#deded9] bg-[#f7f7f5] text-[#4b4b4b]'
      }
  }
}
