import type { RecoveryCheckIn } from '~/types/recovery'

export type ReadinessInput = Pick<RecoveryCheckIn, 'sleepQuality' | 'fatigue' | 'soreness' | 'stress' | 'restingHeartRate' | 'hrvMs'>

export type RecoveryRecommendation = {
  level: 'ready' | 'adjust' | 'recover'
  title: string
  message: string
}

export function calculateReadinessScore(input: ReadinessInput) {
  const sleep = (input.sleepQuality - 1) * 7
  const fatigue = (10 - input.fatigue) * 2
  const stress = (10 - input.stress) * 1.5
  const soreness = {
    none: 4,
    light: -2,
    strong: -9
  }[input.soreness]

  return Math.round(Math.max(0, Math.min(100, 30 + sleep + fatigue + stress + soreness)))
}

export function getRecoveryRecommendation(readinessScore: number): RecoveryRecommendation {
  if (readinessScore >= 70) {
    return {
      level: 'ready',
      title: 'Можно бежать по плану',
      message: 'Готовность хорошая. Держи плановую нагрузку и следи за ощущениями.'
    }
  }

  if (readinessScore >= 45) {
    return {
      level: 'adjust',
      title: 'Лучше снизить интенсивность',
      message: 'Есть признаки накопленной нагрузки. Замени интенсивный блок на лёгкий бег.'
    }
  }

  return {
    level: 'recover',
    title: 'Сегодня лучше восстановиться',
    message: 'Сделай короткий восстановительный бег или прогулку, если самочувствие позволяет.'
  }
}
