<script setup lang="ts">
import { CheckCircle2, Palette } from '@lucide/vue'
import { appThemePalettes } from '~/services/themePalettes'
import type { AppColorThemeId } from '~/types/profile'

const store = useRunBalanceStore()

function selectColorTheme(themeId: AppColorThemeId) {
  store.updateProfile({ colorThemeId: themeId })
}
</script>

<template>
  <div class="theme-light min-h-dvh space-y-4 p-4">
    <ScreenHeader eyebrow="Настройки" title="Цвет приложения" />

    <Card class="overflow-hidden p-0">
      <div class="bg-gradient-to-r from-[var(--theme-primary)] via-[var(--theme-secondary)] to-[var(--theme-sport)] p-4 text-[#111111]">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80">
            <Palette class="h-5 w-5" />
          </div>
          <div>
            <p class="text-sm font-medium">Активная палитра</p>
            <h2 class="text-xl font-medium">{{ store.appThemePalette.name }}</h2>
          </div>
        </div>
      </div>

      <div class="grid gap-2 p-4">
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
  </div>
</template>
