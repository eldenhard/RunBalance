import { defineStore } from 'pinia'
import { mockProfile, mockRecovery, mockRoute, mockShoes, todayWorkout, workoutHistory } from '~/data/mockRunBalance'
import { iosSafariPwaHeartRateUnavailable } from '~/services/heart-rate/heartRateSource'
import { getHeartRateZoneAppearance } from '~/services/heartRateZones'
import { getRecoveryRecommendation } from '~/services/recovery'
import { addWorkoutDistanceToShoe } from '~/services/shoes'
import { adaptWorkoutForReadiness } from '~/services/trainingPlan'
import { createWorkoutSession, finishWorkoutSession, restoreWorkoutSession, serializeWorkoutSession, updateWorkoutSessionMetrics } from '~/services/workoutSession'
import { getWorkoutAlert } from '~/services/voiceAlerts'
import type { Workout } from '~/types/workout'
import type { TrackPoint, WorkoutSession } from '~/types/workout-session'

const ACTIVE_SESSION_STORAGE_KEY = 'runbalance.activeWorkoutSession'

export const useRunBalanceStore = defineStore('run-balance', () => {
  const profile = ref(mockProfile)
  const recovery = ref(mockRecovery)
  const route = ref(mockRoute)
  const shoes = ref(mockShoes)
  const workoutOfTheDay = ref(todayWorkout)
  const currentWorkout = ref<Workout>(todayWorkout)
  const history = ref(workoutHistory)
  const heartRateSource = ref(iosSafariPwaHeartRateUnavailable)
  const activeSession = ref<WorkoutSession | null>(null)

  const selectedShoe = computed(() => shoes.value.find((shoe) => shoe.id === workoutOfTheDay.value.shoeId))
  const targetZone = computed(() => profile.value.zones.find((zone) => zone.id === workoutOfTheDay.value.targetZoneId))
  const targetZoneAppearance = computed(() => getHeartRateZoneAppearance(targetZone.value?.id))
  const recoveryRecommendation = computed(() => getRecoveryRecommendation(recovery.value.readinessScore))
  const adaptedWorkout = computed(() => adaptWorkoutForReadiness(workoutOfTheDay.value, recovery.value.readinessScore))
  const sessionProgress = computed(() => {
    if (!activeSession.value) return 0
    const distanceProgress = adaptedWorkout.value.plannedDistanceKm
      ? (activeSession.value.distanceKm / adaptedWorkout.value.plannedDistanceKm) * 100
      : 0
    const durationProgress = adaptedWorkout.value.plannedDurationMin
      ? (activeSession.value.durationSec / (adaptedWorkout.value.plannedDurationMin * 60)) * 100
      : 0

    return Math.min(100, Math.round(Math.max(distanceProgress, durationProgress)))
  })

  function startWorkoutSession(startedAt = new Date().toISOString()) {
    const nextSession = createWorkoutSession(adaptedWorkout.value, startedAt)
    activeSession.value = nextSession
    syncCurrentWorkoutFromSession()
    persistActiveSession()
  }

  function pauseWorkoutSession(pausedAt = new Date().toISOString()) {
    if (!activeSession.value) return
    activeSession.value = {
      ...activeSession.value,
      status: 'paused',
      pausedAt
    }
    persistActiveSession()
  }

  function resumeWorkoutSession() {
    if (!activeSession.value) return
    activeSession.value = {
      ...activeSession.value,
      status: 'active',
      pausedAt: undefined
    }
    persistActiveSession()
  }

  function appendTrackPoint(point: TrackPoint, now = point.recordedAt) {
    if (!activeSession.value || activeSession.value.status !== 'active') return
    activeSession.value = updateWorkoutSessionMetrics({
      ...activeSession.value,
      trackPoints: [...activeSession.value.trackPoints, point]
    }, now)
    syncCurrentWorkoutFromSession()
    persistActiveSession()
  }

  function refreshActiveSession(now = new Date().toISOString()) {
    if (!activeSession.value || activeSession.value.status !== 'active') return
    activeSession.value = updateWorkoutSessionMetrics(activeSession.value, now)
    syncCurrentWorkoutFromSession()
    persistActiveSession()
  }

  function evaluateWorkoutAlert(nowSec = activeSession.value?.durationSec ?? 0) {
    if (!activeSession.value) return null
    const alert = getWorkoutAlert({
      nowSec,
      workoutType: activeSession.value.workoutType,
      targetZone: targetZone.value,
      paceSecPerKm: activeSession.value.avgPaceSecPerKm,
      plannedPaceSecPerKm: getPlannedPaceSecPerKm(adaptedWorkout.value.plannedDurationMin, adaptedWorkout.value.plannedDistanceKm),
      lastAlertAtSec: activeSession.value.lastAlertAtSec
    })

    if (!alert) return null

    activeSession.value = {
      ...activeSession.value,
      lastAlertAtSec: {
        ...activeSession.value.lastAlertAtSec,
        [alert.kind]: alert.createdAtSec
      },
      visualAlert: alert
    }
    syncCurrentWorkoutFromSession()
    persistActiveSession()
    return alert
  }

  function finishActiveSession(finishedAt = new Date().toISOString()) {
    if (!activeSession.value) return currentWorkout.value

    const finishedWorkout = finishWorkoutSession(activeSession.value, currentWorkout.value, finishedAt)
    currentWorkout.value = finishedWorkout
    history.value = [finishedWorkout, ...history.value]
    shoes.value = shoes.value.map((shoe) => {
      if (shoe.id !== finishedWorkout.shoeId || !finishedWorkout.distanceKm) return shoe
      return addWorkoutDistanceToShoe(shoe, finishedWorkout.distanceKm)
    })
    activeSession.value = {
      ...activeSession.value,
      status: 'finished',
      finishedAt
    }
    syncCurrentWorkoutFromSession()
    clearPersistedActiveSession()
    return finishedWorkout
  }

  function restorePersistedActiveSession() {
    if (!import.meta.client) return null
    const restored = restoreWorkoutSession(window.localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY))
    if (!restored) return null
    activeSession.value = restored
    syncCurrentWorkoutFromSession()
    return restored
  }

  function persistActiveSession() {
    if (!import.meta.client || !activeSession.value) return
    window.localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, serializeWorkoutSession(activeSession.value))
  }

  function clearPersistedActiveSession() {
    if (!import.meta.client) return
    window.localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY)
  }

  function syncCurrentWorkoutFromSession() {
    if (!activeSession.value) return

    currentWorkout.value = {
      ...adaptedWorkout.value,
      id: 'workout-active',
      startedAt: activeSession.value.startedAt,
      finishedAt: activeSession.value.finishedAt,
      distanceKm: activeSession.value.distanceKm,
      durationSec: activeSession.value.durationSec,
      avgPaceSecPerKm: activeSession.value.avgPaceSecPerKm
    }
  }

  return {
    profile,
    recovery,
    route,
    shoes,
    workoutOfTheDay,
    currentWorkout,
    history,
    heartRateSource,
    activeSession,
    selectedShoe,
    targetZone,
    targetZoneAppearance,
    recoveryRecommendation,
    adaptedWorkout,
    sessionProgress,
    startWorkoutSession,
    pauseWorkoutSession,
    resumeWorkoutSession,
    appendTrackPoint,
    refreshActiveSession,
    evaluateWorkoutAlert,
    finishActiveSession,
    restorePersistedActiveSession
  }
})

function getPlannedPaceSecPerKm(durationMin?: number, distanceKm?: number) {
  if (!durationMin || !distanceKm) return undefined
  return Math.round((durationMin * 60) / distanceKm)
}
