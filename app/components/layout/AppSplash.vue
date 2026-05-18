<script setup lang="ts">
defineProps<{ show: boolean }>()
</script>

<template>
  <Transition name="splash">
    <div v-if="show" class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0b0b0c] text-white">
      <div class="flex flex-col items-center gap-4">
        <div class="relative h-20 w-20">
          <div class="absolute inset-0 rounded-full border border-white/20" />
          <div class="absolute inset-1 animate-spin-slow rounded-full border-t-2 border-white/80" />
          <div class="absolute inset-0 flex items-center justify-center text-[24px] font-semibold tracking-tight">RB</div>
        </div>
        <div class="text-center">
          <p class="text-base font-medium tracking-tight">RunBalance</p>
          <p class="mt-1 text-xs text-white/60">собираем твой день…</p>
        </div>
      </div>

      <div class="mt-10 flex gap-1.5">
        <span class="dot dot-1" />
        <span class="dot dot-2" />
        <span class="dot dot-3" />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.splash-enter-active,
.splash-leave-active {
  transition: opacity 280ms ease;
}
.splash-enter-from,
.splash-leave-to {
  opacity: 0;
}

@keyframes splash-spin {
  to { transform: rotate(360deg); }
}
.animate-spin-slow {
  animation: splash-spin 1.6s linear infinite;
}

@keyframes splash-pulse {
  0%, 100% { opacity: 0.25; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-2px); }
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.85);
  animation: splash-pulse 1.1s ease-in-out infinite;
}
.dot-1 { animation-delay: -0.32s; }
.dot-2 { animation-delay: -0.16s; }
.dot-3 { animation-delay: 0s; }
</style>
