<script setup lang="ts">
import { ArrowRight, Check, ChevronLeft } from '@lucide/vue'
import type { UserGoal } from '~/types/profile'

const store = useRunBalanceStore()
const router = useRouter()

const stepCount = 4
const stepIndex = ref(0)

const goalOptions: { value: UserGoal, label: string, hint: string }[] = [
  { value: 'base', label: 'Базовая форма', hint: 'регулярный бег без гонок' },
  { value: 'return_to_running', label: 'Возвращение', hint: 'мягкий вход обратно в бег' },
  { value: '5k', label: '5 км', hint: 'короткие старты, скоростные блоки' },
  { value: '10k', label: '10 км', hint: 'баланс темпа и выносливости' },
  { value: 'half_marathon', label: 'Полумарафон', hint: 'длинные пробежки и темп' }
]

const ageHint = ref('30')
const form = reactive({
  displayName: '',
  goal: 'base' as UserGoal,
  maxHeartRate: ''
})

const suggestedMaxHeartRate = computed(() => {
  const age = Number(ageHint.value)
  if (!Number.isFinite(age) || age <= 0) return undefined
  return Math.round(208 - age * 0.7)
})

function applySuggestion() {
  if (suggestedMaxHeartRate.value) {
    form.maxHeartRate = String(suggestedMaxHeartRate.value)
  }
}

const canContinue = computed(() => {
  if (stepIndex.value === 0) return true
  if (stepIndex.value === 1) return form.displayName.trim().length > 0
  if (stepIndex.value === 2) return Boolean(form.goal)
  if (stepIndex.value === 3) return Number(form.maxHeartRate) > 0
  return true
})

function next() {
  if (stepIndex.value < stepCount - 1) {
    stepIndex.value += 1
    return
  }
  store.completeOnboarding({
    displayName: form.displayName,
    goal: form.goal,
    maxHeartRate: Number(form.maxHeartRate)
  })
  router.push('/')
}

function back() {
  if (stepIndex.value === 0) {
    router.push('/')
    return
  }
  stepIndex.value -= 1
}

function skip() {
  store.skipOnboarding()
  router.push('/')
}
</script>

<template>
  <div class="theme-light flex min-h-dvh flex-col p-4" style="padding-top: calc(env(safe-area-inset-top, 0px) + 16px)">
    <div class="flex items-center justify-between pt-2">
      <button class="flex h-10 w-10 items-center justify-center rounded-full text-[#111111] active:bg-[#f0f0ed]" aria-label="Назад" @click="back">
        <ChevronLeft class="h-5 w-5" />
      </button>
      <div class="flex gap-1">
        <div
          v-for="index in stepCount"
          :key="index"
          class="h-1.5 w-6 rounded-full"
          :class="index - 1 <= stepIndex ? 'bg-[#111111]' : 'bg-[#e5e5df]'"
        />
      </div>
      <button class="text-sm font-medium text-[#767676]" @click="skip">Пропустить</button>
    </div>

    <main class="mt-8 flex-1 space-y-6">
      <template v-if="stepIndex === 0">
        <header class="space-y-3">
          <p class="text-xs font-medium uppercase tracking-wider text-[#767676]">RunBalance</p>
          <h1 class="text-[34px] font-medium leading-tight tracking-tight text-[#111111]">Спокойный беговой ассистент</h1>
          <p class="text-base leading-6 text-[#62625e]">
            Расчёт зон, восстановление, маршруты и пробег кроссовок — без шума и без диагнозов.
          </p>
        </header>

        <div class="space-y-3 pt-4">
          <div class="rounded-3xl border border-[#deded9] bg-white p-4">
            <p class="text-sm font-medium text-[#111111]">Локально и приватно</p>
            <p class="mt-1 text-sm text-[#62625e]">Тренировки сохраняются только на устройстве. Никаких аккаунтов на старте.</p>
          </div>
          <div class="rounded-3xl border border-[#deded9] bg-white p-4">
            <p class="text-sm font-medium text-[#111111]">Честные данные</p>
            <p class="mt-1 text-sm text-[#62625e]">Никаких подстановочных метрик: время и расстояние считаются от реальной сессии.</p>
          </div>
          <div class="rounded-3xl border border-[#deded9] bg-white p-4">
            <p class="text-sm font-medium text-[#111111]">Один взгляд — и ясно</p>
            <p class="mt-1 text-sm text-[#62625e]">Готовность, план, маршрут и обувь собираются на одном экране.</p>
          </div>
        </div>
      </template>

      <template v-else-if="stepIndex === 1">
        <header class="space-y-2">
          <p class="text-xs font-medium uppercase tracking-wider text-[#767676]">Шаг 1 · Имя</p>
          <h1 class="text-[28px] font-medium leading-tight text-[#111111]">Как тебя называть?</h1>
          <p class="text-sm leading-5 text-[#62625e]">Имя будет видно только на твоём устройстве.</p>
        </header>

        <label class="grid gap-1.5">
          <span class="text-sm font-medium">Имя</span>
          <input v-model="form.displayName" class="h-14 rounded-2xl border border-[#deded9] bg-white px-4 text-lg outline-none" placeholder="Например, Даня" autofocus />
        </label>
      </template>

      <template v-else-if="stepIndex === 2">
        <header class="space-y-2">
          <p class="text-xs font-medium uppercase tracking-wider text-[#767676]">Шаг 2 · Цель</p>
          <h1 class="text-[28px] font-medium leading-tight text-[#111111]">Что хочется на этом этапе?</h1>
          <p class="text-sm leading-5 text-[#62625e]">Можно сменить в любой момент в Профиле.</p>
        </header>

        <div class="grid gap-2">
          <button
            v-for="option in goalOptions"
            :key="option.value"
            class="flex items-start gap-3 rounded-3xl border bg-white p-4 text-left"
            :class="form.goal === option.value ? 'border-[#111111]' : 'border-[#deded9]'"
            @click="form.goal = option.value"
          >
            <div class="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border" :class="form.goal === option.value ? 'border-[#111111] bg-[#111111] text-white' : 'border-[#deded9]'">
              <Check v-if="form.goal === option.value" class="h-3 w-3" />
            </div>
            <div class="flex-1">
              <p class="font-medium text-[#111111]">{{ option.label }}</p>
              <p class="mt-0.5 text-sm text-[#767676]">{{ option.hint }}</p>
            </div>
          </button>
        </div>
      </template>

      <template v-else-if="stepIndex === 3">
        <header class="space-y-2">
          <p class="text-xs font-medium uppercase tracking-wider text-[#767676]">Шаг 3 · Пульс</p>
          <h1 class="text-[28px] font-medium leading-tight text-[#111111]">Максимальный пульс</h1>
          <p class="text-sm leading-5 text-[#62625e]">Если не знаешь точно, оценим по возрасту. Потом можно поправить.</p>
        </header>

        <div class="grid gap-3">
          <label class="grid gap-1.5">
            <span class="text-sm font-medium">Возраст (для оценки)</span>
            <input v-model="ageHint" inputmode="numeric" class="h-12 rounded-2xl border border-[#deded9] bg-white px-4 text-[16px] outline-none" placeholder="например, 30" />
          </label>

          <button
            class="rounded-2xl border border-dashed border-[#111111] bg-white px-4 py-3 text-left text-sm"
            :disabled="!suggestedMaxHeartRate"
            @click="applySuggestion"
          >
            <span class="font-medium">Предложить значение</span>
            <span class="ml-2 text-[#767676]">≈ {{ suggestedMaxHeartRate ?? '—' }} уд/мин</span>
          </button>

          <label class="grid gap-1.5">
            <span class="text-sm font-medium">Максимальный пульс</span>
            <input v-model="form.maxHeartRate" inputmode="numeric" class="h-14 rounded-2xl border border-[#deded9] bg-white px-4 text-lg outline-none" placeholder="например, 190" />
          </label>
        </div>
      </template>
    </main>

    <footer class="pt-4">
      <Button class="w-full" size="lg" :disabled="!canContinue" @click="next">
        {{ stepIndex === stepCount - 1 ? 'Готово' : 'Дальше' }}
        <ArrowRight class="h-5 w-5" />
      </Button>
    </footer>
  </div>
</template>
