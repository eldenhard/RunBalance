<script setup lang="ts">
const store = useRunBalanceStore()
</script>

<template>
  <div class="theme-light space-y-4 p-4">
    <ScreenHeader eyebrow="Профиль" :title="store.profile.displayName" description="Цель, зоны, восстановление и настройки локального профиля." />

    <Card class="p-4">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <p class="text-sm text-[#767676]">Цель</p>
          <p class="text-xl font-medium">10 км</p>
        </div>
        <div>
          <p class="text-sm text-[#767676]">Макс. пульс</p>
          <p class="text-xl font-medium">{{ store.profile.maxHeartRate }}</p>
        </div>
      </div>
    </Card>

    <Card class="p-4">
      <h2 class="font-medium">Разделы</h2>
      <div class="mt-3 space-y-2">
        <NuxtLink to="/recovery" class="flex justify-between rounded-2xl border border-[#deded9] bg-[#f7f7f5] p-3 text-sm">
          <span class="font-medium">Восстановление</span>
          <span class="text-[#767676]">{{ store.recovery.readinessScore }}</span>
        </NuxtLink>
        <NuxtLink to="/heart-rate-zones" class="flex justify-between rounded-2xl border border-[#deded9] bg-[#f7f7f5] p-3 text-sm">
          <span class="font-medium">Пульсовые зоны</span>
          <span class="text-[#767676]">{{ store.profile.zones.length }}</span>
        </NuxtLink>
        <NuxtLink to="/shoes" class="flex justify-between rounded-2xl border border-[#deded9] bg-[#f7f7f5] p-3 text-sm">
          <span class="font-medium">Кроссовки</span>
          <span class="text-[#767676]">{{ store.shoes.length }}</span>
        </NuxtLink>
        <NuxtLink to="/routes" class="flex justify-between rounded-2xl border border-[#deded9] bg-[#f7f7f5] p-3 text-sm">
          <span class="font-medium">Маршруты</span>
          <span class="text-[#767676]">{{ store.routes.length }}</span>
        </NuxtLink>
        <NuxtLink to="/analytics" class="flex justify-between rounded-2xl border border-[#deded9] bg-[#f7f7f5] p-3 text-sm">
          <span class="font-medium">Аналитика</span>
          <span class="text-[#767676]">{{ store.analyticsReport.summary.totalRuns }}</span>
        </NuxtLink>
      </div>
    </Card>
  </div>
</template>
