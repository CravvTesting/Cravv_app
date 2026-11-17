"use client";

/*
 * R05 · Log dinner: a sheet over Today. Leftovers from Tara first, then recent foods,
 * search (R06) and quick add. "+" adds straight away: the sheet drops, R01 expands the new row.
 * (Handoff §10: Nutrition's Log may open Journal's J03; kept as designed here.)
 */
import { useState } from "react";
import { Icon, PrimaryButton, formatNumber } from "@/components/cravv";
import { go } from "@/proto/nav";
import { useProto } from "@/proto/store";
import { NutritionRootView } from "./today-root";
import {
  fmtServings,
  leftovers,
  mealFromFood,
  mealFromLeftover,
  mealQuickAdd,
  photoOf,
  portionLabel,
  recentFoods,
  relDay,
  servingsOf,
  slotLabel,
  type Meal,
} from "./today-data";
import { setTodayUI, useTodayUI } from "./today-state";
import { AddPill, Card, GroupLabel, ICON_OFF, ListItem, SECONDARY, SheetRoute, SheetTitle, Thumb, useSheetClose } from "./today-ui";

export default function R05() {
  const meals = useProto((s) => s.meals);
  const set = useProto((s) => s.set);
  const slot = useTodayUI((s) => s.slot);
  const underScroll = useTodayUI((s) => s.underScroll);
  const sheet = useSheetClose();
  const [quick, setQuick] = useState(false);
  const [kcal, setKcal] = useState("");

  const toToday = () => go("R01", { dir: "instant" });
  const dismiss = () => sheet.close(toToday);
  const add = (meal: Meal) => {
    setTodayUI({ justAdded: meal.id });
    set({ meals: [...useProto.getState().meals, meal] });
    sheet.close(toToday);
  };

  const left = leftovers(meals);
  const recent = recentFoods(meals);
  const title = `Log ${slotLabel(slot).toLowerCase()}`;
  const quickValue = Number(kcal);

  return (
    <SheetRoute
      underlay={<NutritionRootView view="today" inert />}
      underScroll={underScroll}
      label={title}
      open={sheet.open}
      onDismiss={dismiss}
      onClosed={sheet.onClosed}
      className="h-[calc(100dvh-128px)]"
    >
      <div className="flex h-full flex-col">
        <SheetTitle title={title} onClose={dismiss} />
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6">
          <button
            type="button"
            onClick={() => { setTodayUI({ query: "" }); go("R06"); }}
            className="mt-[14px] flex h-11 w-full items-center gap-2.5 rounded-[22px] bg-white/[0.08] pl-3.5 text-left active:bg-white/[0.12]"
          >
            <span style={{ color: SECONDARY }}><Icon name="search" size={20} /></span>
            <span className="text-[17px] leading-[22px]" style={{ color: "rgb(235 235 245 / 0.5)" }}>Search food</span>
          </button>

          {left.length > 0 && (
            <>
              <GroupLabel className="mt-5">Leftovers from Tara</GroupLabel>
              <Card secondary>
                {left.map(({ cook, left: n }, i) => (
                  <ListItem
                    key={cook.id}
                    separator={i > 0}
                    thumb={<Thumb photo={photoOf(cook)} />}
                    name={cook.name}
                    detail={`${relDay(cook.day)} · ${fmtServings(n)} ${n > 1 ? "servings" : "serving"} left · ${formatNumber(Math.round(cook.kcal / servingsOf(cook)))} kcal`}
                    trailing={<AddPill label={`Add ${cook.name} leftovers`} onClick={() => add(mealFromLeftover(cook, slot))} />}
                  />
                ))}
              </Card>
            </>
          )}

          {recent.length > 0 && (
            <>
              <GroupLabel className="mt-5">Recent</GroupLabel>
              <Card secondary>
                {recent.map(({ food, portion }, i) => (
                  <ListItem
                    key={food.id}
                    separator={i > 0}
                    thumb={<Thumb icon={food.icon} />}
                    name={food.name}
                    detail={`${portionLabel(food, portion)} · ${formatNumber(Math.round(food.kcal * portion))} kcal`}
                    onPress={() => { setTodayUI({ query: food.name, foodId: food.id, portion }); go("R06"); go("R07", { dir: "instant" }); }}
                    trailing={<AddPill label={`Add ${food.name}`} onClick={() => add(mealFromFood(food, portion, slot))} />}
                  />
                ))}
              </Card>
            </>
          )}

          <Card secondary className="mt-4">
            <button type="button" onClick={() => setQuick((q) => !q)} aria-expanded={quick} className="relative flex h-14 w-full items-center text-left active:bg-white/[0.04]">
              <span className="ml-4 shrink-0" style={{ color: ICON_OFF }}><Icon name="bolt" size={22} /></span>
              <span className="ml-3.5 text-[17px] leading-[22px] text-white">Quick add calories</span>
            </button>
            {quick && (
              <form
                className="flex items-center gap-3 px-4 pb-4"
                onSubmit={(e) => { e.preventDefault(); if (quickValue > 0) add(mealQuickAdd(quickValue, slot)); }}
              >
                <label className="flex h-11 min-w-0 flex-1 items-center rounded-[12px] bg-white/[0.08] px-3">
                  <span className="sr-only">Calories</span>
                  <input
                    autoFocus
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={kcal}
                    onChange={(e) => setKcal(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="0"
                    className="min-w-0 flex-1 bg-transparent text-[17px] text-white outline-none placeholder:text-white/30"
                  />
                  <span className="text-[15px]" style={{ color: SECONDARY }}>kcal</span>
                </label>
                <div className="w-[96px]">
                  <PrimaryButton type="submit" disabled={!(quickValue > 0)} className="!h-11">Add</PrimaryButton>
                </div>
              </form>
            )}
          </Card>

          <p className="mt-4 px-4 text-[13px] leading-[18px]" style={{ color: SECONDARY }}>
            Meals you cook with Tara log themselves. This is for everything else.
          </p>
        </div>
      </div>
    </SheetRoute>
  );
}
