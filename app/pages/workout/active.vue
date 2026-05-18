<script setup lang="ts">
import { Pause, Square, ZapOff } from '@lucide/vue'

const store = useRunBalanceStore()
const workout = computed(() => store.currentWorkout)
</script>

<template>
  <div class="min-h-dvh space-y-5 bg-slate-950 p-4 text-white">
    <header class="pt-3">
      <p class="text-sm font-medium text-slate-400">Активная тренировка</p>
      <h1 class="text-2xl font-semibold">{{ workout.title }}</h1>
    </header>

    <section class="grid grid-cols-2 gap-3">
      <div class="rounded-lg bg-white/10 p-4">
        <p class="text-sm text-slate-300">Дистанция</p>
        <p class="mt-2 text-4xl font-semibold">{{ formatDistance(workout.distanceKm) }}</p>
      </div>
      <div class="rounded-lg bg-white/10 p-4">
        <p class="text-sm text-slate-300">Время</p>
        <p class="mt-2 text-4xl font-semibold">{{ formatDuration(workout.durationSec) }}</p>
      </div>
      <div class="rounded-lg bg-white/10 p-4">
        <p class="text-sm text-slate-300">Темп</p>
        <p class="mt-2 text-3xl font-semibold">{{ formatPace(workout.avgPaceSecPerKm) }}</p>
      </div>
      <div class="rounded-lg bg-white/10 p-4">
        <p class="text-sm text-slate-300">Зона</p>
        <p class="mt-2 text-3xl font-semibold">{{ store.targetZone?.name }}</p>
      </div>
    </section>

    <section class="rounded-lg border border-amber-400/40 bg-amber-400/10 p-4">
      <div class="flex gap-3">
        <ZapOff class="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
        <div>
          <h2 class="font-semibold text-amber-100">Пульс не подключён</h2>
          <p class="mt-1 text-sm leading-5 text-amber-50/80">
            Сейчас тренировка идёт по GPS, времени и темпу. Polar H10 добавим через Capacitor BLE.
          </p>
        </div>
      </div>
    </section>

    <section>
      <div class="mb-2 flex items-center justify-between text-sm text-slate-300">
        <span>Прогресс</span>
        <span>57%</span>
      </div>
      <div class="h-2 rounded-full bg-white/10">
        <div class="h-full w-[57%] rounded-full bg-white" />
      </div>
    </section>

    <div class="grid grid-cols-2 gap-3 pt-3">
      <Button class="bg-white text-slate-950 active:bg-slate-200" size="lg">
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

