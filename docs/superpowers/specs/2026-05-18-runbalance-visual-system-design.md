# RunBalance Visual System Design

> **Implemented:** `app/assets/css/tailwind.css` (theme-light/dark), `AppShell.vue`, компоненты `ui/*`. См. [runbalance-visual-direction.md](../../design/runbalance-visual-direction.md).

## Goal

Define the approved visual system before Phase 2 implementation.

## Approved Direction

The approved direction combines:

- `Strict Sport` for workout start and active workout.
- `Apple Coach` for planning, recovery, history, shoes, profile, and analytics.

The rejected direction is `Map-First Runner` as a global visual model. Maps remain functional route screens, not the main design language.

## Core Rules

- Light theme is the default planning and analysis environment.
- Dark theme is the focused workout environment.
- Typography targets Helvetica Now Display Medium at weight 500, with fallback to Helvetica Neue and Arial.
- UI scale is restrained, not oversized.
- Orange is a limited sport accent, not the dominant brand color.
- All components must support light and dark tokens.
- User-selected profile palettes may recolor accent tokens, but must not change layout density, typography, neutral surfaces, or semantic heart-rate zone colors.
- Map-first is allowed for the tracker start screen, where the user needs location context immediately; it is not the default model for planning/profile/history screens.

## Palette Personalization

Profile exposes 6 palette options:

- `RunBalance`: lime, sky, orange.
- `Velocity`: red, ice, graphite.
- `Aero`: blue, mint, lime.
- `Ember`: orange, amber, cream.
- `Volt`: acid lime, turquoise.
- `Graphite`: black, lime, grey.

Implementation rules:

- Store the chosen palette as `profile.colorThemeId`.
- Keep definitions in `app/services/themePalettes.ts`.
- Apply palette through runtime CSS variables on `body`.
- Use `--theme-primary`, `--theme-primary-soft`, `--theme-secondary`, `--theme-sport`, `--theme-marker`, hero gradient tokens, and `--theme-dark-glow`.
- Keep app surfaces readable in both light and dark contexts.
- GPS/current-position marker follows `--theme-marker`.
- Heart-rate zones remain independent semantic colors.

## Current Tracker Decisions

- `/start` is a tracker entry screen, not a generic start button. Bottom nav label is `Трекер`.
- Tracker start is map-first with a visible current-position point, a compact metric overlay, one plan action and one centered play action.
- The page must not overscroll or expose white gaps above/below the PWA viewport.
- Workout launch animation should be dynamic and immediate: no blank pre-delay, no double splash.
- Active workout and result must preserve recorded GPS points. If only one point exists, show the start point instead of an empty map.
- Finish copy is `Тренировка завершена`.

## Implementation Boundary

Phase 2 should implement the design system through CSS tokens and reusable layout primitives before deepening feature screens.

Screens to update in Phase 2:

- Today
- Plan
- Start
- Active workout
- Result
- Profile
- Shoes
- Recovery
- Heart-rate zones

## Acceptance Criteria

- Light screens use off-white background, white surfaces, thin borders, and compact blocks.
- Start and active workout use the dark workout theme.
- Font stack is applied globally.
- Existing Phase 1 behavior remains working.
- Unit tests continue to pass.
- Production build continues to pass.
