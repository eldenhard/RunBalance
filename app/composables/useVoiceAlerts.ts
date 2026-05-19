import type { WorkoutAlert } from '~/types/workout-session'

type WorkoutEventOptions = {
  vibrate?: boolean
  vibrationPattern?: VibratePattern
}

export function useVoiceAlerts() {
  const isSupported = computed(() => import.meta.client && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window)
  const isVibrationSupported = computed(() => import.meta.client && 'vibrate' in navigator)
  const isEnabled = ref(true)
  const lastSpokenAlert = ref<WorkoutAlert | null>(null)

  function speak(alert: WorkoutAlert | null) {
    if (!alert || !isEnabled.value || !isSupported.value) return false

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(alert.message)
    utterance.lang = 'ru-RU'
    utterance.rate = 0.95
    window.speechSynthesis.speak(utterance)
    lastSpokenAlert.value = alert
    return true
  }

  function announceEvent(message: string, options: WorkoutEventOptions = {}) {
    const didSpeak = speakMessage(message)
    const shouldVibrate = options.vibrate ?? true
    const didVibrate = shouldVibrate ? vibrate(options.vibrationPattern ?? 80) : false

    return didSpeak || didVibrate
  }

  function toggle(enabled?: boolean) {
    isEnabled.value = typeof enabled === 'boolean' ? enabled : !isEnabled.value
  }

  function speakMessage(message: string) {
    if (!message || !isEnabled.value || !isSupported.value) return false

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(message)
    utterance.lang = 'ru-RU'
    utterance.rate = 0.95
    window.speechSynthesis.speak(utterance)
    return true
  }

  function vibrate(pattern: VibratePattern) {
    if (!isVibrationSupported.value) return false

    navigator.vibrate(pattern)
    return true
  }

  return {
    isSupported,
    isVibrationSupported,
    isEnabled,
    lastSpokenAlert,
    speak,
    announceEvent,
    vibrate,
    toggle
  }
}
