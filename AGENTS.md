# AGENTS.md

## Назначение файла

Этот файл описывает правила работы AI-агентов и разработчиков в репозитории PWA-приложения для бега.

Проект — mobile-first PWA-приложение для бега, которое помогает пользователю планировать тренировки, контролировать пульсовые зоны, выбирать маршруты, отслеживать восстановление и учитывать ресурс кроссовок.

**Актуальная реализация:** см. [docs/product/implementation-status.md](docs/product/implementation-status.md) — единый источник правды по коду, store, страницам и ограничениям.

## Роль агента

Ты работаешь как senior frontend/fullstack engineer.

Твоя задача:

- сохранять продуктовый фокус;
- не раздувать MVP;
- писать поддерживаемый TypeScript-код;
- проектировать компоненты в стиле shadcn;
- отделять бизнес-логику от UI;
- учитывать ограничения PWA, GPS и работы в офлайне.

## Product Goal

Приложение должно помогать пользователю:

- понять, что бежать сегодня;
- определить целевую пульсовую зону;
- выбрать или построить маршрут;
- получить предупреждение при превышении пульса или темпа;
- сохранить тренировку;
- увидеть прогресс;
- отслеживать ресурс кроссовок;
- не перегружаться.

## MVP Scope

В MVP входят:

- онбординг;
- профиль бегуна;
- цель пользователя;
- максимальный пульс;
- расчёт и ручная настройка пульсовых зон;
- тренировочный план;
- главный экран «Сегодня»;
- recovery check-in;
- индекс готовности;
- адаптация тренировки по самочувствию;
- свободный бег;
- выбор маршрута перед тренировкой;
- предложенный маршрут по дистанции;
- GPS-запись пробежки;
- экран активной тренировки;
- голосовые уведомления по пульсу;
- голосовые уведомления по темпу;
- голосовые уведомления по этапам тренировки;
- завершение тренировки;
- экран результата;
- история тренировок;
- список кроссовок;
- привязка кроссовок к тренировке;
- автоматический пробег кроссовок;
- уведомление о ресурсе кроссовок;
- базовая аналитика прогресса;
- PWA-установка;
- локальное сохранение данных;
- синхронизация после восстановления сети.

## Out of Scope for MVP

Не добавлять в MVP без отдельного решения:

- глобальную социальную сеть;
- публичные сегменты;
- глобальные рейтинги;
- heatmaps;
- интеграции со всеми часами;
- полноценные аудио-тренировки;
- сложные клубы;
- глобальные челленджи;
- импорт FIT;
- админку модерации.

## Technology Stack

### Frontend

- Nuxt 4
- Vue 3
- TypeScript
- Pinia
- Tailwind CSS
- shadcn-vue или Reka UI + собственная shadcn-style обвязка
- VueUse
- VeeValidate или Valibot/Zod для форм и валидации

### PWA

- @vite-pwa/nuxt
- Service Worker
- Web App Manifest
- IndexedDB
- Background sync / offline queue where supported

### Maps and GPS

- MapLibre GL JS
- GeoJSON
- Browser Geolocation API
- Optional routing backend later: OSRM, GraphHopper, Valhalla, Geoapify

### Voice Alerts

- Web Speech API SpeechSynthesis
- Visual alert fallback
- Vibration API as optional fallback where supported

### Backend

Primary recommendation:

- Node.js + NestJS, если нужен единый TypeScript-стек.

Alternative:

- Go, если нужен лёгкий backend и простая поставка бинарника.

### Database

- PostgreSQL
- PostGIS
- Redis optional

### Storage

- S3-compatible storage for avatars, route previews and future media.

### Observability

- Sentry
- OpenTelemetry
- structured logs

## UI Rules

Использовать shadcn-style подход:

- mobile-first;
- карточки;
- аккуратные бейджи;
- нейтральный фон;
- чёткая типографика;
- крупные числа на экране тренировки;
- тёмный режим на активной тренировке;
- нижняя навигация;
- минимум визуального шума;
- все важные статусы должны быть видны без чтения длинного текста.

## Approved Visual Direction

RunBalance должен выглядеть как строгий mobile-first running assistant, объединяющий:

- Nike Run Club: спортивная уверенность, крупные метрики на экране бега, быстрый старт;
- Strava: понятная спортивная навигация, история, прогресс и маршрутный контекст без социальной сети в MVP;
- Simpla: персональный беговой продукт для русскоязычного пользователя, акцент на тренировках и сообществе вокруг бега без лишнего шума;
- Apple: сдержанная премиальность, точная типографика, чистая сетка, спокойные поверхности и аккуратные состояния.

Утверждённая композиция: объединить направления `Strict Sport` и `Apple Coach`.

### Theme Rules

- Светлая тема используется для планирования, recovery, профиля, истории, кроссовок, пульсовых зон, аналитики и объяснений.
- Тёмная тема используется для старта тренировки и активной тренировки.
- Тёмная тема не должна быть декоративной. Она нужна для контраста, читаемости на бегу и снижения отвлечения.
- Светлая тема должна быть строгой: тёплый off-white фон, белые поверхности, тонкие границы, минимум теней.
- В интерфейсе сразу предусматривать light/dark tokens, даже если часть экранов принудительно использует конкретную тему по контексту.
- Цветовая палитра приложения хранится в `profile.colorThemeId`.
- Цветовая палитра выбирается на `/settings`; Профиль только ведёт в этот раздел.
- Палитра меняет только accent/hero/map-marker tokens; нейтральные поверхности, контраст, типографика и semantic colors пульсовых зон не должны ломаться.
- Кнопки с `--theme-primary` всегда используют `--theme-on-primary` для текста.
- Доступные палитры: `runbalance`, `velocity`, `aero`, `ember`, `volt`, `graphite`.

### Typography Rules

- Предпочтительный шрифт: `Helvetica Now Display Medium` вес 500.
- Не встраивать Helvetica Now Display без лицензионного файла.
- CSS font stack: `"Helvetica Now Display", "Helvetica Neue", Arial, sans-serif`.
- Основной вес для заголовков и крупных метрик: 500.
- Не использовать чрезмерно жирную спортивную типографику за пределами активной тренировки.
- Размеры должны быть сдержанными: крупные цифры только для ключевых беговых метрик.

### Visual System Rules

- Радиусы: 12-18px для обычных поверхностей, 24-28px только для крупных экранных контейнеров.
- Карточки не вкладывать в карточки.
- Action color использовать дозировано. Основной строгий action — чёрный/белый контраст. Оранжевый допускается только как спортивный акцент, не как доминирующая тема.
- Для планирования использовать плотные информационные блоки, тонкие divider lines и компактные статусы.
- Для активной тренировки использовать тёмный фон, крупные значения дистанции/времени/темпа, минимум текста и крупные безопасные touch targets.
- Map-first подход разрешён для `/start`, потому что это трекер перед запуском тренировки. Для планирования, истории, профиля и аналитики карта остаётся функциональным блоком, а не главным стилем приложения.
- `/start` должен быть locked viewport: без вертикального overscroll, без белых зон сверху/снизу, с картой-подложкой, одной кнопкой «План» и центральным play.
- Результат тренировки должен показывать GPS-трек. Если записана только стартовая точка, карта показывает эту точку, а не пустую поверхность.

### Product Tone

- Приложение звучит как спокойный тренер, а не как медицинский сервис.
- Тексты короткие, уверенные, без драматизации и без диагнозов.
- Объяснения нагрузки должны быть видимыми, но не длинными.

## Main Navigation

Реализовано в `app/components/layout/AppShell.vue`.

### Bottom navigation (всегда видна, кроме `/workout/active` и `/welcome`)

Основной ряд (5 пунктов):

- **Сегодня** → `/`
- **План** → `/plan`
- **Трекер** → `/start` (центральная кнопка, выделена)
- **История** → `/history`
- **Профиль** → `/profile`

Дополнительный ряд под основным:

- **Маршруты** → `/routes`
- **Кроссовки** → `/shoes`

### Secondary sections (из Профиля и карточек на «Сегодня»)

- Восстановление → `/recovery`
- Пульсовые зоны → `/heart-rate-zones`
- Аналитика → `/analytics`
- Настройки → `/settings`
- Онбординг → `/welcome` (баннер, если `profile.onboarded === false`)

### Не в bottom nav

- Голосовые подсказки — настройка на экране активной тренировки.
- Настройки — `/settings`, вход из Профиля.

## Architecture Rules

1. Не смешивать бизнес-логику с Vue-компонентами.
2. Компоненты должны быть преимущественно презентационными.
3. Расчёты выносить в composables/services.
4. Состояние доменов хранить в Pinia stores.
5. Валидацию форм делать через единый подход.
6. Активная тренировка должна сохраняться локально.
7. Потеря сети не должна приводить к потере тренировки.
8. GPS-точки хранить как отдельные track points.
9. Маршруты и треки представлять через GeoJSON.
10. Health/recovery-тексты не должны звучать как медицинский диагноз.
11. Голосовые уведомления всегда должны иметь визуальный дубль.
12. Не добавлять тяжёлые социальные функции до завершения MVP.
13. Live-метрики тренировки должны считаться от фактической сессии, а не подставляться из демонстрационных моков.
14. Если GPS, пульс или темп ещё недоступны, интерфейс должен показывать честное текущее состояние, а не сгенерированные значения.
15. **Не добавлять демо-моки в seed.** Пустое приложение — нормальное начальное состояние; данные только от пользователя и завершённых тренировок.
16. Не ломать bottom navigation и safe-area на iOS PWA без явной задачи.

## Data And Persistence

- Store: **один** Pinia-store `app/stores/runBalance.store.ts`.
- Seed: `app/data/seedRunBalance.ts` — только пустые массивы и пустой профиль (`onboarded: false`).
- Цветовая палитра профиля хранится в `profile.colorThemeId`; старые localStorage snapshots получают default через merge с `emptyProfile`.
- `localStorage`:
  - `runbalance.appState` — snapshot профиля, recovery, routes, shoes, plan, history, selections.
  - `runbalance.activeWorkoutSession` — JSON активной сессии (восстанавливается при перезагрузке).
- Hydrate: `restoreLocalState()` и `restorePersistedActiveSession()` в `app.vue` → `onMounted`.
- После завершения тренировки: запись в `history`, пробег кроссовок, удаление из `plannedWorkouts` если это была плановая.

## App Shell, Splash, Safe Area

- `app.vue` — SSR-visible splash (`#rb-vue-splash`) до гидратации и применения store.
- `app.vue` — hydrate store, восстановление активной сессии, применение CSS-переменных выбранной палитры на `body`.
- `app/plugins/splash.client.ts` — legacy fallback для `#rb-splash`, если статический splash присутствует.
- Safe-area: `calc(env(safe-area-inset-top) + 12px)` на контенте; bottom nav учитывает `env(safe-area-inset-bottom)`.
- PWA: `public/icons/`, manifest `standalone`, `viewport-fit=cover` в `nuxt.config.ts`.

## Actual Frontend Structure

```text
app/
  components/
    ui/           # Button, Card, Badge, Progress, RouteMap
    layout/       # AppShell, ScreenHeader, MetricTile

  composables/
    useGeolocationTracking.ts
    useVoiceAlerts.ts

  data/
    seedRunBalance.ts    # только empty* — без моков

  services/
    analytics.ts
    geolocation.ts
    heartRateZones.ts
    recovery.ts
    routes.ts
    shoes.ts
    trainingPlan.ts
    themePalettes.ts
    voiceAlerts.ts
    workoutSession.ts
    heart-rate/heartRateSource.ts

  stores/
    runBalance.store.ts  # единый store

  types/
    profile.ts, workout.ts, route.ts, shoe.ts,
    recovery.ts, heart-rate.ts, workout-session.ts

  pages/
    index.vue, plan.vue, start.vue, welcome.vue
    history.vue, analytics.vue, profile.vue
    recovery.vue, heart-rate-zones.vue, settings.vue, shoes.vue, routes.vue
    workout/active.vue, workout/result.vue

  plugins/
    splash.client.ts

public/
  icons/                 # PWA / apple-touch-icon
```

Папки `features/` и раздельные `*.store.ts` из ранних планов **не используются** — логика в `services/` + `runBalance.store.ts`.

## Domain Models

### UserProfile

```ts
export type UserGoal =
  | '5k'
  | '10k'
  | 'half_marathon'
  | 'base'
  | 'return_to_running'

export type AppColorThemeId =
  | 'runbalance'
  | 'velocity'
  | 'aero'
  | 'ember'
  | 'volt'
  | 'graphite'

export type UserProfile = {
  id: string
  displayName: string
  goal: UserGoal
  colorThemeId: AppColorThemeId
  maxHeartRate: number
  trainingDays: number[]
  zones: HeartRateZone[]
  onboarded: boolean
}
```

### HeartRateZone

```ts
export type HeartRateZone = {
  id: string
  name: string
  minBpm: number
  maxBpm: number
  color?: string
}
```

### Workout

```ts
export type WorkoutType =
  | 'easy'
  | 'recovery'
  | 'long'
  | 'tempo'
  | 'intervals'
  | 'fartlek'
  | 'free'

export type Workout = {
  id: string
  type: WorkoutType
  title: string
  scheduledDate?: string
  plannedDurationMin?: number
  plannedDistanceKm?: number
  targetZoneId?: string
  routeId?: string
  shoeId?: string
  startedAt?: string
  finishedAt?: string
  distanceKm?: number
  durationSec?: number
  avgPaceSecPerKm?: number
  avgHeartRate?: number
  maxHeartRate?: number
  heartRateSource?: 'unavailable' | ...
}
```

### Shoe

```ts
export type ShoeStatus = 'active' | 'replace_soon' | 'retired'

export type Shoe = {
  id: string
  name: string
  brand?: string
  model?: string
  startedAt?: string
  mileageKm: number
  resourceKm: number
  status: ShoeStatus
}
```

### Route

```ts
export type RouteType = 'loop' | 'out_and_back' | 'free'

export type Route = {
  id: string
  name: string
  distanceKm: number
  type: RouteType
  geojson: GeoJSON.FeatureCollection
  isPrivate: boolean
  surface: string
  elevationHint: string
  notes?: string
}
```

### RecoveryCheckIn

```ts
export type RecoveryCheckIn = {
  id: string
  date: string
  sleepQuality: 1 | 2 | 3 | 4 | 5
  fatigue: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  soreness: 'none' | 'light' | 'strong'
  stress: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  restingHeartRate?: number
  hrvMs?: number
  readinessScore: number
}
```

## Voice Alert Rules

- Не повторять одно и то же уведомление чаще одного раза в 60 секунд.
- Если пульс выше целевой зоны дольше 20 секунд, сказать: «Пульс выше целевой зоны. Сбавь темп.»
- Если пульс ниже целевой зоны дольше 45 секунд на темповом/интервальном блоке, сказать: «Пульс ниже целевой зоны. Можно добавить темп.»
- Если темп быстрее плана сильнее заданного порога, сказать: «Темп быстрее плана. Беги спокойнее.»
- Если начался новый этап тренировки, сказать название этапа.
- Все голосовые уведомления должны дублироваться визуальным баннером.

## Testing Requirements

Добавлять тесты для:

- расчёта пульсовых зон;
- расчёта readiness score;
- расчёта пробега кроссовок;
- определения статуса кроссовок;
- итоговой статистики тренировки (дистанция, pace, GPS-фильтр);
- правил голосовых уведомлений;
- восстановления активной тренировки из localStorage;
- подбора маршрута по дистанции (`pickSuggestedRoute`);
- аналитики по завершённым тренировкам (`buildAnalyticsReport`).

Запуск: `npm test`. Типы: `npm run typecheck`.

## Product Wording

Разрешённые формулировки:

- «рекомендация по нагрузке»;
- «ориентир по восстановлению»;
- «лучше снизить интенсивность»;
- «можно заменить тренировку на лёгкую».

Не использовать:

- «медицинский диагноз»;
- «приложение точно определило болезнь»;
- «тебе запрещено тренироваться»;
- «гарантированный результат».

## Development Priorities

### Phase 1 — done

- Nuxt 4, Tailwind, shadcn-style UI, PWA, layout, основные страницы.
- ~~Mock data~~ → **удалены**, только empty seed.

### Phase 2 — done

- Профиль, зоны (ручная правка), план (create/delete/select), recovery check-in + readiness, логика кроссовок в services.

### Phase 3 — done

- Workout session, GPS, localStorage сессии, active/result, voice + visual alerts.
- Live-метрики без подстановки; пульс в iOS PWA помечен unavailable.

### Phase 4 — done (MVP)

- CRUD плана с датой, зоной, маршрутом, кроссовками.
- Маршруты: сохранение, подсказка по дистанции, MapLibre превью.
- История и `/analytics` по реальным `finishedAt`.
- Онбординг `/welcome` (пропускаемый).
- Кроссовки: полный CRUD, ручной пробег, активная пара по умолчанию.

### Следующие приоритеты (future scope)

- Backend + sync queue.
- Capacitor BLE (Polar H10).
- Рисование/редактирование маршрута на карте.
- Редактирование запланированной тренировки (update).
- Аналитика по зонам пульса при появлении HR.
- IndexedDB вместо/вместе с localStorage.

## Final Rule

Если новая задача не относится к MVP, сначала пометь её как `future scope`, а не добавляй в реализацию автоматически.
