"use client";

/*
 * R04 · Meal detail (frame: Thai Green Curry). Opened from a meal row on R01.
 * The servings stepper writes the meal back to the store, so kcal (and R01 / Journal) update
 * live; for a Tara cook the rest stays as leftovers (R05 offers them).
 */
import { BackButton, Icon, NUTRIENTS, StatusPill, TipNote, cx, formatNumber, type NutrientId } from "@/components/cravv";
import { back } from "@/proto/nav";
import { useProto } from "@/proto/store";
import {
  LIMITS,
  TODAY,
  fmtServings,
  foodByName,
  leftoverServings,
  mealsOn,
  photoOf,
  relDay,
  servingsOf,
  slotLabel,
  type Meal,
} from "./today-data";
import { useTodayUI } from "./today-state";
import { Card, Hairline, ICON_OFF, MacroStats, SECONDARY, Stepper } from "./today-ui";

const DEFAULT_ID = "m-tue-l"; // Thai Green Curry (deep link)

export default function R04() {
  const meals = useProto((s) => s.meals);
  const watching = useProto((s) => s.watching);
  const set = useProto((s) => s.set);
  const mealId = useTodayUI((s) => s.mealId);
  const meal = meals.find((x) => x.id === (mealId ?? DEFAULT_ID)) ?? mealsOn(meals, TODAY).find((x) => x.source === "tara");

  if (!meal) {
    return (
      <div className="cravv-bg relative flex h-full w-full flex-col px-5" style={{ paddingTop: "max(env(safe-area-inset-top), 8px)" }}>
        <div className="flex h-[52px] items-center"><BackButton onClick={() => back()} /></div>
        <p className="mt-6 text-[17px] text-secondary">This meal was removed.</p>
      </div>
    );
  }

  const s = servingsOf(meal);
  const cook = meal.source === "tara";
  const made = meal.made ?? 0;
  const left = cook ? leftoverServings(meals, meal) : 0;
  const perKcal = meal.kcal / s;
  const food = foodByName(meal.name);
  const step = 0.5;
  const max = cook && made ? s + left : 6;

  const setServings = (n: number) => {
    const next = Math.max(step, Math.min(max, Math.round(n * 2) / 2));
    if (next === s) return;
    const patch: Partial<Meal> = { servings: next, kcal: Math.round(perKcal * next) };
    if (food && !cook) patch.note = `${fmtServings(next)} ${next === 1 ? food.unit : food.units}`;
    set({ meals: meals.map((x) => (x.id === meal.id ? { ...x, ...patch } : x)) });
  };
  const remove = () => {
    set({ meals: meals.filter((x) => x.id !== meal.id) });
    back();
  };

  const per = (v?: number) => Math.round((v ?? 0) * s);
  const rows: { id: NutrientId; value: number; unit: string; note: string }[] = [
    { id: "fiber", value: per(meal.fiber), unit: "g", note: `${Math.round((per(meal.fiber) / LIMITS.fiber) * 100)}% of your target` },
    { id: "sodium", value: per(meal.sodium), unit: "mg", note: `${Math.round((per(meal.sodium) / LIMITS.sodium) * 100)}% of today’s limit` },
    { id: "added-sugar", value: per(meal.sugar), unit: "g", note: per(meal.sugar) <= LIMITS["added-sugar"] ? "Under 10 g for a meal" : "Over 10 g for a meal" },
    { id: "saturated-fat", value: per(meal.satFat), unit: "g", note: `${Math.round((per(meal.satFat) / LIMITS["saturated-fat"]) * 100)}% of today’s limit` },
  ];
  const unitLabel = cook ? `${fmtServings(s)} of ${fmtServings(s + left)} ${s + left > 1 ? "servings" : "serving"}` : food ? `${fmtServings(s)} ${s === 1 ? food.unit : food.units}` : `${fmtServings(s)} ${s === 1 ? "serving" : "servings"}`;
  const subLabel = cook ? (left > 0 ? `${fmtServings(left)} ${left > 1 ? "servings" : "serving"} left over` : "None left over") : `${formatNumber(Math.round(food?.kcal ?? perKcal))} kcal ${food ? `a ${food.unit}` : "a serving"}`;
  const photo = photoOf(meal);
  const how = cook ? "Cooked with Tara" : meal.source === "leftovers" ? "Leftovers" : meal.source === "photo" ? "Photo log" : "Logged";
  const when = meal.day === TODAY ? meal.time : `${relDay(meal.day)}${meal.time ? ` · ${meal.time}` : ""}`;

  return (
    <div className="cravv-bg relative h-full w-full overflow-hidden">
      <div className="absolute left-4 z-20" style={{ top: "max(env(safe-area-inset-top), 8px)" }}>
        <div className="flex h-[52px] items-center"><BackButton onClick={() => back()} /></div>
      </div>
      <div className="h-full overflow-y-auto overscroll-contain" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 24px)" }}>
        <div className="relative h-[300px] w-full">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" className="absolute inset-0 size-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: "var(--cravv-surface-raised)", color: ICON_OFF }}>
              <Icon name={food?.icon ?? "bowl"} size={64} />
            </div>
          )}
          <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(28,28,31,0) 45%, var(--cravv-gray-900) 100%)" }} />
          <h1 className="absolute bottom-0 left-5 right-5 translate-y-[4px] text-[28px] font-bold leading-[34px] text-white">{meal.name}</h1>
        </div>
        <div className="px-5">
          <p className="mt-1.5 text-[15px] leading-5" style={{ color: SECONDARY }}>
            {slotLabel(meal.slot)} · {how}{when ? ` · ${when}` : ""}
          </p>
          {cook ? (
            <StatusPill tone="success" className="mt-2.5">Exact · from Tara’s recipe</StatusPill>
          ) : (
            <p className="mt-2 text-[13px] leading-4" style={{ color: SECONDARY }}>Estimate · USDA FoodData Central</p>
          )}

          <Card className="mt-4 flex h-[72px] items-center justify-between pl-4 pr-4">
            <div className="flex min-w-0 flex-col">
              <span className="text-[16px] font-semibold leading-[19px] text-white">You ate</span>
              <span className="mt-[3px] truncate text-[12px] leading-[14px]" style={{ color: SECONDARY }}>{subLabel}</span>
            </div>
            <Stepper
              name="servings"
              label={unitLabel}
              onMinus={() => setServings(s - step)}
              onPlus={() => setServings(s + step)}
              canMinus={s > step}
              canPlus={s < max}
            />
          </Card>

          <Card className="mt-3 pb-1 pt-4">
            <MacroStats kcal={meal.kcal} protein={per(meal.protein)} carbs={per(meal.carbs)} fat={per(meal.fat)} />
            <div className="relative mt-4">
              {rows.map((r, i) => {
                const n = NUTRIENTS.find((x) => x.id === r.id)!;
                const on = watching.includes(r.id as never);
                return (
                  <div key={r.id} className="relative flex h-[60px] items-center">
                    <Hairline inset={i === 0 ? 16 : 52} right={i === 0 ? 16 : 16} />
                    <span className="ml-4 shrink-0" style={{ color: on ? `var(--cravv-option-nutrient-${r.id}-base)` : ICON_OFF }}>
                      <Icon name={n.icon} size={22} />
                    </span>
                    <span className="ml-3.5 flex min-w-0 flex-1 flex-col">
                      <span className="text-[16px] leading-[19px] text-white">{n.label}</span>
                      <span className="mt-[3px] truncate text-[12px] leading-[14px]" style={{ color: SECONDARY }}>{r.note}</span>
                    </span>
                    <span className={cx("mr-4 ml-3 shrink-0 text-[16px] font-semibold leading-[19px] tabular-nums text-white")}>
                      {formatNumber(r.value)} {r.unit}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {meal.name === "Thai Green Curry" && cook && (
            <TipNote className="mt-3">Next time, Tara can use light coconut milk: about 9 g less saturated fat. It’ll ask before you start.</TipNote>
          )}

          <button
            type="button"
            onClick={remove}
            className="mx-auto mt-3 flex h-11 items-center px-4 text-[15px] font-semibold active:opacity-60"
            style={{ color: "var(--cravv-status-alert)" }}
          >
            Remove from {meal.day === TODAY ? "Today" : relDay(meal.day)}
          </button>
        </div>
      </div>
    </div>
  );
}
