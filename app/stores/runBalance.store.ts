import { defineStore } from 'pinia'
import { seedHistory, seedPlannedWorkouts, seedProfile, seedRecovery, seedRoute, seedShoes } from '~/data/seedRunBalance'
import { iosSafariPwaHeartRateUnavailable } from '~/services/heart-rate/heartRateSource'
import { getHeartRateZoneAppearance } from '~/services/heartRateZones'
import { getRecoveryRecommendation } from '~/services/recovery'
import { addWorkoutDistanceToShoe } from '~/services/shoes'
import { adaptWorkoutForReadiness } from '~/services/trainingPlan'
import { createWorkoutSession, finishWorkoutSession, restoreWorkoutSession, serializeWorkoutSession, updateWorkoutSessionMetrics } from '~/services/workoutSession'
import { getWorkoutAlert } from '~/services/voiceAlerts'
import type { UserProfile } from '~/types/profile'
import type { RecoveryCheckIn } from '~/types/recovery'
import type { Route } from '~/types/route'
import type { Shoe } from '~/types/shoe'
import type { Workout, WorkoutType } from '~/types/workout'
import type { TrackPoint, WorkoutSession } from '~/types/workout-session'

const APP_STATE_STORAGE_KEY = 'runbalance.appState'
const ACTIVE_SESSION_STORAGE_KEY = 'runbalance.activeWorkoutSession'

type RunBalanceSnapshot = {
  profile: UserProfile
  recovery: RecoveryCheckIn
  route: Route
  shoes: Shoe[]
  plannedWorkouts: Workout[]
  selectedWorkoutId: string | null
  history: Workout[]
}

export const useRunBalanceStore = defineStore('run-balance', () => {
  const profile = ref(structuredClone(seedProfile))
  const recovery = ref(structuredClone(seedRecovery))
  const route = ref(structuredClone(seedRoute))
  const shoes = ref(structuredClone(seedShoes))
  const plannedWorkouts = ref<Workout[]>(structuredClone(seedPlannedWorkouts))
  const selectedWorkoutId = ref<string | null>(plannedWorkouts.value[0]?.id ?? null)
  const history = ref<Workout[]>(structuredClone(seedHistory))
  const heartRateSource = ref(iosSafariPwaHeartRateUnavailable)
  const activeSession = ref<WorkoutSession | null>(null)
  const currentWorkout = ref<Workout>(createFallbackWorkout())
  const hasHydrated = ref(false)

  const workoutOfTheDay = computed<Workout>(() => {
    const selectedWorkout = plannedWorkouts.value.find((workout) => workout.id === selectedWorkoutId.value)
    return selectedWorkout ?? plannedWorkouts.value[0] ?? createFallbackWorkout()
  })
  const adaptedWorkout = computed(() => adaptWorkoutForReadiness(workoutOfTheDay.value, recovery.value.readinessScore))
  const selectedShoe = computed(() => {
    const shoeId = currentWorkout.value.shoeId ?? workoutOfTheDay.value.shoeId
    return shoes.value.find((shoe) => shoe.id === shoeId) ?? shoes.value[0]
  })
  const targetZone = computed(() => {
    const zoneId = currentWorkout.value.targetZoneId ?? adaptedWorkout.value.targetZoneId
    return profile.value.zones.find((zone) => zone.id === zoneId)
  })
  const targetZoneAppearance = computed(() => getHeartRateZoneAppearance(targetZone.value?.id))
  const recoveryRecommendation = computed(() => getRecoveryRecommendation(recovery.value.readinessScore))
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

  watch(adaptedWorkout, (nextWorkout) => {
    if (activeSession.value) return
    currentWorkout.value = nextWorkout
  }, { immediate: true, deep: true })

  function startWorkoutSession(startedAt = new Date().toISOString()) {
    startSession(adaptedWorkout.value, startedAt)
  }

  function startFreeWorkoutSession(startedAt = new Date().toISOString()) {
    startSession(createFreeWorkout(selectedShoe.value?.id), startedAt)
  }

  function startSession(workout: Workout, startedAt: string) {
    currentWorkout.value = workout
    activeSession.value = createWorkoutSession(workout, startedAt)
    persistState()
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
    plannedWorkouts.value = plannedWorkouts.value.filter((workout) => workout.id !== activeSession.value?.workoutId)
    if (selectedWorkoutId.value === activeSession.value.workoutId) {
      selectedWorkoutId.value = plannedWorkouts.value[0]?.id ?? null
    }
    activeSession.value = {
      ...activeSession.value,
      status: 'finished',
      finishedAt
    }
    persistState()
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

  function restoreLocalState() {
    if (!import.meta.client || hasHydrated.value) return

    const snapshot = window.localStorage.getItem(APP_STATE_STORAGE_KEY)
    if (snapshot) {
      try {
        const parsed = JSON.parse(snapshot) as RunBalanceSnapshot
        profile.value = parsed.profile
        recovery.value = parsed.recovery
        route.value = parsed.route
        shoes.value = parsed.shoes
        plannedWorkouts.value = parsed.plannedWorkouts
        selectedWorkoutId.value = parsed.selectedWorkoutId
        history.value = parsed.history
      } catch {
        window.localStorage.removeItem(APP_STATE_STORAGE_KEY)
      }
    }

    hasHydrated.value = true
  }

  function createPlannedWorkout(input: CreateWorkoutInput) {
    const nextWorkout: Workout = {
      id: `workout-plan-${Date.now()}`,
      title: input.title.trim(),
      type: input.type,
      scheduledDate: input.scheduledDate,
      plannedDistanceKm: input.plannedDistanceKm,
      plannedDurationMin: input.plannedDurationMin,
      targetZoneId: input.targetZoneId,
      routeId: route.value.id,
      shoeId: input.shoeId,
      heartRateSource: 'unavailable'
    }

    plannedWorkouts.value = [nextWorkout, ...plannedWorkouts.value]
    selectedWorkoutId.value = nextWorkout.id
    persistState()
  }

  function selectPlannedWorkout(workoutId: string) {
    selectedWorkoutId.value = workoutId
    persistState()
  }

  function deletePlannedWorkout(workoutId: string) {
    plannedWorkouts.value = plannedWorkouts.value.filter((workout) => workout.id !== workoutId)
    if (selectedWorkoutId.value === workoutId) {
      selectedWorkoutId.value = plannedWorkouts.value[0]?.id ?? null
    }
    persistState()
  }

  function updateHeartRateZone(zoneId: string, updates: { name: string, minBpm: number, maxBpm: number }) {
    profile.value = {
      ...profile.value,
      zones: profile.value.zones.map((zone) => zone.id === zoneId ? { ...zone, ...updates } : zone)
    }
    persistState()
  }

  function persistState() {
    if (!import.meta.client) return
    const snapshot: RunBalanceSnapshot = {
      profile: profile.value,
      recovery: recovery.value,
      route: route.value,
      shoes: shoes.value,
      plannedWorkouts: plannedWorkouts.value,
      selectedWorkoutId: selectedWorkoutId.value,
      history: history.value
    }
    window.localStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(snapshot))
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
      ...currentWorkout.value,
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
    plannedWorkouts,
    selectedWorkoutId,
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
    startFreeWorkoutSession,
    pauseWorkoutSession,
    resumeWorkoutSession,
    appendTrackPoint,
    refreshActiveSession,
    evaluateWorkoutAlert,
    finishActiveSession,
    restorePersistedActiveSession,
    restoreLocalState,
    createPlannedWorkout,
    selectPlannedWorkout,
    deletePlannedWorkout,
    updateHeartRateZone
  }
})

type CreateWorkoutInput = {
  title: string
  type: WorkoutType
  scheduledDate: string
  plannedDistanceKm?: number
  plannedDurationMin?: number
  targetZoneId?: string
  shoeId?: string
}

function createFreeWorkout(shoeId?: string): Workout {
  return {
    id: `free-${Date.now()}`,
    type: 'free',
    title: 'Свободный бег',
    plannedDurationMin: 0,
    plannedDistanceKm: 0,
    targetZoneId: 'z2',
    shoeId,
    heartRateSource: 'unavailable'
  }
}

function createFallbackWorkout(): Workout {
  return {
    id: 'workout-empty',
    type: 'free',
    title: 'Свободный бег',
    plannedDurationMin: 0,
    plannedDistanceKm: 0,
    targetZoneId: 'z2',
    heartRateSource: 'unavailable'
  }
}

function getPlannedPaceSecPerKm(durationMin?: number, distanceKm?: number) {
  if (!durationMin || !distanceKm) return undefined
  return Math.round((durationMin * 60) / distanceKm)
}
