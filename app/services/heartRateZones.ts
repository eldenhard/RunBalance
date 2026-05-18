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
        accent: '#7dd3fc',
        tileClass: 'border-[#204a63] bg-[#0f1d27] text-[#d7f2ff]',
        badgeClass: 'bg-[#123247] text-[#8fdcff]'
      }
    case 'z2':
      return {
        accent: '#4ade80',
        tileClass: 'border-[#1d4d32] bg-[#0d1f16] text-[#dcffe8]',
        badgeClass: 'bg-[#163522] text-[#70ee9a]'
      }
    case 'z3':
      return {
        accent: '#facc15',
        tileClass: 'border-[#5a4612] bg-[#251b07] text-[#fff5cc]',
        badgeClass: 'bg-[#3a2a08] text-[#ffd95a]'
      }
    case 'z4':
      return {
        accent: '#fb923c',
        tileClass: 'border-[#5d2d10] bg-[#261307] text-[#ffe4d2]',
        badgeClass: 'bg-[#3d1d09] text-[#ffb07a]'
      }
    case 'z5':
      return {
        accent: '#f87171',
        tileClass: 'border-[#5b1f24] bg-[#240d11] text-[#ffe0e3]',
        badgeClass: 'bg-[#3b1116] text-[#ff9aa2]'
      }
    default:
      return {
        accent: '#ffffff',
        tileClass: 'border-[#252525] bg-[#151515] text-white',
        badgeClass: 'bg-[#1f1f1f] text-[#b8b8b8]'
      }
  }
}
