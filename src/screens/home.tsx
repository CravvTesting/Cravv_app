"use client";

/*
 * Home tab (Figma "Home v2" 2568:4136; meal filter row 2665:16508, filters on F04 2681:6517).
 * Greeting + "What's cooking?", Tara status pill, search, meal filter row, quick actions,
 * "For tonight" rail (filtered by meal + store.homeFilters), "Your recipes", Collections, Under 30 minutes.
 * The shell draws the floating tab bar, scroll fade and mini bar over this screen; content pads below them.
 * Meal: single choice, default by local time (or debug "Home · time of day"); tapping the selected chip
 * clears it ("Recipes for you", every meal). Filter button → F01/F02/F03 sheet.
 */
import { useEffect, useRef, useState } from "react";
import { MealFilterRow, mealForHour, type MealId } from "@/components/cravv";
import { go } from "@/proto/nav";
import { useProto } from "@/proto/store";
import { MINI_BAR_SPACE, TAB_BAR_SPACE } from "@/proto/ui";
import { COLLECTIONS, QUICK, YOUR_RECIPES, greetingFor } from "./home/data";
import { filtersScreen } from "./home/Filters";
import { filterCount, filterRecipes, recipeMeta } from "./home/recipes";
import {
  CollectionTile,
  CrossFade,
  EmptyRail,
  QuickAction,
  QuickList,
  Rail,
  RecipeTile,
  SearchField,
  SectionHeader,
  TaraPill,
  Toast,
  TonightCard,
} from "./home/parts";

type TimeOfDay = "auto" | MealId;
type MealPick = { forced: TimeOfDay; meal: MealId | null };
/** The pick survives Home remounting (tab switches) until the debug time of day changes. */
let lastPick: MealPick | null = null;
const pickFor = (forced: TimeOfDay): MealPick => ({ forced, meal: forced === "auto" ? mealForHour(new Date().getHours()) : forced });

const SECTION_TITLE: Record<MealId, string> = { breakfast: "For breakfast", lunch: "For lunch", dinner: "For tonight" };
const RAIL_MAX = 8;

const TOAST_MS = 2000;

export default function Home() {
  const name = useProto((st) => st.name);
  const setupPending = useProto((st) => st.setupPending);
  const slow = useProto((st) => st.debug.slowAnimations);
  const live = useProto((st) => st.live);
  const timeOfDay = useProto((st) => st.debug.timeOfDay);
  const filters = useProto((st) => st.homeFilters);
  const diet = useProto((st) => st.diet);

  const [hour] = useState(() => new Date().getHours());
  const [pick, setPick] = useState<MealPick>(() => (lastPick && lastPick.forced === timeOfDay ? lastPick : pickFor(timeOfDay)));
  if (pick.forced !== timeOfDay) setPick(pickFor(timeOfDay));
  useEffect(() => { lastPick = pick; }, [pick]);
  const meal = pick.meal;
  const [toast, setToast] = useState(0); // 0 = hidden; otherwise a key so repeat taps restart it
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const cook = () => {
    clearTimeout(timer.current);
    setToast((k) => k + 1);
    timer.current = setTimeout(() => setToast(0), TOAST_MS * (slow ? 5 : 1));
  };

  const greeting = greetingFor(hour) + (name ? `, ${name}` : "");
  const active = filterCount(filters);
  const found = filterRecipes(filters, diet, meal);
  const cards = found.slice(0, RAIL_MAX).map((r) => ({ id: r.id, title: r.title, meta: recipeMeta(r), img: r.img }));
  const title = meal ? SECTION_TITLE[meal] : "Recipes for you";
  const openFilters = () => go(filtersScreen(filters, diet));
  const bottom = `calc(${TAB_BAR_SPACE} + ${live ? MINI_BAR_SPACE : "0px"}`;

  return (
    <div className="cravv-bg relative h-full w-full overflow-hidden">
      <div
        className="h-full overflow-y-auto overflow-x-hidden overscroll-contain"
        data-home-scroll
        style={{
          paddingTop: "calc(max(env(safe-area-inset-top), 16px) + 4px)",
          paddingBottom: `${bottom} + 24px)`,
        }}
      >
        {/* Greeting + Tara */}
        <header className="flex items-start justify-between gap-3 px-5">
          <div className="min-w-0">
            <p className="truncate text-[15px] leading-[18px] text-secondary">{greeting}</p>
            <h1 className="mt-0.5 whitespace-nowrap text-[min(30px,7.6vw)] font-bold leading-9 text-white">What’s cooking?</h1>
          </div>
          <div className="mt-1">
            <TaraPill pending={setupPending} onSetUp={() => go("07a")} />
          </div>
        </header>

        <div className="mt-3.5 px-5">
          <SearchField />
        </div>

        <div className="mt-3 px-5">
          <MealFilterRow
            selected={meal}
            onSelect={(m) => setPick({ forced: timeOfDay, meal: m })}
            filterCount={active}
            onFilters={openFilters}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 px-5">
          <QuickAction icon="/img/home/eye.svg" title="Watch" hint="Whistles, boil-overs" />
          <QuickAction icon="/img/home/book.svg" title="My recipes" hint="26 saved · 2 family" />
        </div>

        <section className="mt-6" aria-label={title}>
          <SectionHeader
            title={title}
            action={active ? `${found.length} ${found.length === 1 ? "recipe" : "recipes"}` : "See all"}
            muted={active > 0}
          />
          <div className="mt-3.5">
            <CrossFade k={`${meal ?? "all"}|${JSON.stringify(filters)}`}>
              {cards.length ? (
                <Rail label={title}>
                  {cards.map((r) => <TonightCard key={r.id} recipe={r} onCook={cook} />)}
                </Rail>
              ) : (
                <EmptyRail
                  text={meal ? `No ${meal} recipes match your filters.` : "No recipes match your filters."}
                  action="Edit Filters"
                  onAction={openFilters}
                />
              )}
            </CrossFade>
          </div>
        </section>

        <section className="mt-6" aria-label="Your recipes">
          <SectionHeader title="Your recipes" action="See all 26" />
          <div className="mt-3.5">
            <Rail label="Your recipes">
              {YOUR_RECIPES.map((r) => <RecipeTile key={r.id} recipe={r} />)}
            </Rail>
          </div>
        </section>

        <section className="mt-8" aria-label="Collections">
          <SectionHeader title="Collections" />
          <div className="mt-3.5 grid grid-cols-2 gap-3 px-5">
            {COLLECTIONS.map((c) => <CollectionTile key={c.id} {...c} />)}
          </div>
        </section>

        <section className="mt-[30px]" aria-label="Under 30 minutes">
          <SectionHeader title="Under 30 minutes" action="See all" />
          <div className="mt-3 px-5">
            <QuickList items={QUICK} />
          </div>
        </section>
      </div>

      {toast > 0 && <Toast key={toast} text="Sent to Tara" bottom={`${bottom} + 12px)`} />}
    </div>
  );
}
