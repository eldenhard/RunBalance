<script setup lang="ts">
const store = useRunBalanceStore()
</script>

<template>
  <div class="theme-light space-y-4 p-4">
    <ScreenHeader eyebrow="План" title="Неделя под 10 км" description="План адаптируется по готовности, но остаётся простым и понятным." />

    <Card class="p-4">
      <h2 class="font-medium">Ближайшая тренировка</h2>
      <p class="mt-1 text-sm text-[#767676]">{{ store.adaptedWorkout.title }} · {{ store.adaptedWorkout.plannedDistanceKm }} км · {{ store.adaptedWorkout.targetZoneId?.toUpperCase() }}</p>
      <p class="mt-3 text-sm leading-5 text-[#62625e]">{{ store.adaptedWorkout.adaptationReason }}</p>
    </Card>

    <div class="grid gap-3">
      <Card v-for="day in ['Пн · лёгкий бег', 'Ср · темповый блок', 'Пт · восстановление']" :key="day" class="p-4">
        <p class="font-medium">{{ day }}</p>
        <p class="mt-1 text-sm text-[#767676]">Локальный план Phase 2, синхронизация позже.</p>
      </Card>
    </div>
  </div>
</template>
