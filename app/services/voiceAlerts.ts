import type { HeartRateZone } from '~/types/heart-rate'
import type { WorkoutType } from '~/types/workout'
import type { WorkoutAlert, WorkoutAlertKind } from '~/types/workout-session'

type AlertInput = {
  nowSec: number
  workoutType?: WorkoutType
  targetZone?: HeartRateZone
  currentHeartRate?: number
  secondsAboveTarget?: number
  secondsBelowTarget?: number
  paceSecPerKm?: number
  plannedPaceSecPerKm?: number
  fastPaceThresholdSec?: number
  lastAlertAtSec: Partial<Record<WorkoutAlertKind, number>>
}

const ALERT_COOLDOWN_SEC = 60

export function getWorkoutAlert(input: AlertInput): WorkoutAlert | null {
  if (
    input.targetZone &&
    input.currentHeartRate &&
    input.currentHeartRate > input.targetZone.maxBpm &&
    (input.secondsAboveTarget ?? 0) > 20
  ) {
    return createAlert(input, 'heart_rate_high', 'Пульс выше целевой зоны. Сбавь темп.')
  }

  if (
    input.targetZone &&
    input.currentHeartRate &&
    input.currentHeartRate < input.targetZone.minBpm &&
    ['tempo', 'intervals', 'fartlek'].includes(input.workoutType ?? '') &&
    (input.secondsBelowTarget ?? 0) > 45
  ) {
    return createAlert(input, 'heart_rate_low', 'Пульс ниже целевой зоны. Можно добавить темп.')
  }

  if (
    input.paceSecPerKm &&
    input.plannedPaceSecPerKm &&
    input.paceSecPerKm < input.plannedPaceSecPerKm - (input.fastPaceThresholdSec ?? 20)
  ) {
    return createAlert(input, 'pace_fast', 'Темп быстрее плана. Беги спокойнее.')
  }

  return null
}

function createAlert(input: AlertInput, kind: WorkoutAlertKind, message: string) {
  const lastAlertAtSec = input.lastAlertAtSec[kind]
  if (typeof lastAlertAtSec === 'number' && input.nowSec - lastAlertAtSec < ALERT_COOLDOWN_SEC) {
    return null
  }

  return {
    kind,
    message,
    createdAtSec: input.nowSec
  }
}
