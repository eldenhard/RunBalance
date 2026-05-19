<script setup lang="ts">
import AppShell from '~/components/layout/AppShell.vue'
import { getAppThemeCssVars } from '~/services/themePalettes'

const store = useRunBalanceStore()
const appReady = ref(false)
const themeCssVars = computed(() => getAppThemeCssVars(store.appThemePalette))

useHead({
  bodyAttrs: {
    style: computed(() => themeCssVars.value)
  }
})

onMounted(async () => {
  store.restoreLocalState()
  store.restorePersistedActiveSession()
  await nextTick()
  window.requestAnimationFrame(() => {
    appReady.value = true
    window.dispatchEvent(new Event('runbalance:ready'))
  })
})
</script>

<template>
  <Transition name="rb-vue-splash">
    <div v-if="!appReady" id="rb-vue-splash" aria-hidden="true">
      <div class="rb-vue-splash__mark" />
      <p class="rb-vue-splash__title">RunBalance</p>
      <p class="rb-vue-splash__subtitle">собираем твой день...</p>
    </div>
  </Transition>
  <AppShell>
    <NuxtPage />
  </AppShell>
</template>

<style scoped>
#rb-vue-splash {
  position: fixed;
  inset: 0;
  z-index: 99998;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background:
    radial-gradient(circle at 34% 34%, rgba(185, 255, 56, 0.18), transparent 0 190px),
    radial-gradient(circle at 64% 62%, rgba(100, 199, 255, 0.16), transparent 0 180px),
    #0b0b0c;
  color: #ffffff;
  font-family: "Helvetica Neue", Arial, sans-serif;
}

.rb-vue-splash__mark {
  position: relative;
  width: 84px;
  height: 84px;
}

.rb-vue-splash__mark::before,
.rb-vue-splash__mark::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 999px;
}

.rb-vue-splash__mark::before {
  border: 2px solid rgba(255, 255, 255, 0.16);
  border-top-color: #b9ff38;
  border-right-color: #64c7ff;
  animation: rb-spin 0.9s linear infinite;
}

.rb-vue-splash__mark::after {
  inset: 22px;
  background: #ffffff;
  box-shadow: 0 0 0 10px rgba(185, 255, 56, 0.12);
}

.rb-vue-splash__title {
  margin: 8px 0 0;
  font-size: 17px;
  font-weight: 500;
  letter-spacing: 0;
}

.rb-vue-splash__subtitle {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.rb-vue-splash-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.rb-vue-splash-leave-to {
  opacity: 0;
  transform: scale(1.02);
}

@keyframes rb-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
