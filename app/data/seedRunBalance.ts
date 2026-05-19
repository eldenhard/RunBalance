import type { UserProfile } from '~/types/profile'
import type { RecoveryCheckIn } from '~/types/recovery'
import type { Route } from '~/types/route'
import type { Shoe } from '~/types/shoe'
import type { Workout } from '~/types/workout'

export const emptyProfile: UserProfile = {
  id: 'local-runner',
  displayName: '',
  goal: 'base',
  colorThemeId: 'runbalance',
  maxHeartRate: 0,
  trainingDays: [],
  zones: [],
  onboarded: false
}

export const emptyRecovery: RecoveryCheckIn | null = null

export const emptyShoes: Shoe[] = []

export const emptyRoutes: Route[] = []

export const emptyPlannedWorkouts: Workout[] = []

export const emptyHistory: Workout[] = []
