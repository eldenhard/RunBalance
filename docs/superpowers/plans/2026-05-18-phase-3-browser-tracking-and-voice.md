# Phase 3 Browser Tracking And Voice Plan

**Goal:** Add browser-level PWA wrappers for GPS tracking and voice/visual alerts on top of the local-first workout session foundation.

**Scope for this block:**

- Normalize Browser Geolocation API readings into RunBalance `TrackPoint` values.
- Add a composable for starting/stopping foreground geolocation tracking on the active workout screen.
- Add a composable for SpeechSynthesis voice alerts with a visual fallback.
- Surface GPS and voice statuses on the active workout screen.
- Keep iOS Safari constraints explicit: foreground GPS only for now, no background tracking, no Polar H10 live pulse until Capacitor.

**Out of scope for this block:**

- Background geolocation.
- Offline sync queue.
- MapLibre live map.
- BLE heart-rate stream.
- Audio coaching programs.

## Tasks

- [x] Add failing tests for geolocation normalization and error messages.
- [x] Implement geolocation service helpers.
- [x] Implement `useGeolocationTracking`.
- [x] Implement `useVoiceAlerts`.
- [x] Wire GPS and voice statuses into the active workout screen.
- [ ] Verify with tests, typecheck, build, local routes, GitHub push, and Vercel production.
