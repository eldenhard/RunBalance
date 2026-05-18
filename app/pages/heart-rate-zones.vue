<script setup lang="ts">
const store = useRunBalanceStore()
</script>

<template>
  <div class="theme-light min-h-dvh space-y-4 p-4">
    <ScreenHeader
      eyebrow="Пульсовые зоны"
      title="Зоны от максимального пульса"
      description="В Phase 2 показываем расчёт и готовим интерфейс к ручной настройке."
    />

    <Card class="p-4">
      <div class="flex items-end justify-between">
        <div>
          <p class="text-xs text-[#767676]">Максимальный пульс</p>
          <p class="mt-1 text-[34px] font-medium leading-none">{{ store.profile.maxHeartRate }}</p>
        </div>
        <span class="text-sm text-[#767676]">уд/мин</span>
      </div>
    </Card>

    <div class="space-y-3">
      <Card v-for="zone in store.profile.zones" :key="zone.id" class="p-4">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="font-medium">{{ zone.name }}</p>
            <p class="mt-1 text-sm text-[#767676]">{{ zone.minBpm }}–{{ zone.maxBpm }} уд/мин</p>
          </div>
          <Badge variant="secondary">ручная настройка позже</Badge>
        </div>
      </Card>
    </div>
  </div>
</template>
