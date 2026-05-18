<script setup lang="ts">
import { Footprints } from '@lucide/vue'
import { getShoeWearPercent } from '~/services/shoes'

const store = useRunBalanceStore()

function statusLabel(status: string) {
  return {
    active: 'активные',
    replace_soon: 'скоро замена',
    retired: 'архив'
  }[status] ?? status
}

function statusVariant(status: string) {
  if (status === 'replace_soon') return 'warning'
  if (status === 'retired') return 'danger'
  return 'success'
}
</script>

<template>
  <div class="space-y-4 p-4">
    <header class="space-y-1 pt-3">
      <p class="text-sm font-medium text-slate-500">Кроссовки</p>
      <h1 class="text-2xl font-semibold text-slate-950">Ресурс обуви</h1>
    </header>

    <Card v-for="shoe in store.shoes" :key="shoe.id" class="p-4">
      <div class="flex items-start gap-3">
        <div class="rounded-md bg-slate-100 p-2">
          <Footprints class="h-5 w-5 text-slate-600" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h2 class="truncate font-semibold text-slate-950">{{ shoe.name }}</h2>
              <p class="text-sm text-slate-500">{{ shoe.brand }} {{ shoe.model }}</p>
            </div>
            <Badge :variant="statusVariant(shoe.status)">{{ statusLabel(shoe.status) }}</Badge>
          </div>
          <div class="mt-4 flex justify-between text-sm">
            <span>{{ shoe.mileageKm }} км</span>
            <span>{{ shoe.resourceKm }} км</span>
          </div>
          <Progress class="mt-2" :value="getShoeWearPercent(shoe)" />
          <p class="mt-2 text-sm text-slate-500">Износ {{ getShoeWearPercent(shoe) }}%</p>
        </div>
      </div>
    </Card>
  </div>
</template>

