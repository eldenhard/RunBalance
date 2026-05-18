import { defineStore } from 'pinia'
import { activeWorkout, mockActiveTrackPoints, mockProfile, mockRecovery, mockRoute, mockShoes, todayWorkout, workoutHistory } from '~/data/mockRunBalance'
import { iosSafariPwaHeartRateUnavailable } from '~/services/heart-rate/heartRateSource'
import { getRecoveryRecommendation } from '~/services/recovery'
import { addWorkoutDistanceToShoe } from '~/services/shoes'
import { adaptWorkoutForReadiness } from '~/services/trainingPlan'
import { createWorkoutSession, finishWorkoutSession, restoreWorkoutSession, serializeWorkoutSession, updateWorkoutSessionMetrics } from '~/services/workoutSession'
import { getWorkoutAlert } from '~/services/voiceAlerts'
import type { TrackPoint, WorkoutSession } from '~/types/workout-session'

const ACTIVE_SESSION_STORAGE_KEY = 'runbalance.activeWorkoutSession'

const initialActiveSession = updateWorkoutSessionMetrics(
  {
    ...createWorkoutSession(activeWorkout, activeWorkout.startedAt ?? '2026-05-18T07:20:00.000Z'),
    trackPoints: mockActiveTrackPoints
  },
  '2026-05-18T07:45:30.000Z'
)

export const useRunBalanceStore = defineStore('run-balance', () => {
  const profile = ref(mockProfile)
  const recovery = ref(mockRecovery)
  const route = ref(mockRoute)
  const shoes = ref(mockShoes)
  const workoutOfTheDay = ref(todayWorkout)
  const currentWorkout = ref(activeWorkout)
  const history = ref(workoutHistory)
  const heartRateSource = ref(iosSafariPwaHeartRateUnavailable)
  const activeSession = ref<WorkoutSession | null>(initialActiveSession)

  const selectedShoe = computed(() => shoes.value.find((shoe) => shoe.id === workoutOfTheDay.value.shoeId))
  const targetZone = computed(() => profile.value.zones.find((zone) => zone.id === workoutOfTheDay.value.targetZoneId))
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
    currentWorkout.value = {
      ...adaptedWorkout.value,
      id: 'workout-active',
      startedAt,
      distanceKm: 0,
      durationSec: 0,
      avgPaceSecPerKm: undefined
    }
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
    clearPersistedActiveSession()
    return finishedWorkout
  }

  function restorePersistedActiveSession() {
    if (!import.meta.client) return null
    const restored = restoreWorkoutSession(window.localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY))
    if (!restored) return null
    activeSession.value = restored
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
    recoveryRecommendation,
    adaptedWorkout,
    sessionProgress,
    startWorkoutSession,
    pauseWorkoutSession,
    resumeWorkoutSession,
    appendTrackPoint,
    evaluateWorkoutAlert,
    finishActiveSession,
    restorePersistedActiveSession
  }
})

function getPlannedPaceSecPerKm(durationMin?: number, distanceKm?: number) {
  if (!durationMin || !distanceKm) return undefined
  return Math.round((durationMin * 60) / distanceKm)
}
