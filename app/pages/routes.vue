<script setup lang="ts">
import { CirclePlus, Flame, Map, Sparkles, Trash2 } from '@lucide/vue'
import { getRouteTypeLabel } from '~/services/routes'
import type { RouteType } from '~/types/route'

const store = useRunBalanceStore()

const routeTypes: { value: RouteType, label: string }[] = [
  { value: 'loop', label: 'Петля' },
  { value: 'out_and_back', label: 'Туда-обратно' },
  { value: 'free', label: 'Свободный' }
]

const form = reactive({
  name: '',
  distanceKm: '5',
  type: 'loop' as RouteType,
  surface: 'асфальт',
  elevationHint: 'минимум подъёмов',
  notes: ''
})

const suggested = computed(() => store.suggestedRoute)
const activeRouteId = computed(() => store.activeRoute?.id ?? null)

function saveRoute() {
  const distanceKm = Number(form.distanceKm)
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) return

  store.createSavedRoute({
    name: form.name,
    distanceKm,
    type: form.type,
    surface: form.surface,
    elevationHint: form.elevationHint,
    notes: form.notes
  })

  form.name = ''
  form.notes = ''
}
</script>

<template>
  <div class="theme-light min-h-dvh space-y-4 p-4">
    <ScreenHeader
      eyebrow="Маршруты"
      title="Свои петли и маршруты"
      description="Сохрани петли и быстро привязывай их к тренировкам."
    />

    <Card v-if="suggested" class="overflow-hidden p-0">
      <RouteMap :route="suggested" class="h-44 w-full" />
      <div class="flex items-start gap-3 p-4">
        <Sparkles class="mt-0.5 h-5 w-5 text-[#111111]" />
        <div class="flex-1">
          <p class="text-xs text-[#767676]">Подсказка под тренировку дня</p>
          <h2 class="mt-1 font-medium">{{ suggested.name }}</h2>
          <p class="mt-1 text-sm text-[#767676]">
            {{ suggested.distanceKm }} км · {{ getRouteTypeLabel(suggested.type) }} · {{ suggested.surface }}
          </p>
        </div>
        <Button variant="outline" size="sm" @click="store.selectRouteForToday(suggested.id)">
          <Flame class="h-4 w-4" />
          На сегодня
        </Button>
      </div>
    </Card>

    <Card class="p-4">
      <div class="mb-4 flex items-center gap-3">
        <CirclePlus class="h-5 w-5 text-[#111111]" />
        <div>
          <h2 class="font-medium">Новый маршрут</h2>
          <p class="text-sm text-[#767676]">Имя и километраж достаточно для старта.</p>
        </div>
      </div>

      <div class="grid gap-3">
        <label class="grid gap-1.5">
          <span class="text-sm font-medium">Название</span>
          <input v-model="form.name" class="h-12 rounded-2xl border border-[#deded9] bg-white px-4 text-[16px] outline-none" placeholder="Например, парковая восьмёрка" />
        </label>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label class="grid gap-1.5">
            <span class="text-sm font-medium">Дистанция, км</span>
            <input v-model="form.distanceKm" inputmode="decimal" class="h-12 rounded-2xl border border-[#deded9] bg-white px-4 text-[16px] outline-none" />
          </label>

          <label class="grid gap-1.5">
            <span class="text-sm font-medium">Тип</span>
            <select v-model="form.type" class="h-12 rounded-2xl border border-[#deded9] bg-white px-4 text-[16px] outline-none">
              <option v-for="type in routeTypes" :key="type.value" :value="type.value">{{ type.label }}</option>
            </select>
          </label>
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label class="grid gap-1.5">
            <span class="text-sm font-medium">Покрытие</span>
            <input v-model="form.surface" class="h-12 rounded-2xl border border-[#deded9] bg-white px-4 text-[16px] outline-none" />
          </label>
          <label class="grid gap-1.5">
            <span class="text-sm font-medium">Профиль</span>
            <input v-model="form.elevationHint" class="h-12 rounded-2xl border border-[#deded9] bg-white px-4 text-[16px] outline-none" />
          </label>
        </div>

        <label class="grid gap-1.5">
          <span class="text-sm font-medium">Заметка</span>
          <input v-model="form.notes" class="h-12 rounded-2xl border border-[#deded9] bg-white px-4 text-[16px] outline-none" placeholder="Что важно помнить про этот маршрут" />
        </label>

        <Button class="mt-2 w-full" size="lg" @click="saveRoute">
          <CirclePlus class="h-5 w-5" />
          Сохранить маршрут
        </Button>
      </div>
    </Card>

    <Card class="p-4">
      <div class="mb-4 flex items-center gap-3">
        <Map class="h-5 w-5 text-[#111111]" />
        <div>
          <h2 class="font-medium">Сохранённые маршруты</h2>
          <p class="text-sm text-[#767676]">Выбранный маршрут подставляется на «Сегодня» и на старт.</p>
        </div>
      </div>

      <div v-if="store.routes.length" class="space-y-3">
        <div
          v-for="savedRoute in store.routes"
          :key="savedRoute.id"
          class="rounded-3xl border border-[#deded9] bg-[#fbfbf9] p-4"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <h3 class="truncate font-medium">{{ savedRoute.name }}</h3>
                <Badge v-if="activeRouteId === savedRoute.id" variant="secondary">Сегодня</Badge>
              </div>
              <p class="mt-1 text-sm text-[#767676]">
                {{ savedRoute.distanceKm }} км · {{ getRouteTypeLabel(savedRoute.type) }} · {{ savedRoute.surface }}
              </p>
              <p v-if="savedRoute.notes" class="mt-2 text-sm text-[#62625e]">{{ savedRoute.notes }}</p>
            </div>
            <Badge variant="secondary">{{ getRouteTypeLabel(savedRoute.type) }}</Badge>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-3">
            <Button class="w-full" :variant="activeRouteId === savedRoute.id ? 'default' : 'outline'" @click="store.selectRouteForToday(savedRoute.id)">
              <Flame class="h-4 w-4" />
              На сегодня
            </Button>
            <Button class="w-full" variant="outline" @click="store.deleteSavedRoute(savedRoute.id)">
              <Trash2 class="h-4 w-4" />
              Удалить
            </Button>
          </div>
        </div>
      </div>

      <div v-else class="rounded-3xl border border-dashed border-[#deded9] bg-white p-4 text-sm text-[#767676]">
        Маршрутов пока нет. Сохрани первый — он появится в плане и на стартовом экране.
      </div>
    </Card>
  </div>
</template>
