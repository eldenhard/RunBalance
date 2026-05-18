import type { Workout } from '~/types/workout'

export type AdaptedWorkout = Workout & {
  adaptationReason: string
}

export function adaptWorkoutForReadiness(workout: Workout, readinessScore: number): AdaptedWorkout {
  if (readinessScore >= 70) {
    return {
      ...workout,
      adaptationReason: 'Готовность хорошая. Оставляем плановую тренировку.'
    }
  }

  if (readinessScore >= 45) {
    return {
      ...workout,
      title: `Лёгкий бег вместо: ${workout.title}`,
      type: 'easy',
      plannedDistanceKm: workout.plannedDistanceKm ? Number((workout.plannedDistanceKm * 0.8).toFixed(1)) : undefined,
      plannedDurationMin: workout.plannedDurationMin ? Math.round(workout.plannedDurationMin * 0.8) : undefined,
      targetZoneId: 'z2',
      adaptationReason: 'Готовность средняя. Снижаем интенсивность и оставляем аэробную нагрузку.'
    }
  }

  return {
    ...workout,
    title: 'Восстановительный бег',
    type: 'recovery',
    plannedDistanceKm: workout.plannedDistanceKm ? Number((workout.plannedDistanceKm * 0.5).toFixed(1)) : undefined,
    plannedDurationMin: workout.plannedDurationMin ? Math.round(workout.plannedDurationMin * 0.5) : undefined,
    targetZoneId: 'z1',
    adaptationReason: 'Готовность низкая. Меняем тренировку на восстановительный формат.'
  }
}

