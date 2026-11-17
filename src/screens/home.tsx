"use client";

/*
 * Home tab (Figma "Home v2" 2568:4136, full scroll 2568:3979).
 * Greeting + "What's cooking?", Tara status pill, search, meal chips, quick actions,
 * "For tonight" rail, "Your recipes" rail (family first), Collections grid, Under 30 minutes.
 * The shell draws the floating tab bar over this screen; content pads below it.
 * Nothing navigates yet except "Set up" on the Tara pill (→ 07a).
 */
import { useEffect, useRef, useState } from "react";
import { go } from "@/proto/nav";
import { useProto } from "@/proto/store";
import { TAB_BAR_SPACE } from "@/proto/ui";
import { COLLECTIONS, QUICK, TONIGHT, YOUR_RECIPES, greetingFor, mealFor, type Meal } from "./home/data";
import {
  CollectionTile,
  MealChips,
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

const TOAST_MS = 2000;

export default function Home() {
  const name = useProto((st) => st.name);
  const setupPending = useProto((st) => st.setupPending);
  const slow = useProto((st) => st.debug.slowAnimations);

  const [hour] = useState(() => new Date().getHours());
  const [meal, setMeal] = useState<Meal>(() => mealFor(hour));
  const [toast, setToast] = useState(0); // 0 = hidden; otherwise a key so repeat taps restart it
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const cook = () => {
    clearTimeout(timer.current);
    setToast((k) => k + 1);
    timer.current = setTimeout(() => setToast(0), TOAST_MS * (slow ? 5 : 1));
  };

  const greeting = greetingFor(hour) + (name ? `, ${name}` : "");

  return (
    <div className="cravv-bg relative h-full w-full overflow-hidden">
      <div
        className="h-full overflow-y-auto overflow-x-hidden overscroll-contain"
        data-home-scroll
        style={{
          paddingTop: "calc(max(env(safe-area-inset-top), 16px) + 4px)",
          paddingBottom: `calc(${TAB_BAR_SPACE} + 24px)`,
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

        <div className="mt-3">
          <MealChips value={meal} onChange={setMeal} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 px-5">
          <QuickAction icon="/img/home/eye.svg" title="Watch" hint="Whistles, boil-overs" />
          <QuickAction icon="/img/home/book.svg" title="My recipes" hint="26 saved · 2 family" />
        </div>

        <section className="mt-6" aria-label="For tonight">
          <SectionHeader title="For tonight" action="See all" />
          <div className="mt-3.5">
            <Rail label="For tonight">
              {TONIGHT.map((r) => <TonightCard key={r.id} recipe={r} onCook={cook} />)}
            </Rail>
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

      {/* Scroll fade behind the tab bar (Figma 2568:4269) */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0"
        style={{
          height: `calc(${TAB_BAR_SPACE} + 72px)`,
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--cravv-gray-1000) 0%, transparent) 0%, color-mix(in srgb, var(--cravv-gray-1000) 95%, transparent) 60%, var(--cravv-gray-1000) 100%)",
        }}
        aria-hidden
      />

      {toast > 0 && <Toast key={toast} text="Sent to Tara" bottom={`calc(${TAB_BAR_SPACE} + 12px)`} />}
    </div>
  );
}
