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
