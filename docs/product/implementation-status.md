# RunBalance — статус реализации (актуально на 2026-05-19)

Документ фиксирует **фактическую** логику в репозитории после Phase 1–4 и UX-доработок. Использовать вместе с `AGENTS.md` при любых новых задачах.

## Принципы данных

- **Моков нет.** `app/data/seedRunBalance.ts` экспортирует только пустые сущности (`emptyProfile`, `emptyRoutes`, …).
- Все пользовательские данные появляются из: онбординга, форм на экранах, завершённых тренировок.
- Персистенция: `localStorage` (не IndexedDB на текущем этапе).
- Ключи:
  - `runbalance.appState` — профиль, recovery, маршруты, кроссовки, план, история, выбранные id.
  - `runbalance.activeWorkoutSession` — активная сессия (GPS-трек, метрики, алерты).

## Состояние (Pinia)

Единый store: `app/stores/runBalance.store.ts` (`useRunBalanceStore`).

| Домен | Состояние | Действия |
|-------|-----------|----------|
| Профиль | `profile`, флаг `onboarded`, `colorThemeId` | `completeOnboarding`, `skipOnboarding`, `updateProfile` |
| Recovery | `recovery \| null` | `saveRecoveryCheckIn`; без check-in readiness = 100 |
| План | `plannedWorkouts`, `selectedWorkoutId` | `createPlannedWorkout`, `selectPlannedWorkout`, `deletePlannedWorkout` |
| Маршруты | `routes`, `selectedRouteId` | `createSavedRoute`, `deleteSavedRoute`, `selectRouteForToday`, `assignRouteToPlannedWorkout` |
| Кроссовки | `shoes`, `activeShoeId` | `createShoe`, `updateShoe`, `deleteShoe`, `setActiveShoe` |
| Тренировка | `activeSession`, `currentWorkout` | `startWorkoutSession`, `startFreeWorkoutSession`, pause/resume, `appendTrackPoint`, `finishActiveSession` |
| История | `history` | пополняется при `finishActiveSession` |

Computed: `adaptedWorkout`, `activeRoute`, `suggestedRoute`, `analyticsReport`, `needsOnboarding`, `readinessScore`, `targetZone`, `sessionProgress`, `appThemePalette`.

## Сервисы (бизнес-логика)

| Файл | Назначение |
|------|------------|
| `services/heartRateZones.ts` | Дефолтные зоны от max HR, appearance для UI |
| `services/recovery.ts` | `calculateReadinessScore`, `getRecoveryRecommendation` |
| `services/trainingPlan.ts` | `adaptWorkoutForReadiness` по readiness |
| `services/shoes.ts` | износ %, статус пары, `addWorkoutDistanceToShoe` |
| `services/workoutSession.ts` | сессия, GPS-дистанция с фильтрацией шума, pace, serialize/restore |
| `services/geolocation.ts` | position → TrackPoint, сообщения об ошибках |
| `services/voiceAlerts.ts` | правила алертов (пульс/темп), cooldown 60 с |
| `services/routes.ts` | CRUD-черновик маршрута, `pickSuggestedRoute`, bounds, `createRouteFromTrack` |
| `services/analytics.ts` | `buildAnalyticsReport` — суммы и недельные бакеты по `finishedAt` |
| `services/heart-rate/heartRateSource.ts` | iOS Safari PWA: пульс `unavailable` |
| `services/themePalettes.ts` | 6 профилей цвета, CSS variables для recolor приложения |

## Composables

- `useGeolocationTracking` — watchPosition, статусы idle/tracking/denied/error.
- `useVoiceAlerts` — SpeechSynthesis, toggle, speak из store alerts.

## Страницы

| Маршрут | Файл | Тема |
|---------|------|------|
| `/` | `pages/index.vue` | light — Сегодня |
| `/plan` | `pages/plan.vue` | light — CRUD плана + маршрут |
| `/start` | `pages/start.vue` | dark — превью перед бегом |
| `/workout/active` | `pages/workout/active.vue` | dark — live GPS, без bottom nav |
| `/workout/result` | `pages/workout/result.vue` | light — итог + карта трека |
| `/history` | `pages/history.vue` | light |
| `/analytics` | `pages/analytics.vue` | light |
| `/profile` | `pages/profile.vue` | light — профиль + выбор палитры приложения |
| `/welcome` | `pages/welcome.vue` | light — онбординг (4 шага, можно пропустить) |
| `/recovery` | `pages/recovery.vue` | light — форма check-in |
| `/heart-rate-zones` | `pages/heart-rate-zones.vue` | light |
| `/shoes` | `pages/shoes.vue` | light — полный CRUD + ручной пробег |
| `/routes` | `pages/routes.vue` | light — CRUD + подсказка по дистанции |

## Shell, навигация, splash, цвет

- `app.vue` — SSR-visible splash (`#rb-vue-splash`) сразу в HTML; после `onMounted`: hydrate store → restore active session → `appReady`.
- `app.vue` также применяет CSS-переменные выбранной палитры на `body`.
- `plugins/splash.client.ts` — fallback для legacy/static splash `#rb-splash`, если он есть в HTML.
- `components/layout/AppShell.vue`:
  - **Bottom nav:** Сегодня · План · Трекер · История · Профиль + строка «Маршруты» / «Кроссовки».
  - Скрыт на `/workout/active` и `/welcome`.
  - `z-index: 9990`, safe-area снизу.
- Safe-area сверху: `padding-top: calc(env(safe-area-inset-top) + 12px)` на `.app-frame`.
- `/start` использует locked shell: без верхнего padding, без overscroll, карта под статусной областью.
- Профиль хранит `colorThemeId`. Доступные палитры: `runbalance`, `velocity`, `aero`, `ember`, `volt`, `graphite`.

## PWA (iOS)

- `nuxt.config.ts`: `display: standalone`, `viewport-fit=cover`, apple meta, иконки в `public/icons/`.
- Standalone без URL-bar — только при запуске **с иконки** (Add to Home Screen), не из вкладки Safari.

## Карты (MapLibre)

- `components/ui/RouteMap.vue` — OSM tiles, линия маршрута, fitBounds.
- Используется на: Сегодня, Старт, Маршруты, Результат.
- Если GPS-трек содержит ≥2 точки, показывается линия. Если есть только 1 точка, показывается стартовая точка, чтобы результат не выглядел пустым.
- Маркер текущей/стартовой позиции берёт цвет из активной палитры профиля.
- Новые маршруты без нарисованного GeoJSON показывают подпись «трек ещё не записан».

## Live-тренировка

- Метрики только из `activeSession` (время от `startedAt`, дистанция из track points).
- GPS-фильтр: accuracy ≤30 м, минимальное смещение, max speed 8 m/s (`workoutSession.ts`).
- Пульс в UI: заглушка «не подключён» (Capacitor BLE — future scope).
- Голос + визуальный баннер для pace-алертов (пульсовые алерты без HR не срабатывают).

## Онбординг

- `/welcome`: имя → цель → max HR (оценка по возрасту Tanaka-like: `208 - 0.7*age`).
- `skipOnboarding()` — флаг `onboarded: true` без заполнения полей.
- `completeOnboarding()` — создаёт зоны через `createDefaultHeartRateZones`.

## Тесты (Vitest)

`tests/unit/`: heartRateZones, recovery, trainingPlan, shoes, workoutSession, geolocation, voiceAlerts, routes, analytics.

## Future scope (не реализовано)

- Backend sync, auth, IndexedDB.
- Polar H10 / BLE пульс.
- MapLibre draw/edit маршрута на карте.
- Редактирование запланированной тренировки (только create/delete/select).
- Распределение по зонам в аналитике без реального HR.
- Голосовые этапы тренировки (stage_started) в полном объёме.
- FIT import, социальные функции.
