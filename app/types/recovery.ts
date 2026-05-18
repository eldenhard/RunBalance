export type RecoveryCheckIn = {
  id: string
  date: string
  sleepQuality: 1 | 2 | 3 | 4 | 5
  fatigue: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  soreness: 'none' | 'light' | 'strong'
  stress: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  restingHeartRate?: number
  hrvMs?: number
  readinessScore: number
}

