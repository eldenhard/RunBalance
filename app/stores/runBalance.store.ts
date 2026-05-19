import { defineStore } from 'pinia'
import {
  emptyHistory,
  emptyPlannedWorkouts,
  emptyProfile,
  emptyRecovery,
  emptyRoutes,
  emptyShoes
} from '~/data/seedRunBalance'
import { buildAnalyticsReport } from '~/services/analytics'
import { iosSafariPwaHeartRateUnavailable } from '~/services/heart-rate/heartRateSource'
import { createDefaultHeartRateZones, getHeartRateZoneAppearance } from '~/services/heartRateZones'
import { getRecoveryRecommendation } from '~/services/recovery'
import { createRoute, createRouteFromTrack, pickSuggestedRoute, type RouteDraft } from '~/services/routes'
import { addWorkoutDistanceToShoe, getShoeStatus } from '~/services/shoes'
import { getAppThemePalette } from '~/services/themePalettes'
import { adaptWorkoutForReadiness } from '~/services/trainingPlan'
import { createWorkoutSession, finishWorkoutSession, restoreWorkoutSession, serializeWorkoutSession, updateWorkoutSessionMetrics } from '~/services/workoutSession'
import { getWorkoutAlert } from '~/services/voiceAlerts'
import type { AppColorThemeId, UserGoal, UserProfile } from '~/types/profile'
import type { RecoveryCheckIn } from '~/types/recovery'
import type { Route } from '~/types/route'
import type { Shoe } from '~/types/shoe'
import type { Workout, WorkoutType } from '~/types/workout'
import type { TrackPoint, WorkoutSession } from '~/types/workout-session'

const APP_STATE_STORAGE_KEY = 'runbalance.appState'
const ACTIVE_SESSION_STORAGE_KEY = 'runbalance.activeWorkoutSession'

type RunBalanceSnapshot = {
  profile: UserProfile
  recovery: RecoveryCheckIn | null
  routes: Route[]
  shoes: Shoe[]
  activeShoeId: string | null
  plannedWorkouts: Workout[]
  selectedWorkoutId: string | null
  selectedRouteId: string | null
  history: Workout[]
}

type CreateShoeInput = {
  name: string
  brand?: string
  model?: string
  mileageKm?: number
  resourceKm: number
  startedAt?: string
}

type UpdateShoeInput = Partial<CreateShoeInput> & { status?: Shoe['status'] }

type ProfileUpdateInput = {
  displayName?: string
  goal?: UserGoal
  colorThemeId?: AppColorThemeId
  maxHeartRate?: number
  trainingDays?: number[]
}

export const useRunBalanceStore = defineStore('run-balance', () => {
  const profile = ref<UserProfile>(structuredClone(emptyProfile))
  const recovery = ref<RecoveryCheckIn | null>(emptyRecovery)
  const routes = ref<Route[]>(structuredClone(emptyRoutes))
  const shoes = ref<Shoe[]>(structuredClone(emptyShoes))
  const activeShoeId = ref<string | null>(null)
  const plannedWorkouts = ref<Workout[]>(structuredClone(emptyPlannedWorkouts))
  const selectedWorkoutId = ref<string | null>(null)
  const selectedRouteId = ref<string | null>(null)
  const history = ref<Workout[]>(structuredClone(emptyHistory))
  const heartRateSource = ref(iosSafariPwaHeartRateUnavailable)
  const activeSession = ref<WorkoutSession | null>(null)
  const currentWorkout = ref<Workout>(createFallbackWorkout())
  const hasHydrated = ref(false)

  const readinessScore = computed(() => recovery.value?.readinessScore ?? 100)
  const appThemePalette = computed(() => getAppThemePalette(profile.value.colorThemeId))

  const workoutOfTheDay = computed<Workout>(() => {
    const selectedWorkout = plannedWorkouts.value.find((workout) => workout.id === selectedWorkoutId.value)
    return selectedWorkout ?? plannedWorkouts.value[0] ?? createFallbackWorkout()
  })
  const adaptedWorkout = computed(() => adaptWorkoutForReadiness(workoutOfTheDay.value, readinessScore.value))
  const activeShoe = computed<Shoe | undefined>(() => {
    if (activeShoeId.value) {
      const explicit = shoes.value.find((shoe) => shoe.id === activeShoeId.value)
      if (explicit) return explicit
    }
    return shoes.value.find((shoe) => shoe.status === 'active') ?? shoes.value[0]
  })
  const selectedShoe = computed<Shoe | undefined>(() => {
    const shoeId = currentWorkout.value.shoeId ?? workoutOfTheDay.value.shoeId
    if (shoeId) {
      const direct = shoes.value.find((shoe) => shoe.id === shoeId)
      if (direct) return direct
    }
    return activeShoe.value
  })
  const targetZone = computed(() => {
    const zoneId = currentWorkout.value.targetZoneId ?? adaptedWorkout.value.targetZoneId
    return profile.value.zones.find((zone) => zone.id === zoneId)
  })
  const targetZoneAppearance = computed(() => getHeartRateZoneAppearance(targetZone.value?.id))
  const recoveryRecommendation = computed(() => getRecoveryRecommendation(readinessScore.value))
  const suggestedRoute = computed(() => {
    return pickSuggestedRoute(routes.value, adaptedWorkout.value.plannedDistanceKm)
  })
  const activeRoute = computed<Route | undefined>(() => {
    const explicitId = workoutOfTheDay.value.routeId ?? selectedRouteId.value
    const explicitRoute = explicitId ? routes.value.find((item) => item.id === explicitId) : undefined
    return explicitRoute ?? suggestedRoute.value ?? routes.value[0]
  })
  const analyticsReport = computed(() => buildAnalyticsReport(history.value))
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
  const needsOnboarding = computed(() => !profile.value.onboarded)

  watch(adaptedWorkout, (nextWorkout) => {
    if (activeSession.value) return
    currentWorkout.value = nextWorkout
  }, { immediate: true, deep: true })

  function startWorkoutSession(startedAt = new Date().toISOString()) {
    startSession(adaptedWorkout.value, startedAt)
  }

  function startFreeWorkoutSession(startedAt = new Date().toISOString()) {
    startSession(createFreeWorkout(activeShoe.value?.id), startedAt)
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

    const routeSnapshot = activeSession.value.trackPoints.length >= 1
      ? createRouteFromTrack(activeSession.value.trackPoints, activeRoute.value, activeSession.value.distanceKm)
      : activeRoute.value

    const finishedWorkout = {
      ...finishWorkoutSession(activeSession.value, currentWorkout.value, finishedAt),
      routeSnapshot
    }
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

  function deleteHistoryWorkout(workoutId: string) {
    history.value = history.value.filter((workout) => workout.id !== workoutId)
    persistState()
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
        const parsed = JSON.parse(snapshot) as Partial<RunBalanceSnapshot>
        if (parsed.profile) {
          profile.value = {
            ...emptyProfile,
            ...parsed.profile
          }
        }
        if (parsed.recovery !== undefined) recovery.value = parsed.recovery
        if (Array.isArray(parsed.routes)) routes.value = parsed.routes
        if (Array.isArray(parsed.shoes)) shoes.value = parsed.shoes
        if (parsed.activeShoeId !== undefined) activeShoeId.value = parsed.activeShoeId
        if (Array.isArray(parsed.plannedWorkouts)) plannedWorkouts.value = parsed.plannedWorkouts
        if (parsed.selectedWorkoutId !== undefined) selectedWorkoutId.value = parsed.selectedWorkoutId
        if (parsed.selectedRouteId !== undefined) selectedRouteId.value = parsed.selectedRouteId
        if (Array.isArray(parsed.history)) history.value = parsed.history
      } catch {
        window.localStorage.removeItem(APP_STATE_STORAGE_KEY)
      }
    }

    hasHydrated.value = true
  }

  function completeOnboarding(input: { displayName: string, goal: UserGoal, maxHeartRate: number, trainingDays?: number[] }) {
    const safeName = input.displayName.trim() || 'Бегун'
    const safeMax = Math.round(input.maxHeartRate)
    const zones = safeMax > 0 ? createDefaultHeartRateZones(safeMax) : []
    profile.value = {
      ...profile.value,
      displayName: safeName,
      goal: input.goal,
      maxHeartRate: safeMax,
      trainingDays: input.trainingDays ?? profile.value.trainingDays,
      zones,
      onboarded: true
    }
    persistState()
  }

  function skipOnboarding() {
    profile.value = { ...profile.value, onboarded: true }
    persistState()
  }

  function updateProfile(input: ProfileUpdateInput) {
    profile.value = {
      ...profile.value,
      ...input,
      maxHeartRate: input.maxHeartRate !== undefined ? Math.round(input.maxHeartRate) : profile.value.maxHeartRate
    }
    if (input.maxHeartRate && profile.value.zones.length === 0) {
      profile.value.zones = createDefaultHeartRateZones(input.maxHeartRate)
    }
    persistState()
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
      routeId: input.routeId ?? selectedRouteId.value ?? routes.value[0]?.id,
      shoeId: input.shoeId ?? activeShoe.value?.id,
      heartRateSource: 'unavailable'
    }

    plannedWorkouts.value = [nextWorkout, ...plannedWorkouts.value]
    selectedWorkoutId.value = nextWorkout.id
    if (nextWorkout.routeId) selectedRouteId.value = nextWorkout.routeId
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

  function createSavedRoute(draft: RouteDraft) {
    const nextRoute = createRoute(draft)
    routes.value = [nextRoute, ...routes.value]
    selectedRouteId.value = nextRoute.id
    persistState()
    return nextRoute
  }

  function saveRouteSnapshot(route: Route, name?: string) {
    const nextRoute: Route = {
      ...route,
      id: `route-saved-${Date.now()}`,
      name: name?.trim() || route.name || 'Сохранённый трек',
      isPrivate: true
    }
    routes.value = [nextRoute, ...routes.value]
    selectedRouteId.value = nextRoute.id
    persistState()
    return nextRoute
  }

  function deleteSavedRoute(routeId: string) {
    routes.value = routes.value.filter((item) => item.id !== routeId)
    if (selectedRouteId.value === routeId) {
      selectedRouteId.value = routes.value[0]?.id ?? null
    }
    plannedWorkouts.value = plannedWorkouts.value.map((workout) => {
      if (workout.routeId !== routeId) return workout
      return { ...workout, routeId: routes.value[0]?.id }
    })
    persistState()
  }

  function selectRouteForToday(routeId: string) {
    selectedRouteId.value = routeId
    if (workoutOfTheDay.value && plannedWorkouts.value.some((workout) => workout.id === workoutOfTheDay.value.id)) {
      plannedWorkouts.value = plannedWorkouts.value.map((workout) => {
        if (workout.id !== workoutOfTheDay.value.id) return workout
        return { ...workout, routeId }
      })
    }
    persistState()
  }

  function assignRouteToPlannedWorkout(workoutId: string, routeId: string | undefined) {
    plannedWorkouts.value = plannedWorkouts.value.map((workout) => {
      if (workout.id !== workoutId) return workout
      return { ...workout, routeId }
    })
    if (routeId && workoutId === selectedWorkoutId.value) {
      selectedRouteId.value = routeId
    }
    persistState()
  }

  function createShoe(input: CreateShoeInput) {
    const safeName = input.name.trim() || 'Новые кроссовки'
    const resource = input.resourceKm > 0 ? Math.round(input.resourceKm) : 600
    const mileage = input.mileageKm && input.mileageKm > 0 ? Number(input.mileageKm.toFixed(1)) : 0
    const nextShoe: Shoe = {
      id: `shoe-${Date.now()}`,
      name: safeName,
      brand: input.brand?.trim() || undefined,
      model: input.model?.trim() || undefined,
      startedAt: input.startedAt || undefined,
      mileageKm: mileage,
      resourceKm: resource,
      status: getShoeStatus({ mileageKm: mileage, resourceKm: resource })
    }
    shoes.value = [nextShoe, ...shoes.value]
    if (!activeShoeId.value) activeShoeId.value = nextShoe.id
    persistState()
    return nextShoe
  }

  function updateShoe(shoeId: string, updates: UpdateShoeInput) {
    shoes.value = shoes.value.map((shoe) => {
      if (shoe.id !== shoeId) return shoe
      const nextMileage = updates.mileageKm !== undefined ? Number(updates.mileageKm.toFixed(1)) : shoe.mileageKm
      const nextResource = updates.resourceKm !== undefined && updates.resourceKm > 0
        ? Math.round(updates.resourceKm)
        : shoe.resourceKm
      const nextStatus = updates.status ?? getShoeStatus({ mileageKm: nextMileage, resourceKm: nextResource })
      return {
        ...shoe,
        name: updates.name !== undefined ? updates.name.trim() || shoe.name : shoe.name,
        brand: updates.brand !== undefined ? updates.brand.trim() || undefined : shoe.brand,
        model: updates.model !== undefined ? updates.model.trim() || undefined : shoe.model,
        startedAt: updates.startedAt !== undefined ? updates.startedAt || undefined : shoe.startedAt,
        mileageKm: nextMileage,
        resourceKm: nextResource,
        status: nextStatus
      }
    })
    persistState()
  }

  function deleteShoe(shoeId: string) {
    shoes.value = shoes.value.filter((shoe) => shoe.id !== shoeId)
    if (activeShoeId.value === shoeId) {
      activeShoeId.value = shoes.value.find((shoe) => shoe.status === 'active')?.id ?? null
    }
    persistState()
  }

  function setActiveShoe(shoeId: string | null) {
    activeShoeId.value = shoeId
    persistState()
  }

  function saveRecoveryCheckIn(checkIn: RecoveryCheckIn) {
    recovery.value = checkIn
    persistState()
  }

  function persistState() {
    if (!import.meta.client) return
    const snapshot: RunBalanceSnapshot = {
      profile: profile.value,
      recovery: recovery.value,
      routes: routes.value,
      shoes: shoes.value,
      activeShoeId: activeShoeId.value,
      plannedWorkouts: plannedWorkouts.value,
      selectedWorkoutId: selectedWorkoutId.value,
      selectedRouteId: selectedRouteId.value,
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
    routes,
    selectedRouteId,
    activeRoute,
    suggestedRoute,
    shoes,
    activeShoeId,
    activeShoe,
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
    analyticsReport,
    readinessScore,
    appThemePalette,
    needsOnboarding,
    startWorkoutSession,
    startFreeWorkoutSession,
    pauseWorkoutSession,
    resumeWorkoutSession,
    appendTrackPoint,
    refreshActiveSession,
    evaluateWorkoutAlert,
    finishActiveSession,
    deleteHistoryWorkout,
    restorePersistedActiveSession,
    restoreLocalState,
    completeOnboarding,
    skipOnboarding,
    updateProfile,
    createPlannedWorkout,
    selectPlannedWorkout,
    deletePlannedWorkout,
    updateHeartRateZone,
    createSavedRoute,
    saveRouteSnapshot,
    deleteSavedRoute,
    selectRouteForToday,
    assignRouteToPlannedWorkout,
    createShoe,
    updateShoe,
    deleteShoe,
    setActiveShoe,
    saveRecoveryCheckIn
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
  routeId?: string
}

function createFreeWorkout(shoeId?: string): Workout {
  return {
    id: `free-${Date.now()}`,
    type: 'free',
    title: 'Свободный бег',
    plannedDurationMin: 0,
    plannedDistanceKm: 0,
    targetZoneId: undefined,
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
    targetZoneId: undefined,
    heartRateSource: 'unavailable'
  }
}

function getPlannedPaceSecPerKm(durationMin?: number, distanceKm?: number) {
  if (!durationMin || !distanceKm) return undefined
  return Math.round((durationMin * 60) / distanceKm)
}
