import type { HeartRateZone } from './heart-rate'

export type UserGoal = '5k' | '10k' | 'half_marathon' | 'base' | 'return_to_running'
export type AppColorThemeId = 'runbalance' | 'velocity' | 'aero' | 'ember' | 'volt' | 'graphite'

export type UserProfile = {
  id: string
  displayName: string
  goal: UserGoal
  colorThemeId: AppColorThemeId
  maxHeartRate: number
  trainingDays: number[]
  zones: HeartRateZone[]
  onboarded: boolean
}
