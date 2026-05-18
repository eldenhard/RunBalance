# AGENTS.md

## Назначение файла

Этот файл описывает правила работы AI-агентов и разработчиков в репозитории PWA-приложения для бега.

Проект — mobile-first PWA-приложение для бега, которое помогает пользователю планировать тренировки, контролировать пульсовые зоны, выбирать маршруты, отслеживать восстановление и учитывать ресурс кроссовок.

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
- Map-first подход не является основной визуальной моделью Phase 2. Карта остаётся функциональным экраном маршрута, а не главным стилем приложения.

### Product Tone

- Приложение звучит как спокойный тренер, а не как медицинский сервис.
- Тексты короткие, уверенные, без драматизации и без диагнозов.
- Объяснения нагрузки должны быть видимыми, но не длинными.

## Main Navigation

Bottom navigation:

- Сегодня
- План
- Старт
- История
- Профиль

Secondary sections:

- Маршруты
- Восстановление
- Кроссовки
- Пульсовые зоны
- Голосовые подсказки
- Настройки

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

## Suggested Frontend Structure

```text
app/
  components/
    ui/
    layout/
    today/
    workout/
    recovery/
    routes/
    shoes/
    analytics/

  composables/
    useGeolocationTracking.ts
    useWorkoutSession.ts
    useVoiceAlerts.ts
    useHeartRateZones.ts
    useShoeMileage.ts
    useRecoveryScore.ts
    useRouteBuilder.ts

  features/
    profile/
    training-plan/
    workout/
    recovery/
    routes/
    shoes/
    history/
    analytics/

  stores/
    profile.store.ts
    trainingPlan.store.ts
    workout.store.ts
    recovery.store.ts
    routes.store.ts
    shoes.store.ts

  types/
    profile.ts
    workout.ts
    route.ts
    shoe.ts
    recovery.ts
    heart-rate.ts

  pages/
    index.vue
    plan.vue
    start.vue
    history.vue
    profile.vue

  server/
    api/
```

## Domain Models

### UserProfile

```ts
export type UserGoal =
  | '5k'
  | '10k'
  | 'half_marathon'
  | 'base'
  | 'return_to_running'

export type UserProfile = {
  id: string
  displayName: string
  goal: UserGoal
  maxHeartRate: number
  trainingDays: number[]
  zones: HeartRateZone[]
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
- итоговой статистики тренировки;
- правил голосовых уведомлений;
- восстановления активной тренировки из локального хранилища.

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

### Phase 1

- Nuxt project setup.
- Tailwind setup.
- shadcn-style UI setup.
- Layout and navigation.
- Main pages.
- Mock data.
- Today screen.
- Shoes screen.
- Workout result screen.

### Phase 2

- Profile.
- Heart-rate zones.
- Training plan.
- Recovery check-in.
- Readiness score.
- Shoe mileage logic.

### Phase 3

- Workout session.
- GPS tracking.
- Local persistence.
- Active workout screen.
- Voice alerts.
- Visual alerts.

### Phase 4

- Workout planning CRUD.
- Planned workout scheduling by day.
- Target zone assignment for planned workouts.
- Manual heart-rate zone management.
- Routes.
- Suggested route flow.
- Saved routes.
- History.
- Basic analytics.

## Final Rule

Если новая задача не относится к MVP, сначала пометь её как `future scope`, а не добавляй в реализацию автоматически.
