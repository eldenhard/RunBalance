# RunBalance Visual Direction

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
