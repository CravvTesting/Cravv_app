"use client";

/* R06 · Search food: filters the fake food list as you type. Row → R07 (sheet); "+" adds 1 unit. */
import { useEffect, useRef } from "react";
import { BackButton, Icon, formatNumber } from "@/components/cravv";
import { back, go } from "@/proto/nav";
import { useProto } from "@/proto/store";
import { mealFromFood, portionLabel, searchFoods, slotLabel } from "./today-data";
import { setTodayUI, useTodayUI } from "./today-state";
import { AddPill, Card, ListItem, SECONDARY, XGlyph } from "./today-ui";

export function SearchView({ inert = false }: { inert?: boolean }) {
  const query = useTodayUI((s) => s.query);
  const slot = useTodayUI((s) => s.slot);
  const set = useProto((s) => s.set);
  const input = useRef<HTMLInputElement>(null);
  const results = searchFoods(query);

  useEffect(() => {
    if (inert) return;
    // Focus after the push lands (focusing mid-slide makes iOS jump the page).
    const t = setTimeout(() => input.current?.focus({ preventScroll: true }), 520);
    return () => clearTimeout(t);
  }, [inert]);

  const open = (foodId: string, portion: number) => {
    input.current?.blur();
    setTodayUI({ foodId, portion });
    go("R07", { dir: "instant" });
  };

  return (
    <div className="cravv-bg relative flex h-full w-full flex-col overflow-hidden">
      <div className="relative z-10 shrink-0 px-4" style={{ paddingTop: "max(env(safe-area-inset-top), 8px)" }}>
        <div className="flex h-[52px] items-center gap-3">
          <BackButton onClick={() => back()} />
          <label className="flex h-11 min-w-0 flex-1 items-center rounded-[22px] bg-white/10 pl-3.5 pr-1.5">
            <span className="shrink-0" style={{ color: SECONDARY }}><Icon name="search" size={20} /></span>
            <span className="sr-only">Search food</span>
            <input
              ref={input}
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              value={query}
              onChange={(e) => setTodayUI({ query: e.target.value })}
              placeholder="Search food"
              className="ml-2.5 min-w-0 flex-1 bg-transparent text-[17px] text-white outline-none placeholder:text-white/50 [&::-webkit-search-cancel-button]:hidden"
              style={{ caretColor: "var(--cravv-accent-default)" }}
            />
            {query && (
              <button
                type="button"
                aria-label="Clear"
                onClick={() => { setTodayUI({ query: "" }); input.current?.focus(); }}
                className="flex size-8 shrink-0 items-center justify-center rounded-full active:opacity-50"
                style={{ color: SECONDARY }}
              >
                <XGlyph size={18} />
              </button>
            )}
          </label>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-8">
        <p className="mt-3 text-[13px] leading-4" style={{ color: SECONDARY }}>Adding to {slotLabel(slot)}</p>
        {results.length > 0 ? (
          <Card className="mt-2.5">
            {results.map((f, i) => (
              <ListItem
                key={f.id}
                separator={i > 0}
                inset={16}
                plain
                name={f.name}
                detail={`${portionLabel(f, 1)} · ${formatNumber(f.kcal)} kcal`}
                onPress={() => open(f.id, f.portion ?? 1)}
                trailing={
                  <AddPill
                    label={`Add 1 ${f.unit} of ${f.name}`}
                    onClick={() => {
                      const meal = mealFromFood(f, 1, slot);
                      setTodayUI({ justAdded: meal.id });
                      set({ meals: [...useProto.getState().meals, meal] });
                      go("R01", { dir: "pop" });
                    }}
                  />
                }
              />
            ))}
          </Card>
        ) : (
          <p className="mt-6 text-center text-[15px] leading-5" style={{ color: SECONDARY }}>No matches for “{query.trim()}”.</p>
        )}
        <p className="mt-3.5 px-4 text-[13px] leading-[18px]" style={{ color: SECONDARY }}>
          Estimates from USDA FoodData Central. Recipes you cook with Tara are exact.
        </p>
      </div>
    </div>
  );
}

export default function R06() {
  return <SearchView />;
}
