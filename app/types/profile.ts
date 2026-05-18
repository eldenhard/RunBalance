import type { HeartRateZone } from './heart-rate'

export type UserGoal = '5k' | '10k' | 'half_marathon' | 'base' | 'return_to_running'

export type UserProfile = {
  id: string
  displayName: string
  goal: UserGoal
  maxHeartRate: number
  trainingDays: number[]
  zones: HeartRateZone[]
  onboarded: boolean
}

