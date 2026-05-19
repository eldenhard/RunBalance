# RunBalance Visual Direction

> **Реализация в коде:** темы `theme-light` / `theme-dark` в `app/assets/css/tailwind.css`; shell и bottom nav — `AppShell.vue`; токены `--screen-*` / `--workout-*`.

## Decision

RunBalance uses a combined `Strict Sport` + `Apple Coach` visual language.

The product should feel like a restrained premium running assistant: calm while planning, focused while running. It must not look like a social feed, a medical dashboard, or a generic SaaS app.

## References

- Nike Run Club: confident running language, large workout metrics, fast start.
- Strava: sport context, route/progress/history patterns, recognizable runner workflows.
- Simpla: Russian-speaking running product feel, practical training and community context.
- Apple: restrained surfaces, precise hierarchy, high-quality typography, clean spacing.

## Themes

### Light Theme

Use for:

- Today planning
- Recovery
- Training plan
- Profile
- Shoes
- Heart-rate zones
- History
- Analytics
- Settings

Visual rules:

- Warm off-white app background.
- White content surfaces.
- Thin neutral borders.
- Low or no shadow.
- Compact information blocks.
- Black primary action.
- Muted statuses and badges.

### Dark Theme

Use for:

- Workout start
- Active workout
- Pause/finish flow
- High-attention alerts while running

Visual rules:

- Near-black background.
- Dark elevated surfaces.
- White and grey typography.
- Large but restrained metrics.
- Few controls.
- High-contrast action buttons.
- No decorative gradients.

## Typography

Preferred font:

```css
font-family: "Helvetica Now Display", "Helvetica Neue", Arial, sans-serif;
```

`Helvetica Now Display Medium` with weight `500` is the target feel. Do not bundle Helvetica Now Display without a licensed font file.

Use:

- 500 for headings and primary metrics.
- 400 for body and secondary labels.
- No negative letter spacing.
- No viewport-based font scaling.

## Scale

The interface should be smaller and stricter than the first Phase 1 draft.

Guidelines:

- Page title: 24-28px.
- Section title: 17-20px.
- Card metric: 22-32px.
- Active workout primary metric: 38-52px.
- Body text: 14-15px.
- Labels: 11-13px.

## Radius And Surfaces

- Standard cards: 14-18px.
- Compact controls: 12-14px.
- Large screen containers: 24-28px.
- Buttons: 12-14px, except circular workout start button.
- Avoid nested cards.

## Color Direction

Core palette:

- Light background: `#f7f7f5`
- Light surface: `#ffffff`
- Primary text: `#111111`
- Muted text: `#767676`
- Border: `#deded9`
- Dark background: `#0b0b0c`
- Dark surface: `#151515`
- Dark border: `#252525`
- Dark muted text: `#9b9b9b`

Accent:

- Orange can be used as a small sport accent.
- Orange must not dominate the visual system.
- Primary action is black/white contrast.
- User palettes recolor accents only; neutral surfaces, typography scale, safe-area behavior and core contrast stay stable.

### Profile Palettes

The user can choose the app accent palette on `/settings`. The selected id is stored in `profile.colorThemeId`; palette definitions live in `app/services/themePalettes.ts`.

Runtime CSS variables:

- `--theme-primary`
- `--theme-on-primary`
- `--theme-primary-soft`
- `--theme-secondary`
- `--theme-sport`
- `--theme-marker`
- `--theme-hero-from`
- `--theme-hero-via`
- `--theme-hero-to`
- `--theme-dark-glow`

Approved palettes:

- `RunBalance` — lime, sky, orange. Default energetic running palette.
- `Velocity` — red, ice, graphite. Sharper sport accent without making the UI aggressive.
- `Aero` — blue, mint, lime. Lighter technical palette for map and GPS-heavy use.
- `Ember` — orange, amber, cream. Warm sport palette, still limited to accents.
- `Volt` — acid lime, turquoise. Most energetic palette, useful for high-contrast start states.
- `Graphite` — black, lime, grey. Strict monochrome base with a controlled running accent.

Rules:

- Palette changes must be instant and local-first.
- Palette choice must persist with the profile snapshot.
- Palette settings live on `/settings`, not inside the profile form.
- Do not recolor heart-rate zones with profile palettes; zones keep their own semantic colors.
- Map current-position marker uses `--theme-marker`.
- Buttons that use `--theme-primary` must use `--theme-on-primary` for readable text.
- Completed workout cards and route/result highlights can use palette hero tokens.

## Screen Mapping

- Today: light.
- Plan: light.
- Recovery: light.
- Shoes: light.
- History: light.
- Profile: light.
- Start: dark.
- Active workout: dark.
- Result: light.
- Route selection: light unless user is already in workout start context.

## Product Voice

Use short, calm, coach-like wording:

- “Рекомендация по нагрузке”
- “Лёгкий бег”
- “Держи ровный темп”
- “Лучше снизить интенсивность”

Avoid:

- Medical claims.
- Overconfident diagnosis.
- Social-network pressure.
- Long explanations in primary UI.
