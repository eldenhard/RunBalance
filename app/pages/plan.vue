<script setup lang="ts">
const store = useRunBalanceStore()
</script>

<template>
  <div class="space-y-4 p-4">
    <header class="space-y-1 pt-3">
      <p class="text-sm font-medium text-slate-500">План</p>
      <h1 class="text-2xl font-semibold text-slate-950">Неделя под 10 км</h1>
    </header>

    <Card class="p-4">
      <h2 class="font-semibold">Ближайшая тренировка</h2>
      <p class="mt-1 text-sm text-slate-500">{{ store.workoutOfTheDay.title }} · {{ store.workoutOfTheDay.plannedDistanceKm }} км · {{ store.targetZone?.name }}</p>
    </Card>

    <div class="grid gap-3">
      <Card v-for="day in ['Пн · лёгкий бег', 'Ср · темповый блок', 'Пт · восстановление']" :key="day" class="p-4">
        <p class="font-medium">{{ day }}</p>
        <p class="mt-1 text-sm text-slate-500">Мок-план Phase 1, адаптация по самочувствию позже.</p>
      </Card>
    </div>
  </div>
</template>

