<script setup lang="ts">
import { CheckCircle2, ChevronRight, Save, Sparkles } from '@lucide/vue'
import { appThemePalettes } from '~/services/themePalettes'
import type { UserGoal } from '~/types/profile'

const store = useRunBalanceStore()
const isEditing = ref(false)

const goalOptions: { value: UserGoal, label: string }[] = [
  { value: 'base', label: 'Базовая форма' },
  { value: 'return_to_running', label: 'Возвращение' },
  { value: '5k', label: '5 км' },
  { value: '10k', label: '10 км' },
  { value: 'half_marathon', label: 'Полумарафон' }
]

const form = reactive({
  displayName: store.profile.displayName,
  goal: store.profile.goal as UserGoal,
  maxHeartRate: String(store.profile.maxHeartRate || '')
})

watch(() => store.profile, (next) => {
  if (!isEditing.value) {
    form.displayName = next.displayName
    form.goal = next.goal
    form.maxHeartRate = String(next.maxHeartRate || '')
  }
}, { deep: true })

function saveProfile() {
  store.updateProfile({
    displayName: form.displayName.trim() || 'Бегун',
    goal: form.goal,
    maxHeartRate: Number(form.maxHeartRate) || 0
  })
  isEditing.value = false
}

function selectColorTheme(themeId: typeof appThemePalettes[number]['id']) {
  store.updateProfile({ colorThemeId: themeId })
}
</script>

<template>
  <div class="theme-light space-y-4 p-4">
    <ScreenHeader eyebrow="Профиль" :title="store.profile.displayName || 'Профиль не заполнен'" />

    <NuxtLink v-if="store.needsOnboarding" to="/welcome" class="block">
      <Card class="p-4">
        <div class="flex items-start gap-3">
          <Sparkles class="mt-0.5 h-5 w-5 text-[#111111]" />
          <div class="flex-1">
            <p class="text-xs text-[#767676]">Онбординг</p>
            <h2 class="mt-1 font-medium">Пройти знакомство</h2>
          </div>
          <ChevronRight class="mt-1 h-5 w-5 text-[#767676]" />
        </div>
      </Card>
    </NuxtLink>

    <Card class="p-4">
      <div v-if="!isEditing" class="grid grid-cols-2 gap-3">
        <div>
          <p class="text-sm text-[#767676]">Цель</p>
          <p class="text-xl font-medium">{{ goalOptions.find((option) => option.value === store.profile.goal)?.label ?? '—' }}</p>
        </div>
        <div>
          <p class="text-sm text-[#767676]">Макс. пульс</p>
          <p class="text-xl font-medium">{{ store.profile.maxHeartRate || '—' }}</p>
        </div>
      </div>

      <div v-else class="grid gap-3">
        <label class="grid gap-1.5">
          <span class="text-sm font-medium">Имя</span>
          <input v-model="form.displayName" class="h-12 rounded-2xl border border-[#deded9] bg-white px-4 text-[16px] outline-none" />
        </label>
        <label class="grid gap-1.5">
          <span class="text-sm font-medium">Цель</span>
          <select v-model="form.goal" class="h-12 rounded-2xl border border-[#deded9] bg-white px-4 text-[16px] outline-none">
            <option v-for="option in goalOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>
        <label class="grid gap-1.5">
          <span class="text-sm font-medium">Максимальный пульс</span>
          <input v-model="form.maxHeartRate" inputmode="numeric" placeholder="например, 190" class="h-12 rounded-2xl border border-[#deded9] bg-white px-4 text-[16px] outline-none" />
        </label>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-3">
        <Button v-if="!isEditing" class="w-full" variant="outline" @click="isEditing = true">Редактировать</Button>
        <template v-else>
          <Button class="w-full" variant="outline" @click="isEditing = false">Отмена</Button>
          <Button class="w-full" @click="saveProfile">
            <Save class="h-4 w-4" />
            Сохранить
          </Button>
        </template>
      </div>
    </Card>

    <Card class="p-4">
      <div class="mb-4">
        <p class="text-xs text-[#767676]">Цвет приложения</p>
        <h2 class="mt-1 font-medium">Палитра профиля</h2>
      </div>

      <div class="grid gap-2">
        <button
          v-for="palette in appThemePalettes"
          :key="palette.id"
          type="button"
          class="flex items-center justify-between gap-3 rounded-2xl border bg-white p-3 text-left transition active:scale-[0.99]"
          :class="store.profile.colorThemeId === palette.id ? 'border-[#111111] shadow-[0_0_0_1px_#111111]' : 'border-[#deded9]'"
          @click="selectColorTheme(palette.id)"
        >
          <div class="flex min-w-0 items-center gap-3">
            <div class="flex shrink-0 -space-x-2">
              <span class="h-8 w-8 rounded-full border-2 border-white" :style="{ backgroundColor: palette.primary }" />
              <span class="h-8 w-8 rounded-full border-2 border-white" :style="{ backgroundColor: palette.secondary }" />
              <span class="h-8 w-8 rounded-full border-2 border-white" :style="{ backgroundColor: palette.sport }" />
            </div>
            <div class="min-w-0">
              <p class="truncate font-medium">{{ palette.name }}</p>
              <p class="truncate text-sm text-[#767676]">{{ palette.description }}</p>
            </div>
          </div>
          <CheckCircle2
            class="h-5 w-5 shrink-0"
            :class="store.profile.colorThemeId === palette.id ? 'text-[#111111]' : 'text-transparent'"
          />
        </button>
      </div>
    </Card>

    <Card class="p-4">
      <h2 class="font-medium">Разделы</h2>
      <div class="mt-3 space-y-2">
        <NuxtLink to="/recovery" class="flex justify-between rounded-2xl border border-[#deded9] bg-[#f7f7f5] p-3 text-sm">
          <span class="font-medium">Восстановление</span>
          <span class="text-[#767676]">{{ store.recovery?.readinessScore ?? '—' }}</span>
        </NuxtLink>
        <NuxtLink to="/heart-rate-zones" class="flex justify-between rounded-2xl border border-[#deded9] bg-[#f7f7f5] p-3 text-sm">
          <span class="font-medium">Пульсовые зоны</span>
          <span class="text-[#767676]">{{ store.profile.zones.length }}</span>
        </NuxtLink>
        <NuxtLink to="/shoes" class="flex justify-between rounded-2xl border border-[#deded9] bg-[#f7f7f5] p-3 text-sm">
          <span class="font-medium">Кроссовки</span>
          <span class="text-[#767676]">{{ store.shoes.length }}</span>
        </NuxtLink>
        <NuxtLink to="/routes" class="flex justify-between rounded-2xl border border-[#deded9] bg-[#f7f7f5] p-3 text-sm">
          <span class="font-medium">Маршруты</span>
          <span class="text-[#767676]">{{ store.routes.length }}</span>
        </NuxtLink>
        <NuxtLink to="/analytics" class="flex justify-between rounded-2xl border border-[#deded9] bg-[#f7f7f5] p-3 text-sm">
          <span class="font-medium">Аналитика</span>
          <span class="text-[#767676]">{{ store.analyticsReport.summary.totalRuns }}</span>
        </NuxtLink>
      </div>
    </Card>

    <Card v-if="!store.needsOnboarding" class="p-4">
      <div class="flex items-center gap-3">
        <CheckCircle2 class="h-5 w-5 text-[#2f6b31]" />
        <p class="text-sm text-[#62625e]">Профиль локальный. Данные хранятся только на устройстве.</p>
      </div>
    </Card>
  </div>
</template>
