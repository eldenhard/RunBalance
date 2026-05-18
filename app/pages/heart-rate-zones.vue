<script setup lang="ts">
import { Save } from '@lucide/vue'
import { getHeartRateZoneAppearance } from '~/services/heartRateZones'

const store = useRunBalanceStore()
const drafts = ref<Record<string, { name: string, minBpm: number, maxBpm: number }>>({})

watch(() => store.profile.zones, (zones) => {
  drafts.value = Object.fromEntries(zones.map((zone) => [
    zone.id,
    {
      name: zone.name,
      minBpm: zone.minBpm,
      maxBpm: zone.maxBpm
    }
  ]))
}, { immediate: true, deep: true })

function saveZone(zoneId: string) {
  const draft = drafts.value[zoneId]
  if (!draft) return
  store.updateHeartRateZone(zoneId, draft)
}

function updateDraft(zoneId: string, key: 'name' | 'minBpm' | 'maxBpm', value: string) {
  const currentDraft = drafts.value[zoneId]
  if (!currentDraft) return

  drafts.value[zoneId] = {
    ...currentDraft,
    [key]: key === 'name' ? value : Number(value)
  }
}
</script>

<template>
  <div class="theme-light min-h-dvh space-y-4 p-4">
    <ScreenHeader
      eyebrow="Пульсовые зоны"
      title="Ручная настройка зон"
      description="Максимальный пульс остаётся базой, но границы можно подстроить под себя уже сейчас."
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
            <p class="font-medium">{{ zone.id.toUpperCase() }}</p>
            <p class="mt-1 text-sm text-[#767676]">Цвет зоны уже используется на экране бега.</p>
          </div>
          <span
            class="inline-flex rounded-full px-3 py-1 text-xs font-medium"
            :class="getHeartRateZoneAppearance(zone.id).badgeClass"
          >
            {{ zone.minBpm }}-{{ zone.maxBpm }}
          </span>
        </div>

        <div v-if="drafts[zone.id]" class="mt-4 grid grid-cols-3 gap-3">
          <label class="grid gap-1.5">
            <span class="text-xs text-[#767676]">Название</span>
            <input :value="drafts[zone.id]?.name ?? zone.name" class="h-11 rounded-2xl border border-[#deded9] bg-white px-3 text-[16px] outline-none" @input="updateDraft(zone.id, 'name', ($event.target as HTMLInputElement).value)" />
          </label>
          <label class="grid gap-1.5">
            <span class="text-xs text-[#767676]">Мин</span>
            <input :value="drafts[zone.id]?.minBpm ?? zone.minBpm" inputmode="numeric" class="h-11 rounded-2xl border border-[#deded9] bg-white px-3 text-[16px] outline-none" @input="updateDraft(zone.id, 'minBpm', ($event.target as HTMLInputElement).value)" />
          </label>
          <label class="grid gap-1.5">
            <span class="text-xs text-[#767676]">Макс</span>
            <input :value="drafts[zone.id]?.maxBpm ?? zone.maxBpm" inputmode="numeric" class="h-11 rounded-2xl border border-[#deded9] bg-white px-3 text-[16px] outline-none" @input="updateDraft(zone.id, 'maxBpm', ($event.target as HTMLInputElement).value)" />
          </label>
        </div>

        <Button class="mt-4 w-full" variant="outline" @click="saveZone(zone.id)">
          <Save class="h-4 w-4" />
          Сохранить зону
        </Button>
      </Card>
    </div>
  </div>
</template>
