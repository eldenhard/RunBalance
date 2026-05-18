# Phase 3 Workout Session Foundation Plan

**Goal:** Move the active workout flow from static mock values to a local-first workout session foundation that can later accept real GPS points, Capacitor BLE heart-rate readings, voice alerts, and offline persistence.

**Scope for this block:**

- Add pure workout-session calculations for distance, duration, average pace, progress, and finish summary.
- Add an active-session snapshot model that can be saved and restored locally.
- Add voice/visual alert rules as pure functions with cooldowns.
- Connect Pinia actions for starting, pausing, resuming, finishing, and restoring a workout session.
- Update the active workout screen to read from session state instead of static workout mock fields.

**Out of scope for this block:**

- Real GPS recording loop.
- Capacitor BLE / Polar H10 live pulse.
- Background geolocation.
- Real route generation.
- Cloud sync.

## Tasks

- [x] Add failing tests for workout session calculations.
- [x] Add failing tests for voice alert rules.
- [x] Implement session and alert services.
- [x] Add session types and local storage snapshot helpers.
- [x] Wire store actions to local-first session state.
- [x] Update active workout UI with session state and visual alert banner.
- [ ] Verify with tests, typecheck, build, local routes, GitHub push, and Vercel production.
