import { describe, expect, it } from 'vitest'
import type { Workout } from '~/types/workout'
import { adaptWorkoutForReadiness } from '~/services/trainingPlan'

const tempoWorkout: Workout = {
  id: 'workout-1',
  title: 'Темповый блок',
  type: 'tempo',
  plannedDistanceKm: 8,
  plannedDurationMin: 48,
  targetZoneId: 'z4'
}

describe('training plan adaptation', () => {
  it('keeps the planned workout when readiness is good', () => {
    expect(adaptWorkoutForReadiness(tempoWorkout, 82)).toMatchObject({
      title: 'Темповый блок',
      type: 'tempo',
      targetZoneId: 'z4',
      adaptationReason: 'Готовность хорошая. Оставляем плановую тренировку.'
    })
  })

  it('reduces intensity when readiness is moderate', () => {
    expect(adaptWorkoutForReadiness(tempoWorkout, 58)).toMatchObject({
      title: 'Лёгкий бег вместо: Темповый блок',
      type: 'easy',
      plannedDistanceKm: 6.4,
      targetZoneId: 'z2'
    })
  })

  it('switches to recovery run when readiness is low', () => {
    expect(adaptWorkoutForReadiness(tempoWorkout, 34)).toMatchObject({
      title: 'Восстановительный бег',
      type: 'recovery',
      plannedDistanceKm: 4,
      targetZoneId: 'z1'
    })
  })
})

