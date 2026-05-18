<script setup lang="ts">
import { Pause, Square, ZapOff } from '@lucide/vue'

const store = useRunBalanceStore()
const workout = computed(() => store.currentWorkout)
</script>

<template>
  <div class="theme-dark min-h-dvh space-y-5 p-4 text-white dark">
    <header class="pt-3">
      <p class="text-xs font-medium text-[#9b9b9b]">Активная тренировка</p>
      <h1 class="text-[26px] font-medium">{{ workout.title }}</h1>
    </header>

    <section class="grid grid-cols-2 gap-3">
      <div class="rounded-[18px] border border-[#252525] bg-[#151515] p-4">
        <p class="text-xs text-[#9b9b9b]">Дистанция</p>
        <p class="mt-2 text-[42px] font-medium leading-none">{{ formatDistance(workout.distanceKm) }}</p>
      </div>
      <div class="rounded-[18px] border border-[#252525] bg-[#151515] p-4">
        <p class="text-xs text-[#9b9b9b]">Время</p>
        <p class="mt-2 text-[42px] font-medium leading-none">{{ formatDuration(workout.durationSec) }}</p>
      </div>
      <div class="rounded-[18px] border border-[#252525] bg-[#151515] p-4">
        <p class="text-xs text-[#9b9b9b]">Темп</p>
        <p class="mt-2 text-[30px] font-medium leading-none">{{ formatPace(workout.avgPaceSecPerKm) }}</p>
      </div>
      <div class="rounded-[18px] border border-[#252525] bg-[#151515] p-4">
        <p class="text-xs text-[#9b9b9b]">Зона</p>
        <p class="mt-2 text-[30px] font-medium leading-none">{{ store.targetZone?.name }}</p>
      </div>
    </section>

    <section class="rounded-[18px] border border-[#252525] bg-[#151515] p-4">
      <div class="flex gap-3">
        <ZapOff class="mt-0.5 h-5 w-5 shrink-0 text-[#9b9b9b]" />
        <div>
          <h2 class="font-medium text-white">Пульс не подключён</h2>
          <p class="mt-1 text-sm leading-5 text-[#b8b8b8]">
            Сейчас тренировка идёт по GPS, времени и темпу. Polar H10 добавим через Capacitor BLE.
          </p>
        </div>
      </div>
    </section>

    <section>
      <div class="mb-2 flex items-center justify-between text-sm text-[#b8b8b8]">
        <span>Прогресс</span>
        <span>57%</span>
      </div>
      <div class="h-1.5 rounded-full bg-[#252525]">
        <div class="h-full w-[57%] rounded-full bg-white" />
      </div>
    </section>

    <div class="grid grid-cols-2 gap-3 pt-3">
      <Button class="bg-white text-[#0b0b0c] active:bg-[#e8e8e8]" size="lg">
        <Pause class="h-5 w-5" />
        Пауза
      </Button>
      <NuxtLink to="/workout/result">
        <Button class="w-full" variant="destructive" size="lg">
          <Square class="h-5 w-5" />
          Завершить
        </Button>
      </NuxtLink>
    </div>
  </div>
</template>
