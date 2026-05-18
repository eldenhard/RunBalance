import { describe, expect, it } from 'vitest'
import { getWorkoutAlert } from '~/services/voiceAlerts'

const targetZone = {
  id: 'z2',
  name: 'Zone 2',
  minBpm: 116,
  maxBpm: 133
}

describe('workout voice alert rules', () => {
  it('alerts when heart rate stays above target zone for more than 20 seconds', () => {
    expect(getWorkoutAlert({
      nowSec: 120,
      targetZone,
      currentHeartRate: 142,
      secondsAboveTarget: 21,
      secondsBelowTarget: 0,
      lastAlertAtSec: {}
    })).toMatchObject({
      kind: 'heart_rate_high',
      message: 'Пульс выше целевой зоны. Сбавь темп.'
    })
  })

  it('alerts when heart rate stays below target zone during tempo work', () => {
    expect(getWorkoutAlert({
      nowSec: 120,
      workoutType: 'tempo',
      targetZone,
      currentHeartRate: 108,
      secondsAboveTarget: 0,
      secondsBelowTarget: 46,
      lastAlertAtSec: {}
    })).toMatchObject({
      kind: 'heart_rate_low',
      message: 'Пульс ниже целевой зоны. Можно добавить темп.'
    })
  })

  it('alerts when pace is faster than planned threshold', () => {
    expect(getWorkoutAlert({
      nowSec: 120,
      targetZone,
      paceSecPerKm: 410,
      plannedPaceSecPerKm: 450,
      fastPaceThresholdSec: 20,
      lastAlertAtSec: {}
    })).toMatchObject({
      kind: 'pace_fast',
      message: 'Темп быстрее плана. Беги спокойнее.'
    })
  })

  it('does not repeat the same alert inside 60 seconds', () => {
    expect(getWorkoutAlert({
      nowSec: 150,
      targetZone,
      currentHeartRate: 142,
      secondsAboveTarget: 30,
      secondsBelowTarget: 0,
      lastAlertAtSec: { heart_rate_high: 100 }
    })).toBeNull()
  })
})
