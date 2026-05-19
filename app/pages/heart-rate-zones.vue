<script setup lang="ts">
import { Save } from '@lucide/vue'
import { getHeartRateZoneAppearance } from '~/services/heartRateZones'

const store = useRunBalanceStore()
const drafts = ref<Record<string, { name: string, minBpm: number, maxBpm: number }>>({})
const maxHeartRateDraft = ref('')

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

watch(() => store.profile.maxHeartRate, (maxHeartRate) => {
  maxHeartRateDraft.value = maxHeartRate ? String(maxHeartRate) : ''
}, { immediate: true })

function saveMaxHeartRate() {
  const nextMaxHeartRate = Number(maxHeartRateDraft.value)
  if (!Number.isFinite(nextMaxHeartRate) || nextMaxHeartRate <= 0) return

  store.updateProfile({ maxHeartRate: nextMaxHeartRate })
}

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
    />

    <Card class="p-4">
      <div class="flex items-end justify-between gap-4">
        <div class="min-w-0">
          <p class="text-xs text-[#767676]">Максимальный пульс</p>
          <p class="mt-1 text-[34px] font-medium leading-none">{{ store.profile.maxHeartRate || '—' }}</p>
        </div>
        <span class="text-sm text-[#767676]">уд/мин</span>
      </div>
      <div class="mt-4 flex items-end gap-3">
        <label class="min-w-0 flex-1">
          <span class="text-xs text-[#767676]">Изменить максимум</span>
          <input
            v-model="maxHeartRateDraft"
            inputmode="numeric"
            class="mt-1.5 h-11 w-full rounded-2xl border border-[#deded9] bg-white px-3 text-[16px] outline-none"
            placeholder="например, 190"
          >
        </label>
        <Button class="h-11 shrink-0 px-4" variant="outline" @click="saveMaxHeartRate">
          <Save class="h-4 w-4" />
          <span class="hidden min-[380px]:inline">Сохранить</span>
        </Button>
      </div>
    </Card>

    <NuxtLink v-if="!store.profile.zones.length" to="/profile" class="block">
      <Card class="p-4 text-sm text-[#767676]">
        Сначала укажи максимальный пульс в Профиле — после этого зоны рассчитаются автоматически.
      </Card>
    </NuxtLink>

    <div class="space-y-3">
      <Card v-for="zone in store.profile.zones" :key="zone.id" class="p-4">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <span
                class="inline-flex shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium"
                :class="getHeartRateZoneAppearance(zone.id).badgeClass"
              >
                {{ zone.id.toUpperCase() }} {{ zone.minBpm }}-{{ zone.maxBpm }}
              </span>
              <p class="min-w-0 truncate font-medium">{{ zone.name }}</p>
            </div>
          </div>
        </div>

        <div v-if="drafts[zone.id]" class="mt-4 grid grid-cols-1 gap-3">
          <label class="grid gap-1.5">
            <span class="text-xs text-[#767676]">Название</span>
            <input :value="drafts[zone.id]?.name ?? zone.name" class="h-11 rounded-2xl border border-[#deded9] bg-white px-3 text-[16px] outline-none" @input="updateDraft(zone.id, 'name', ($event.target as HTMLInputElement).value)" />
          </label>
          <div class="space-y-1.5">
            <div class="flex items-center justify-between px-1 text-xs text-[#767676]">
              <span>Мин</span>
              <span>Макс</span>
            </div>
            <div class="flex items-start justify-between gap-3">
              <input :value="drafts[zone.id]?.minBpm ?? zone.minBpm" inputmode="numeric" class="h-11 min-w-0 flex-1 rounded-2xl border border-[#deded9] bg-white px-3 text-[16px] outline-none" @input="updateDraft(zone.id, 'minBpm', ($event.target as HTMLInputElement).value)" />
              <input :value="drafts[zone.id]?.maxBpm ?? zone.maxBpm" inputmode="numeric" class="h-11 min-w-0 flex-1 rounded-2xl border border-[#deded9] bg-white px-3 text-[16px] outline-none" @input="updateDraft(zone.id, 'maxBpm', ($event.target as HTMLInputElement).value)" />
            </div>
          </div>
        </div>

        <Button class="mt-4 w-full" variant="outline" @click="saveZone(zone.id)">
          <Save class="h-4 w-4" />
          Сохранить зону
        </Button>
      </Card>
    </div>
  </div>
</template>
