<script setup lang="ts">
import { CalendarDays, History, Home, Play, User } from '@lucide/vue'

const route = useRoute()

const primaryItems = [
  { label: 'Сегодня', to: '/', icon: Home },
  { label: 'План', to: '/plan', icon: CalendarDays }
]

const secondaryItems = [
  { label: 'История', to: '/history', icon: History },
  { label: 'Профиль', to: '/profile', icon: User }
]

const hideNavRoutes = ['/workout/active']
const showBottomNav = computed(() => !hideNavRoutes.includes(route.path))
const isStartActive = computed(() => route.path === '/start' || route.path === '/workout/result')
</script>

<template>
  <div class="min-h-dvh bg-[#f7f7f5]">
    <main class="app-frame min-h-dvh" :class="showBottomNav ? 'pb-28' : ''">
      <slot />
    </main>

    <nav v-if="showBottomNav" class="fixed inset-x-0 bottom-0 z-40 border-t border-[#deded9] bg-white/95 backdrop-blur">
      <div class="mx-auto flex h-20 max-w-md items-end justify-between px-4 pb-[max(env(safe-area-inset-bottom),8px)] pt-2">
        <NuxtLink
          v-for="item in primaryItems"
          :key="item.to"
          :to="item.to"
          class="flex w-16 flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[11px] font-medium text-[#767676] transition-colors"
          active-class="text-[#111111]"
        >
          <component :is="item.icon" class="h-5 w-5" />
          <span>{{ item.label }}</span>
        </NuxtLink>

        <NuxtLink
          to="/start"
          class="-mt-8 flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-full border border-[#111111] bg-[#111111] text-[10px] font-medium text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition-transform active:scale-95"
          :class="isStartActive ? 'ring-4 ring-[#11111122]' : ''"
          aria-label="Старт тренировки"
        >
          <Play class="h-6 w-6 fill-current" />
          <span>Старт</span>
        </NuxtLink>

        <NuxtLink
          v-for="item in secondaryItems"
          :key="item.to"
          :to="item.to"
          class="flex w-16 flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[11px] font-medium text-[#767676] transition-colors"
          active-class="text-[#111111]"
        >
          <component :is="item.icon" class="h-5 w-5" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>
