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
  <div class="theme-light space-y-4 p-4">
    <ScreenHeader eyebrow="Кроссовки" title="Ресурс обуви" description="Следи за пробегом пары и вовремя выводи её из активных." />

    <Card v-for="shoe in store.shoes" :key="shoe.id" class="p-4">
      <div class="flex items-start gap-3">
        <div class="rounded-2xl bg-[#f0f0ed] p-2">
          <Footprints class="h-5 w-5 text-[#62625e]" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h2 class="truncate font-medium text-[#111111]">{{ shoe.name }}</h2>
              <p class="text-sm text-[#767676]">{{ shoe.brand }} {{ shoe.model }}</p>
            </div>
            <Badge :variant="statusVariant(shoe.status)">{{ statusLabel(shoe.status) }}</Badge>
          </div>
          <div class="mt-4 flex justify-between text-sm">
            <span>{{ shoe.mileageKm }} км</span>
            <span>{{ shoe.resourceKm }} км</span>
          </div>
          <Progress class="mt-2" :value="getShoeWearPercent(shoe)" />
          <p class="mt-2 text-sm text-[#767676]">Износ {{ getShoeWearPercent(shoe) }}%</p>
        </div>
      </div>
    </Card>
  </div>
</template>
