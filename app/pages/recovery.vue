<script setup lang="ts">
import { Save } from '@lucide/vue'
import { calculateReadinessScore } from '~/services/recovery'
import type { RecoveryCheckIn } from '~/types/recovery'

const store = useRunBalanceStore()
const isEditing = ref(!store.recovery)

const form = reactive({
  sleepQuality: store.recovery?.sleepQuality ?? 3 as RecoveryCheckIn['sleepQuality'],
  fatigue: store.recovery?.fatigue ?? 5 as RecoveryCheckIn['fatigue'],
  soreness: store.recovery?.soreness ?? 'none' as RecoveryCheckIn['soreness'],
  stress: store.recovery?.stress ?? 4 as RecoveryCheckIn['stress'],
  restingHeartRate: String(store.recovery?.restingHeartRate ?? '')
})

const previewScore = computed(() => calculateReadinessScore({
  sleepQuality: form.sleepQuality,
  fatigue: form.fatigue,
  soreness: form.soreness,
  stress: form.stress,
  restingHeartRate: Number(form.restingHeartRate) || undefined
}))

const sleepOptions: RecoveryCheckIn['sleepQuality'][] = [1, 2, 3, 4, 5]
const sorenessOptions: RecoveryCheckIn['soreness'][] = ['none', 'light', 'strong']
const sorenessLabels: Record<RecoveryCheckIn['soreness'], string> = {
  none: 'нет',
  light: 'лёгкая',
  strong: 'сильная'
}

function saveCheckIn() {
  const restingHeartRate = Number(form.restingHeartRate)
  store.saveRecoveryCheckIn({
    id: `recovery-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    sleepQuality: form.sleepQuality,
    fatigue: form.fatigue,
    soreness: form.soreness,
    stress: form.stress,
    restingHeartRate: Number.isFinite(restingHeartRate) && restingHeartRate > 0 ? restingHeartRate : undefined,
    readinessScore: previewScore.value
  })
  isEditing.value = false
}
</script>

<template>
  <div class="theme-light min-h-dvh space-y-4 p-4">
    <ScreenHeader
      eyebrow="Восстановление"
      title="Ориентир по нагрузке"
      description="Короткий check-in помогает адаптировать тренировку без медицинских выводов."
    />

    <Card v-if="store.recovery && !isEditing" class="p-4">
      <div class="space-y-3">
        <div>
          <p class="text-xs text-[#767676]">Readiness</p>
          <p class="mt-1 text-[44px] font-medium leading-none">{{ store.recovery.readinessScore }}</p>
        </div>
        <Badge variant="success">{{ store.recoveryRecommendation.title }}</Badge>
      </div>
      <Progress class="mt-4" :value="store.recovery.readinessScore" />
      <p class="mt-3 text-sm leading-5 text-[#62625e]">{{ store.recoveryRecommendation.message }}</p>

      <div class="mt-4 grid grid-cols-2 gap-3">
        <MetricTile label="Сон" :value="`${store.recovery.sleepQuality}/5`" />
        <MetricTile label="Усталость" :value="`${store.recovery.fatigue}/10`" />
        <MetricTile label="Стресс" :value="`${store.recovery.stress}/10`" />
        <MetricTile label="Крепатура" :value="sorenessLabels[store.recovery.soreness]" />
      </div>

      <Button class="mt-4 w-full" variant="outline" @click="isEditing = true">Обновить check-in</Button>
    </Card>

    <Card v-else class="p-4">
      <h2 class="text-lg font-medium">{{ store.recovery ? 'Новый check-in' : 'Первый check-in' }}</h2>
      <p class="mt-1 text-sm text-[#767676]">Оцени короткий вопрос — мы пересчитаем готовность.</p>

      <div class="mt-4 space-y-4">
        <div>
          <p class="text-sm font-medium">Сон</p>
          <div class="mt-2 grid grid-cols-5 gap-2">
            <button
              v-for="option in sleepOptions"
              :key="option"
              class="rounded-2xl border border-[#deded9] py-2 text-sm font-medium"
              :class="form.sleepQuality === option ? 'bg-[#111111] text-white' : 'bg-white text-[#111111]'"
              @click="form.sleepQuality = option"
            >
              {{ option }}
            </button>
          </div>
        </div>

        <label class="block text-sm">
          <span class="font-medium">Усталость · {{ form.fatigue }}/10</span>
          <input v-model.number="form.fatigue" type="range" min="1" max="10" step="1" class="mt-2 w-full" />
        </label>

        <label class="block text-sm">
          <span class="font-medium">Стресс · {{ form.stress }}/10</span>
          <input v-model.number="form.stress" type="range" min="1" max="10" step="1" class="mt-2 w-full" />
        </label>

        <div>
          <p class="text-sm font-medium">Крепатура</p>
          <div class="mt-2 grid grid-cols-3 gap-2">
            <button
              v-for="option in sorenessOptions"
              :key="option"
              class="rounded-2xl border border-[#deded9] py-2 text-sm font-medium"
              :class="form.soreness === option ? 'bg-[#111111] text-white' : 'bg-white text-[#111111]'"
              @click="form.soreness = option"
            >
              {{ sorenessLabels[option] }}
            </button>
          </div>
        </div>

        <label class="grid gap-1.5">
          <span class="text-sm font-medium">Пульс в покое (необязательно)</span>
          <input v-model="form.restingHeartRate" inputmode="numeric" placeholder="например, 55" class="h-12 rounded-2xl border border-[#deded9] bg-white px-4 text-[16px] outline-none" />
        </label>

        <div class="rounded-2xl border border-[#deded9] bg-[#f7f7f5] p-3">
          <p class="text-xs text-[#767676]">Расчётная готовность</p>
          <p class="mt-1 text-2xl font-medium">{{ previewScore }}</p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <Button class="w-full" variant="outline" :disabled="!store.recovery" @click="isEditing = false">Отмена</Button>
          <Button class="w-full" @click="saveCheckIn">
            <Save class="h-4 w-4" />
            Сохранить
          </Button>
        </div>
      </div>
    </Card>

    <Card v-if="store.recovery" class="p-4">
      <h2 class="text-lg font-medium">Как адаптирован план</h2>
      <p class="mt-2 text-sm leading-5 text-[#62625e]">{{ store.adaptedWorkout.adaptationReason }}</p>
    </Card>
  </div>
</template>
