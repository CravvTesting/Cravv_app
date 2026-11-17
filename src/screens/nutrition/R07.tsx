"use client";

/*
 * R07 · Food detail: a sheet over the search. Shows the effect on today's watched nutrients
 * before you add. Add → appends the meal and pops to R01, where the new row expands in place.
 */
import { Icon, NUTRIENTS, PrimaryButton, formatNumber, type NutrientId } from "@/components/cravv";
import { go } from "@/proto/nav";
import { useProto } from "@/proto/store";
import { LIMITS, foodById, mealFromFood, portionLabel, slotLabel, targetOf, todayTotals, valueOf } from "./today-data";
import { setTodayUI, useTodayUI } from "./today-state";
import { SearchView } from "./R06";
import { Card, GroupLabel, Hairline, ICON_OFF, MacroStats, SECONDARY, SheetRoute, Stepper, useSheetClose } from "./today-ui";

export default function R07() {
  const meals = useProto((s) => s.meals);
  const targets = useProto((s) => s.targets);
  const watching = useProto((s) => s.watching);
  const overLimit = useProto((s) => s.debug.overLimit);
  const set = useProto((s) => s.set);
  const foodId = useTodayUI((s) => s.foodId);
  const portion = useTodayUI((s) => s.portion);
  const slot = useTodayUI((s) => s.slot);
  const sheet = useSheetClose();
  const f = foodById(foodId);

  const dismiss = () => sheet.close(() => go("R06", { dir: "instant" }));
  const add = () => {
    const meal = mealFromFood(f, portion, slot);
    setTodayUI({ justAdded: meal.id });
    set({ meals: [...meals, meal] });
    go("R01", { dir: "pop" });
  };
  const setPortion = (p: number) => setTodayUI({ portion: Math.max(0.5, Math.min(12, p)) });

  const now = todayTotals(meals, overLimit);
  const after = todayTotals([...meals, mealFromFood(f, portion, slot)], overLimit);
  // Watched nutrients, the ones this meal puts over a limit first.
  const watched = NUTRIENTS.filter((n) => watching.includes(n.id as never))
    .map((n) => n.id as NutrientId)
    .sort((a, b) => Number(valueOf(after, b) > targetOf(b, targets) && b !== "fiber" && b !== "protein") - Number(valueOf(after, a) > targetOf(a, targets) && a !== "fiber" && a !== "protein"));
  const k = (v: number) => Math.round(v * portion);

  return (
    <SheetRoute
      underlay={<SearchView inert />}
      label={f.name}
      open={sheet.open}
      onDismiss={dismiss}
      onClosed={sheet.onClosed}
    >
      <div className="relative px-5 pt-7">
        <div aria-hidden className="absolute left-1/2 top-1.5 h-[5px] w-9 -translate-x-1/2 rounded-[3px] bg-white/30" />
        <div className="flex items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-white/[0.06]" style={{ color: ICON_OFF }}>
            <Icon name={f.icon} size={24} />
          </span>
          <div className="flex min-w-0 flex-col">
            <h2 className="truncate text-[22px] font-bold leading-7 text-white">{f.name}</h2>
            <p className="mt-0.5 text-[13px] leading-4" style={{ color: SECONDARY }}>Estimate · USDA FoodData Central</p>
          </div>
        </div>

        <Card secondary className="mt-5 flex h-16 items-center justify-between px-4">
          <span className="text-[16px] font-semibold leading-[19px] text-white">Portion</span>
          <Stepper
            name={f.units}
            label={portionLabel(f, portion)}
            onMinus={() => setPortion(portion - (portion > 1 ? 1 : 0.5))}
            onPlus={() => setPortion(portion + (portion >= 1 ? 1 : 0.5))}
            canMinus={portion > 0.5}
          />
        </Card>

        <Card secondary className="mt-3 flex h-[76px] items-center">
          <div className="w-full"><MacroStats kcal={k(f.kcal)} protein={k(f.protein)} carbs={k(f.carbs)} fat={k(f.fat)} /></div>
        </Card>

        {watched.length > 0 && (
          <>
            <GroupLabel className="mt-[18px]">After this meal</GroupLabel>
            <Card secondary>
              {watched.map((id, i) => {
                const n = NUTRIENTS.find((x) => x.id === id)!;
                const target = targetOf(id, targets);
                const before = valueOf(now, id);
                const v = valueOf(after, id);
                const limit = n.kind === "limit";
                const overNow = limit && v > (id === "added-sugar" ? LIMITS["added-sugar"] : target) && before <= target;
                const status = overNow
                  ? id === "added-sugar" ? "Over 10 g for one meal" : "Puts you over today’s limit"
                  : limit && v > target ? `Already over · adds ${formatNumber(v - before)} ${n.unit}`
                    : `Adds ${formatNumber(v - before)} ${n.unit}`;
                const warn = limit && v > target;
                return (
                  <div key={id} className="relative flex h-[66px] items-start">
                    {i > 0 && <Hairline inset={52} />}
                    <span className="ml-4 mt-[14px] shrink-0" style={{ color: `var(--cravv-option-nutrient-${id}-base)` }}><Icon name={n.icon} size={22} /></span>
                    <div className="ml-3.5 mr-4 flex min-w-0 flex-1 flex-col pt-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[16px] font-semibold leading-[19px] text-white">{n.label}</span>
                        <span className="shrink-0 text-[14px] leading-[17px] tabular-nums" style={{ color: "rgb(235 235 245 / 0.75)" }}>
                          {formatNumber(v)} / {formatNumber(target)} {n.unit}
                        </span>
                      </div>
                      <span className={warn ? "mt-1.5 text-[13px] font-semibold leading-4" : "mt-1.5 text-[13px] leading-4"} style={{ color: warn ? "var(--cravv-status-warning)" : SECONDARY }}>
                        {status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </Card>
          </>
        )}

        <div className="mt-[22px]">
          <PrimaryButton onClick={add}>Add to {slotLabel(slot)}</PrimaryButton>
        </div>
      </div>
    </SheetRoute>
  );
}
