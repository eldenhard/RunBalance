<script setup lang="ts">
const store = useRunBalanceStore()
</script>

<template>
  <div class="theme-light min-h-dvh space-y-4 p-4">
    <ScreenHeader
      eyebrow="Восстановление"
      title="Ориентир по нагрузке"
      description="Короткий check-in помогает адаптировать тренировку без медицинских выводов."
    />

    <Card class="p-4">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-xs text-[#767676]">Readiness</p>
          <p class="mt-1 text-[44px] font-medium leading-none">{{ store.recovery.readinessScore }}</p>
        </div>
        <Badge variant="success">{{ store.recoveryRecommendation.title }}</Badge>
      </div>
      <Progress class="mt-4" :value="store.recovery.readinessScore" />
      <p class="mt-3 text-sm leading-5 text-[#62625e]">{{ store.recoveryRecommendation.message }}</p>
    </Card>

    <div class="grid grid-cols-2 gap-3">
      <MetricTile label="Сон" :value="`${store.recovery.sleepQuality}/5`" />
      <MetricTile label="Усталость" :value="`${store.recovery.fatigue}/10`" />
      <MetricTile label="Стресс" :value="`${store.recovery.stress}/10`" />
      <MetricTile label="Крепатура" :value="store.recovery.soreness === 'light' ? 'лёгкая' : store.recovery.soreness" />
    </div>

    <Card class="p-4">
      <h2 class="text-lg font-medium">Как адаптирован план</h2>
      <p class="mt-2 text-sm leading-5 text-[#62625e]">{{ store.adaptedWorkout.adaptationReason }}</p>
    </Card>
  </div>
</template>

