<script setup lang="ts">
import { ArchiveRestore, CirclePlus, Flame, Footprints, Save, Trash2 } from '@lucide/vue'
import { getShoeWearPercent } from '~/services/shoes'
import type { Shoe } from '~/types/shoe'

const store = useRunBalanceStore()
const isCreating = ref(store.shoes.length === 0)
const editingId = ref<string | null>(null)

type ShoeForm = {
  name: string
  brand: string
  model: string
  resourceKm: string
  mileageKm: string
  startedAt: string
}

const emptyForm = (): ShoeForm => ({
  name: '',
  brand: '',
  model: '',
  resourceKm: '700',
  mileageKm: '0',
  startedAt: new Date().toISOString().slice(0, 10)
})

const createForm = reactive(emptyForm())
const editForm = reactive(emptyForm())

function statusLabel(status: Shoe['status']) {
  return {
    active: 'активные',
    replace_soon: 'скоро замена',
    retired: 'архив'
  }[status]
}

function statusVariant(status: Shoe['status']) {
  if (status === 'replace_soon') return 'warning'
  if (status === 'retired') return 'danger'
  return 'success'
}

function startEditing(shoe: Shoe) {
  editingId.value = shoe.id
  Object.assign(editForm, {
    name: shoe.name,
    brand: shoe.brand ?? '',
    model: shoe.model ?? '',
    resourceKm: String(shoe.resourceKm),
    mileageKm: String(shoe.mileageKm),
    startedAt: shoe.startedAt ?? ''
  })
}

function cancelEditing() {
  editingId.value = null
}

function submitNewShoe() {
  store.createShoe({
    name: createForm.name,
    brand: createForm.brand,
    model: createForm.model,
    resourceKm: Number(createForm.resourceKm) || 0,
    mileageKm: Number(createForm.mileageKm) || 0,
    startedAt: createForm.startedAt
  })
  Object.assign(createForm, emptyForm())
  isCreating.value = false
}

function submitEdit(shoeId: string) {
  store.updateShoe(shoeId, {
    name: editForm.name,
    brand: editForm.brand,
    model: editForm.model,
    resourceKm: Number(editForm.resourceKm) || 0,
    mileageKm: Number(editForm.mileageKm) || 0,
    startedAt: editForm.startedAt
  })
  editingId.value = null
}

function toggleRetire(shoe: Shoe) {
  store.updateShoe(shoe.id, { status: shoe.status === 'retired' ? 'active' : 'retired' })
}
</script>

<template>
  <div class="theme-light space-y-4 p-4">
    <ScreenHeader eyebrow="Кроссовки" title="Ресурс обуви" description="Добавляй пары, обновляй ресурс и фактический пробег. Активные подставляются на старт автоматически." />

    <Card class="p-4">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h2 class="font-medium">Своя пара</h2>
          <p class="text-sm text-[#767676]">{{ isCreating ? 'Заполни, чтобы добавить новую пару.' : 'Можно завести сколько угодно пар.' }}</p>
        </div>
        <Button v-if="!isCreating" variant="outline" size="sm" @click="isCreating = true">
          <CirclePlus class="h-4 w-4" />
          Добавить
        </Button>
      </div>

      <div v-if="isCreating" class="mt-4 grid gap-3">
        <label class="grid gap-1.5">
          <span class="text-sm font-medium">Название</span>
          <input v-model="createForm.name" class="h-12 rounded-2xl border border-[#deded9] bg-white px-4 text-[16px] outline-none" placeholder="Например, Daily Trainer" />
        </label>
        <div class="grid grid-cols-2 gap-3">
          <label class="grid gap-1.5">
            <span class="text-sm font-medium">Бренд</span>
            <input v-model="createForm.brand" class="h-12 rounded-2xl border border-[#deded9] bg-white px-4 text-[16px] outline-none" />
          </label>
          <label class="grid gap-1.5">
            <span class="text-sm font-medium">Модель</span>
            <input v-model="createForm.model" class="h-12 rounded-2xl border border-[#deded9] bg-white px-4 text-[16px] outline-none" />
          </label>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <label class="grid gap-1.5">
            <span class="text-sm font-medium">Ресурс, км</span>
            <input v-model="createForm.resourceKm" inputmode="numeric" class="h-12 rounded-2xl border border-[#deded9] bg-white px-4 text-[16px] outline-none" />
          </label>
          <label class="grid gap-1.5">
            <span class="text-sm font-medium">Уже пробежал, км</span>
            <input v-model="createForm.mileageKm" inputmode="decimal" class="h-12 rounded-2xl border border-[#deded9] bg-white px-4 text-[16px] outline-none" />
          </label>
        </div>
        <label class="grid gap-1.5">
          <span class="text-sm font-medium">С даты</span>
          <input v-model="createForm.startedAt" type="date" class="h-12 rounded-2xl border border-[#deded9] bg-white px-4 text-[16px] outline-none" />
        </label>
        <div class="grid grid-cols-2 gap-3">
          <Button variant="outline" @click="isCreating = false">Отмена</Button>
          <Button @click="submitNewShoe">
            <Save class="h-4 w-4" />
            Сохранить
          </Button>
        </div>
      </div>
    </Card>

    <Card v-for="shoe in store.shoes" :key="shoe.id" class="p-4">
      <div class="flex items-start gap-3">
        <div class="rounded-2xl bg-[#f0f0ed] p-2">
          <Footprints class="h-5 w-5 text-[#62625e]" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <h2 class="truncate font-medium text-[#111111]">{{ shoe.name }}</h2>
                <Badge v-if="store.activeShoe?.id === shoe.id" variant="secondary">активная</Badge>
              </div>
              <p class="text-sm text-[#767676]">{{ [shoe.brand, shoe.model].filter(Boolean).join(' ') || '—' }}</p>
            </div>
            <Badge :variant="statusVariant(shoe.status)">{{ statusLabel(shoe.status) }}</Badge>
          </div>
          <div class="mt-4 flex justify-between text-sm">
            <span>{{ shoe.mileageKm }} км</span>
            <span>{{ shoe.resourceKm }} км</span>
          </div>
          <Progress class="mt-2" :value="getShoeWearPercent(shoe)" />
          <p class="mt-2 text-sm text-[#767676]">Износ {{ getShoeWearPercent(shoe) }}%</p>

          <div v-if="editingId !== shoe.id" class="mt-3 grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" @click="store.setActiveShoe(shoe.id)" :disabled="store.activeShoe?.id === shoe.id">
              <Flame class="h-4 w-4" />
              {{ store.activeShoe?.id === shoe.id ? 'По умолчанию' : 'Сделать основной' }}
            </Button>
            <Button variant="outline" size="sm" @click="startEditing(shoe)">Редактировать</Button>
            <Button variant="outline" size="sm" @click="toggleRetire(shoe)">
              <ArchiveRestore class="h-4 w-4" />
              {{ shoe.status === 'retired' ? 'Вернуть в строй' : 'В архив' }}
            </Button>
            <Button variant="outline" size="sm" @click="store.deleteShoe(shoe.id)">
              <Trash2 class="h-4 w-4" />
              Удалить
            </Button>
          </div>

          <div v-else class="mt-4 grid gap-3 border-t border-[#deded9] pt-4">
            <label class="grid gap-1.5">
              <span class="text-xs text-[#767676]">Название</span>
              <input v-model="editForm.name" class="h-11 rounded-2xl border border-[#deded9] bg-white px-3 text-[16px] outline-none" />
            </label>
            <div class="grid grid-cols-2 gap-3">
              <label class="grid gap-1.5">
                <span class="text-xs text-[#767676]">Бренд</span>
                <input v-model="editForm.brand" class="h-11 rounded-2xl border border-[#deded9] bg-white px-3 text-[16px] outline-none" />
              </label>
              <label class="grid gap-1.5">
                <span class="text-xs text-[#767676]">Модель</span>
                <input v-model="editForm.model" class="h-11 rounded-2xl border border-[#deded9] bg-white px-3 text-[16px] outline-none" />
              </label>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <label class="grid gap-1.5">
                <span class="text-xs text-[#767676]">Ресурс, км</span>
                <input v-model="editForm.resourceKm" inputmode="numeric" class="h-11 rounded-2xl border border-[#deded9] bg-white px-3 text-[16px] outline-none" />
              </label>
              <label class="grid gap-1.5">
                <span class="text-xs text-[#767676]">Пробег, км</span>
                <input v-model="editForm.mileageKm" inputmode="decimal" class="h-11 rounded-2xl border border-[#deded9] bg-white px-3 text-[16px] outline-none" />
              </label>
            </div>
            <label class="grid gap-1.5">
              <span class="text-xs text-[#767676]">С даты</span>
              <input v-model="editForm.startedAt" type="date" class="h-11 rounded-2xl border border-[#deded9] bg-white px-3 text-[16px] outline-none" />
            </label>
            <div class="grid grid-cols-2 gap-3">
              <Button variant="outline" size="sm" @click="cancelEditing">Отмена</Button>
              <Button size="sm" @click="submitEdit(shoe.id)">
                <Save class="h-4 w-4" />
                Сохранить
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <Card v-if="!store.shoes.length && !isCreating" class="p-4 text-sm text-[#767676]">
      Пока пусто. Добавь первую пару, чтобы считать ресурс автоматически.
    </Card>
  </div>
</template>
