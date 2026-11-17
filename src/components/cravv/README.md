# Cravv components (onboarding + tabs)

`import { Chip, DIETS, … } from "@/components/cravv"`. Built from Figma file `jxCb3e8Ss6GLRHv6mEveav`, section 5 "Components · Onboarding" (`2608:10940`). See every variant at **/dev**.

Rules: colours come only from `var(--cravv-*)` tokens or the Tailwind theme names. Option colours go through `token` props (`"diet-vegan"` → `--cravv-option-diet-vegan-base` / `-fill`). Copper is for progress and links only. Components fill their container's width; the screen sets the 20px side padding. Motion reads `useMotionTokens()` from `@/proto/motion`, so "Slow animations ×5" and reduced motion apply automatically.

| Component | Key props | Figma |
|---|---|---|
| `Icon` | `name: IconName`, `size=24`, `strike?` (avoid treatment), `title?`, `style={{color}}`. Colour = `currentColor`. `ICON_NAMES` lists all 71 (55 onboarding + 16 from the Tabs grids: sliders, display, shield, bell, help, target, chevron, cart, search, mic, sun, sunrise, moon, filters, soup, pot). | `2617:4051` |
| `Chip` | `label`, `icon`, `state: "off" \| "on" \| "avoid"`, `token`, `onClick`, `variant: "onboarding" \| "filter"` (filter sheet: 9/12px padding, 5px gap). `aria-pressed`. Fill blooms from the touch point. | `2611:4108`, `2680:6714` |
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

## Tabs (Components · Tabs, handoff §4 / §11)

Rows (`SettingsRow`, `MealRow`, `NutrientRow`, `TaraCard`) draw their own hairline at the top (`separator`, default true; `TaraCard` false) and stack inside `SettingsGroup`, which hides it on the first row. Rows that paint their own background use the `PRESS` overlay (opacity only) for the pressed state.

| Component | Key props | Figma |
|---|---|---|
| `TabBar` | `active: TabId`, `onSelect(tab)`. Fills its container: place it `TAB_BAR_INSET` (20) px from the sides. `TAB_BAR_HEIGHT` = 64. One pill slides (transform); icon takes `--cravv-option-tab-<tab>-base`. Backdrop blur. | `2674:6167` |
| `CookingMiniBar` | `mode: "cooking" \| "watching"`, `title`, `detail`, `progress` 0..1 (mint ring, eases to each value), `photo?`, `cameraPaused?` (grey, still dot; otherwise the dot pulses), `onPress`. `MINI_BAR_HEIGHT` 58, `MINI_BAR_GAP` 6 (above the tab bar). Rise-in is up to the shell. | `2674:6186` |
| `SettingsRow` | `type: "navigation" \| "value" \| "two-line" \| "switch" \| "destructive"`, `label`, `icon?` (always grey), `value?`, `subtitle?`, `checked`/`onChange` (switch), `onPress`, `separator`. | `2674:6230` |
| `SettingsGroup` | `header?` ("Tara"), `footer?`, children. Rounded 16, raised surface. | P01 |
| `Switch` | `checked`, `onChange(bool)`, `label` or `labelledBy`. On = `--cravv-toggle-on-fill`; knob slides with a slight spring. | `2674:6233` |
| `MealRow` | `context: "nutrition" \| "journal"`, `type: "tara-cook" \| "logged" \| "not-logged"`, `slot?` (nutrition caps label), `name?`, `detail?`, `kcal?` (counts on change), `photo?`, `rating?` (journal), `onPress`, `onLog` (Log pill), `separator`. | `2674:6290` |
| `DayHeader` | `label` ("Today · Tue 17", shown in caps), `kcal` (ticks up on change). | `2674:6293` |
| `NutrientRow` | `nutrient: NutrientId`, `value`, `target`, `unit?`/`kind?` (default from `NUTRIENTS`), `status?` (default "12 g to go" / "Well under the limit" / "300 mg over the limit"; amber when over a limit), `separator`. | `2675:6100` |
| `MacroRingCard` | `kcalTarget`, `kcalEaten`, `macros: {protein, carbs, fat}` each `{value, target}` in g. Segments = macro kcal / target, draw clockwise in order on mount, ease on change; centre counts; "kcal over" in amber. | `2675:6122` |
| `ProgressBar` | `value` 0..1, `color`. 6px, translateX fill. | |
| `TipNote` | children (text), `linkLabel?` + `onLink` (copper), or `action?` node. | `2675:6130` |
| `TargetsRow` | `value` ("1,900 kcal"), `label?`, `set=true` (green target icon), `onPress`. | `2675:6140` |
| `AccountCard` | `name`, `subtitle="Signed in with Apple"`, `initial?`, `onPress`. Avatar = tab-profile fill. | `2675:6150` |
| `TaraCard` | `state: "online" \| "offline" \| "not-set-up"`, `name?`, `detail?`, `lastSeen?`, `note?`, `onPress`, `onSetUp`. Pill cross-fades. Drawing: `/img/tabs-ui/tara.svg`. | `2675:6269` |
| `ActionSheet` | `title?`, `message?`, `actions: {label, destructive?, onPress}[]`, `onCancel`, `cancelLabel`. No `open` prop: render inside `<AnimatePresence>` while shown; fills the nearest positioned ancestor. Destructive tap calls `navigator.vibrate?.(10)`. Escape / dim tap cancel. | `2675:6280` |
| `Rating` | `value` 0–5, `onChange?` (interactive, tap current to clear), `size=11`. | `2675:6349` |
| `MealChip` | `meal: MealId`, `selected`, `onClick`. Off 8% white, pressed 16%, on = meal fill blooming from the touch point. | `2677:6228` |
| `FilterButton` | `count` (0 = default; > 0 = active + badge), `onClick`, `icon="filters"`. | `2677:6231` |
| `MealFilterRow` | `selected: MealId \| null`, `onSelect(meal \| null)` (tapping the selected chip sends null), `filterCount`, `onFilters`. | `2677:6506` |
| `useCountUp(value, {from?, duration?})` / `formatNumber` | rAF number tween (text only) / "1,070". | |

Tabs data: `TABS`, `NUTRIENTS` (with `unit`, `kind`), `MEALS` (with `hours`), `COURSES`, `MORE`; `mealForHour(h)`; id types `TabId`, `NutrientId`, `MealId`, `CourseId`, `MoreId`.

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
