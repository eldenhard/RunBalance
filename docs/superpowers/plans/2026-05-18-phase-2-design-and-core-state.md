# Phase 2 Design And Core State Implementation Plan

> **STATUS: COMPLETED** (2026-05-18). См. [implementation-status.md](../../product/implementation-status.md).

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved RunBalance A+B visual system and implement Phase 2 local-first profile, heart-rate zones, training plan, recovery check-in, readiness score, and shoe mileage state.

**Architecture:** Keep RunBalance frontend-only and local-first. Add pure services with tests for readiness and training adaptation, then expose mock/local state through Pinia. Apply visual consistency through CSS tokens and reusable screen primitives, with light planning screens and dark workout screens.

**Tech Stack:** Nuxt 4, Vue 3, TypeScript, Pinia, Tailwind CSS, Vitest.

---

## File Structure

- Modify: `AGENTS.md` to keep approved design rules visible to all future agents.
- Create: `docs/design/runbalance-visual-direction.md` as the durable design reference.
- Modify: `app/assets/css/tailwind.css` for tokens, typography, light/dark theme classes.
- Create: `app/components/layout/ScreenHeader.vue` for compact page headers.
- Create: `app/components/layout/MetricTile.vue` for reusable metrics.
- Modify: `app/components/ui/Button.vue`, `Card.vue`, `Badge.vue`, `Progress.vue` to use theme tokens.
- Create: `app/services/recovery.ts` for readiness scoring.
- Create: `app/services/trainingPlan.ts` for local training-plan adaptation.
- Create: `tests/unit/recovery.test.ts`.
- Create: `tests/unit/trainingPlan.test.ts`.
- Modify: `app/data/mockRunBalance.ts` and `app/stores/runBalance.store.ts`.
- Create: `app/pages/recovery.vue`.
- Create: `app/pages/heart-rate-zones.vue`.
- Modify: existing pages to align with A+B visual direction.

## Task 1: Document Visual System

- [ ] Add approved A+B direction to `AGENTS.md`.
- [ ] Add `docs/design/runbalance-visual-direction.md`.
- [ ] Add `docs/superpowers/specs/2026-05-18-runbalance-visual-system-design.md`.
- [ ] Add `.superpowers` to `.gitignore`.

## Task 2: Add TDD Recovery Logic

- [ ] Write `tests/unit/recovery.test.ts`.
- [ ] Run `npm test tests/unit/recovery.test.ts` and verify it fails because service is missing.
- [ ] Implement `app/services/recovery.ts` with `calculateReadinessScore` and `getRecoveryRecommendation`.
- [ ] Run `npm test tests/unit/recovery.test.ts` and verify it passes.

## Task 3: Add TDD Training Adaptation

- [ ] Write `tests/unit/trainingPlan.test.ts`.
- [ ] Run `npm test tests/unit/trainingPlan.test.ts` and verify it fails because service is missing.
- [ ] Implement `app/services/trainingPlan.ts` with `adaptWorkoutForReadiness`.
- [ ] Run `npm test tests/unit/trainingPlan.test.ts` and verify it passes.

## Task 4: Apply Visual Tokens

- [ ] Update `app/assets/css/tailwind.css` with approved light/dark tokens and Helvetica-style font stack.
- [ ] Update UI primitives to use tokenized colors and restrained radii.
- [ ] Add `ScreenHeader.vue` and `MetricTile.vue`.

## Task 5: Add Phase 2 Screens

- [ ] Add `/recovery` screen with check-in data, readiness score, and recommendation.
- [ ] Add `/heart-rate-zones` screen with editable-looking zone rows for Phase 2 UI.
- [ ] Update `/profile` with links to recovery, zones, shoes, and settings-style structure.
- [ ] Update `/plan` to show adapted workout reasoning.

## Task 6: Polish Existing Screens

- [ ] Update Today to use strict light planning layout.
- [ ] Update Start to use dark strict sport layout.
- [ ] Update Active Workout to use dark workout metrics.
- [ ] Update Result, Shoes, History to match the light system.

## Task 7: Verify And Publish

- [ ] Run `npm test`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run build`.
- [ ] Commit Phase 2.
- [ ] Push to GitHub.
- [ ] Confirm Vercel production responds after auto-deploy.
