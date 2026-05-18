import type { HeartRateZone } from '~/types/heart-rate'

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

