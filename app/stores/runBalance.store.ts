import { defineStore } from 'pinia'
import { activeWorkout, mockProfile, mockRecovery, mockRoute, mockShoes, todayWorkout, workoutHistory } from '~/data/mockRunBalance'
import { iosSafariPwaHeartRateUnavailable } from '~/services/heart-rate/heartRateSource'
import { getRecoveryRecommendation } from '~/services/recovery'
import { adaptWorkoutForReadiness } from '~/services/trainingPlan'

export const useRunBalanceStore = defineStore('run-balance', () => {
  const profile = ref(mockProfile)
  const recovery = ref(mockRecovery)
  const route = ref(mockRoute)
  const shoes = ref(mockShoes)
  const workoutOfTheDay = ref(todayWorkout)
  const currentWorkout = ref(activeWorkout)
  const history = ref(workoutHistory)
  const heartRateSource = ref(iosSafariPwaHeartRateUnavailable)

  const selectedShoe = computed(() => shoes.value.find((shoe) => shoe.id === workoutOfTheDay.value.shoeId))
  const targetZone = computed(() => profile.value.zones.find((zone) => zone.id === workoutOfTheDay.value.targetZoneId))
  const recoveryRecommendation = computed(() => getRecoveryRecommendation(recovery.value.readinessScore))
  const adaptedWorkout = computed(() => adaptWorkoutForReadiness(workoutOfTheDay.value, recovery.value.readinessScore))

  return {
    profile,
    recovery,
    route,
    shoes,
    workoutOfTheDay,
    currentWorkout,
    history,
    heartRateSource,
    selectedShoe,
    targetZone,
    recoveryRecommendation,
    adaptedWorkout
  }
})
