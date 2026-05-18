<script setup lang="ts">
import { CalendarDays, History, Home, Play, User } from '@lucide/vue'

const navItems = [
  { label: 'Сегодня', to: '/', icon: Home },
  { label: 'План', to: '/plan', icon: CalendarDays },
  { label: 'Старт', to: '/start', icon: Play },
  { label: 'История', to: '/history', icon: History },
  { label: 'Профиль', to: '/profile', icon: User }
]
</script>

<template>
  <div class="min-h-dvh bg-[#f7f7f5]">
    <main class="mx-auto min-h-dvh w-full max-w-md pb-24">
      <slot />
    </main>

    <nav class="fixed inset-x-0 bottom-0 z-40 border-t border-[#deded9] bg-white/95 backdrop-blur">
      <div class="mx-auto grid h-16 max-w-md grid-cols-5">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-[#767676] transition-colors"
          active-class="text-[#111111]"
        >
          <component :is="item.icon" class="h-5 w-5" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>
