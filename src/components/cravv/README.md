# Cravv components (onboarding)

`import { Chip, DIETS, … } from "@/components/cravv"`. Built from Figma file `jxCb3e8Ss6GLRHv6mEveav`, section 5 "Components · Onboarding" (`2608:10940`). See every variant at **/dev**.

Rules: colours come only from `var(--cravv-*)` tokens or the Tailwind theme names. Option colours go through `token` props (`"diet-vegan"` → `--cravv-option-diet-vegan-base` / `-fill`). Copper is for progress and links only. Components fill their container's width; the screen sets the 20px side padding. Motion reads `useMotionTokens()` from `@/proto/motion`, so "Slow animations ×5" and reduced motion apply automatically.

| Component | Key props | Figma |
|---|---|---|
| `Icon` | `name: IconName`, `size=24`, `strike?` (avoid treatment), `title?`, `style={{color}}`. Colour = `currentColor`. `ICON_NAMES` lists all 55. | `2617:4051` |
| `Chip` | `label`, `icon`, `state: "off" \| "on" \| "avoid"`, `token`, `onClick`. `aria-pressed`. Fill blooms from the touch point. | `2611:4108` |
| `ChoiceTile` / `ChoiceTileGroup` | tile: `label`, `hint?`, `icon`, `token`, `selected`, `onClick`. Group: `label` (radiogroup; tiles share width). | `2611:4126` |
| `InfoTile` | `label`, `hint?`, `icon`, `token` (icon always in base colour). Not interactive. | `2611:4135` |
| `SegmentedControl` | `options` (values or `{value,label}`), `value`, `onChange`, `label`, `variant: "ios" \| "pill"`. `ios` = Burners, `pill` = US/Metric on 05. Sliding thumb, arrow keys. | `2610:4171`, `2525:2772` |
| `StepProgress` | `steps: 3 \| 4`, `current` (1-based), `animate=true` (current segment fills left→right on mount). | `2611:4083` |
| `StovePreview` | `burners: 1–5`, `type` ("Electric coil"). Burners glide between layouts. `StovePlan` = the 126px drawing alone. | `2610:4068` |
| `StatusPill` | `tone: "success" \| "warning" \| "error"`, children = text. | `2611:4150` |
| `TextField` | `label` (sr-only), `value`, `onChange(string)`, `type: "name" \| "password"`, `error?` (message; red ring + text below), `trailing?` ("From Apple ID"), `placeholder`, `autoFocus`, `onSubmit`. Password has the eye toggle. | `2611:4187` |
| `ListGroup` / `ListRow` | group: `label` (radiogroup, rounded 26, hides last separator). Row: `label`, `icon`, `token`, `selected`, `onClick`. 48px; icon + check take the option base colour. | `2611:4206` |
| `SectionTitle` | children, `inset=true` (16px). "Stove type", "Burners". | iOS kit |
| `SheetHeader` | `title`, `subtitle?`, `grabber=true`, `titleId?`. Transparent: sits inside the shell's `Sheet`. | `2612:4051` |
| `CalibrationResult` | `seen`, `picked`. Matched / Fewer / More derived (`calibrationOutcome()`). Settles in. | `2612:4077` |
| `CalibrationProgress` | `label`, `progress` 0..1. | `2612:4084` |
| `SetupStep` / `SetupStepStrip` | step: `number`, `label`. Strip: `steps: string[]` (numbered 01…, left-aligned, 18px gaps). | `2612:4090`, `2532:2811` |
| `Viewfinder` | `size?: number \| {width,height}` (else fills parent), `children`. | `2612:4093` |
| `Callout` | `number`, `label` ("01 DISPLAY"). | `2612:4103` |
| `PrimaryButton` | children, `loading?`, `done?`, `disabled?`, `onClick`, `type`. White 52px pill. | `2532:2809` |
| `TextButton` | children, `onClick`. 44px, 17 regular, 85% white. | `2532:2810` |
| `BackButton` / `CloseButton` | `onClick`, `label?` ("Back"/"Close"). 48px glass circle. `GlassButton` for other glyphs. | `2525:2746`, `2525:2906` |
| `Spinner` | `size=20`, `color=currentColor`, `label="Loading"`. | |

## Option data (`options.ts`)

`DIETS`, `ALLERGIES`, `CUISINES`, `SKILLS`, `STOVE_TYPES`, `SETUP_NEEDS`: arrays of `{ id, label, icon, token, hint? }` from the Colour map (`2618:4049`). Spread them straight into components:

```tsx
{DIETS.map((d) => (
  <Chip key={d.id} label={d.label} icon={d.icon} token={d.token}
        state={diets.includes(d.id) ? "on" : "off"} onClick={() => toggle(d.id)} />
))}
{ALLERGIES.map((a) => <Chip key={a.id} {...a} state={picked ? "avoid" : "off"} … />)}
```

Helpers: `optionBase(token)`, `optionFill(token)`, `optionTint(token, 14)` return CSS colour strings. Id types: `DietId`, `AllergyId`, `CuisineId`, `SkillId`, `StoveTypeId`, `SetupNeedId`.
