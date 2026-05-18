import type { WorkoutAlert } from '~/types/workout-session'

export function useVoiceAlerts() {
  const isSupported = computed(() => import.meta.client && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window)
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

  function toggle(enabled?: boolean) {
    isEnabled.value = typeof enabled === 'boolean' ? enabled : !isEnabled.value
  }

  return {
    isSupported,
    isEnabled,
    lastSpokenAlert,
    speak,
    toggle
  }
}
