import { describe, expect, it } from 'vitest'
import { calculateReadinessScore, getRecoveryRecommendation } from '~/services/recovery'

describe('recovery service', () => {
  it('calculates a high readiness score for good sleep and low strain', () => {
    expect(calculateReadinessScore({
      sleepQuality: 5,
      fatigue: 2,
      soreness: 'none',
      stress: 2,
      restingHeartRate: 52,
      hrvMs: 70
    })).toBe(90)
  })

  it('calculates a lower readiness score for poor sleep and high strain', () => {
    expect(calculateReadinessScore({
      sleepQuality: 2,
      fatigue: 8,
      soreness: 'strong',
      stress: 8,
      restingHeartRate: 68,
      hrvMs: 35
    })).toBe(35)
  })

  it('returns calm non-medical recommendation text', () => {
    expect(getRecoveryRecommendation(78)).toEqual({
      level: 'ready',
      title: 'Можно бежать по плану',
      message: 'Готовность хорошая. Держи плановую нагрузку и следи за ощущениями.'
    })
  })
})

