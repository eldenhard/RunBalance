import { describe, expect, it } from 'vitest'
import { createDefaultHeartRateZones, findHeartRateZone } from '~/services/heartRateZones'

describe('heart-rate zone helpers', () => {
  it('creates five default zones from max heart rate', () => {
    const zones = createDefaultHeartRateZones(190)

    expect(zones).toHaveLength(5)
    expect(zones[0]).toMatchObject({ minBpm: 95, maxBpm: 114 })
  })

  it('finds the zone for a bpm reading', () => {
    expect(findHeartRateZone(createDefaultHeartRateZones(190), 150)?.name).toBe('Zone 3')
  })
})

