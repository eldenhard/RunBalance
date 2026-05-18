import { defineStore } from 'pinia'
import { activeWorkout, mockProfile, mockRecovery, mockRoute, mockShoes, todayWorkout, workoutHistory } from '~/data/mockRunBalance'
import { iosSafariPwaHeartRateUnavailable } from '~/services/heart-rate/heartRateSource'

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
    targetZone
  }
})

