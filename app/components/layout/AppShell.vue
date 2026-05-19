<script setup lang="ts">
import {
  CalendarDays,
  History,
  Home,
  Play,
  User
} from '@lucide/vue'

const route = useRoute()

const navItems = [
  { label: 'Сегодня', to: '/', icon: Home, activePaths: ['/'] },
  { label: 'План', to: '/plan', icon: CalendarDays, activePaths: ['/plan', '/routes'] },
  { label: 'Трекер', to: '/start', icon: Play, primary: true, activePaths: ['/start', '/workout/active'] },
  { label: 'История', to: '/history', icon: History, activePaths: ['/history', '/workout/result'] },
  { label: 'Профиль', to: '/profile', icon: User, activePaths: ['/profile', '/shoes', '/recovery', '/heart-rate-zones', '/analytics'] }
]

const hideNavRoutes = ['/workout/active', '/welcome']
const showBottomNav = computed(() => !hideNavRoutes.includes(route.path))
const isDarkShell = computed(() => route.path === '/start' || route.path.startsWith('/workout/active'))
const isLockedShell = computed(() => route.path === '/start')

useHead({
  bodyAttrs: {
    class: computed(() => [
      isDarkShell.value ? 'rb-body-dark' : 'rb-body-light',
      isLockedShell.value ? 'rb-body-locked' : ''
    ].filter(Boolean).join(' '))
  }
})

function isActive(item: typeof navItems[number]) {
  return item.activePaths.some((path) => {
    if (path === '/') return route.path === '/'
    return route.path === path || route.path.startsWith(`${path}/`)
  })
}
</script>

<template>
  <div
    class="app-shell min-h-dvh"
    :class="[
      isDarkShell ? 'app-shell--dark' : 'app-shell--light',
      isLockedShell ? 'app-shell--locked' : ''
    ]"
  >
    <main
      class="app-frame mx-auto min-h-dvh w-full max-w-md"
      :class="showBottomNav ? 'app-frame--with-nav' : ''"
    >
      <slot />
    </main>

    <nav
      v-show="showBottomNav"
      class="bottom-nav"
      aria-label="Основная навигация"
    >
      <div class="bottom-nav__row">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="bottom-nav__item"
          :class="[
            item.primary ? 'bottom-nav__item--primary' : '',
            isActive(item) ? 'bottom-nav__item--active' : ''
          ]"
          :aria-label="item.label"
        >
          <component :is="item.icon" class="bottom-nav__icon" :class="item.primary ? 'bottom-nav__icon--primary' : ''" />
          <span class="bottom-nav__label">{{ item.label }}</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.app-shell {
  position: relative;
}

.app-shell--locked {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100dvh;
  min-height: 0;
  overflow: hidden;
}

.app-shell--light {
  background: #f7f7f5;
}

.app-shell--dark {
  background: #0b0b0c;
}

.app-frame {
  box-sizing: border-box;
  background: inherit;
  padding-top: calc(env(safe-area-inset-top, 0px) + 20px);
  padding-left: max(env(safe-area-inset-left, 0px), 0px);
  padding-right: max(env(safe-area-inset-right, 0px), 0px);
}

.app-shell--locked .app-frame {
  height: 100dvh;
  min-height: 0;
  overflow: hidden;
}

.app-frame--with-nav {
  padding-bottom: calc(5.15rem + env(safe-area-inset-bottom, 0px));
}

.bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9990;
  border-top: 1px solid #deded9;
  background: #ffffff;
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.06);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.bottom-nav__row {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 2px;
  max-width: 430px;
  margin: 0 auto;
  padding: 8px 8px 10px;
}

.bottom-nav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 52px;
  border-radius: 14px;
  color: #767676;
  font-size: 10px;
  font-weight: 500;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
}

.bottom-nav__item--active {
  color: #111111;
  background: #f0f0ed;
}

.bottom-nav__item--primary {
  color: #ffffff;
  background: #111111;
  min-height: 56px;
  margin-top: -10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
}

.bottom-nav__item--primary.bottom-nav__item--active {
  background: #111111;
  color: #ffffff;
}

.bottom-nav__icon {
  width: 20px;
  height: 20px;
}

.bottom-nav__icon--primary {
  width: 22px;
  height: 22px;
}

.bottom-nav__label {
  line-height: 1.1;
}
</style>
