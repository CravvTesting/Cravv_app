"use client";

/*
 * Home filter sheet (handoff §11, section Home · Filters 2680:6400). One overlay over "home" for
 * F01 (nothing picked), F02 (picked, live count) and F03 (0 matches). The id follows the filters with
 * go(id, { replace: true, dir: "none" }); the shell keys overlays by group, so the sheet stays put.
 * Filters write straight to store.homeFilters, so Home (F04) and the debug menu agree.
 */
import { useEffect, useRef, type PointerEvent } from "react";
import { ALLERGIES, Chip, cx, COURSES, CUISINES, DIETS, MORE, PrimaryButton, SegmentedControl } from "@/components/cravv";
import { back, go } from "@/proto/nav";
import { useProto, type ScreenId } from "@/proto/store";
import { Sheet } from "@/proto/ui";
import {
  bestRemoval,
  filterCount,
  filterRecipes,
  NO_FILTERS,
  NO_MATCH_FILTERS,
  SOME_FILTERS,
  TIME_OPTIONS,
  type HomeFilters,
} from "./recipes";
import s from "./home.module.css";

/** Which sheet state the filters call for (also used by Home's filter button). */
export function filtersScreen(f: HomeFilters, diet: readonly string[]): ScreenId {
  if (filterCount(f) === 0) return "F01";
  return filterRecipes(f, diet).length === 0 ? "F03" : "F02";
}

/** "Vegetarian · no peanuts, from Profile" */
export function dietLine(diet: readonly string[], allergies: readonly string[]) {
  const d = diet.filter((x) => x !== "everything").map((x) => DIETS.find((o) => o.id === x)?.label ?? x);
  const a = allergies.map((x) => ALLERGIES.find((o) => o.id === x)?.label.toLowerCase() ?? x);
  const parts = [d.join(", "), a.length ? `no ${a.join(", ")}` : ""].filter(Boolean);
  return parts.length ? `${parts.join(" · ")}, from Profile` : "No diet set in Profile";
}

const GROUPS = [
  { key: "course", label: "Course", options: COURSES },
  { key: "cuisine", label: "Cuisine", options: CUISINES },
  { key: "more", label: "More", options: MORE },
] as const;

export default function Filters({ id }: { id: ScreenId }) {
  const f = useProto((s) => s.homeFilters);
  const diet = useProto((s) => s.diet);
  const allergies = useProto((s) => s.allergies);
  const set = useProto((s) => s.set);

  const picked = filterCount(f);
  const count = filterRecipes(f, diet).length;
  const want = filtersScreen(f, diet);
  const fix = useRef(false);

  useEffect(() => {
    // Deep links / Jump to screen: give F02 and F03 the persona data they show in the frames.
    if (!fix.current) {
      fix.current = true;
      if (id === "F02" && want !== "F02") return set({ homeFilters: SOME_FILTERS });
      if (id === "F03" && want !== "F03") return set({ homeFilters: NO_MATCH_FILTERS });
    }
    if (want !== id) go(want, { replace: true, dir: "none" });
  }, [id, want, set]);

  const update = (next: HomeFilters) => set({ homeFilters: next });
  const toggle = (key: "course" | "cuisine" | "more", value: string) => {
    const list = f[key];
    update({ ...f, [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] });
  };
  const fixHint = count === 0 && picked > 0 ? bestRemoval(f, diet) : null;

  // The list scrolls on short phones; keep its drags from moving the sheet.
  const stopIfScrollable = (e: PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight > el.clientHeight + 1) e.stopPropagation();
  };

  return (
    // Above the shell's tab bar (F01–F03 are tab-root ids, so TabChrome stays drawn under the sheet).
    <div className="absolute inset-0 z-[75]">
      <Sheet onDismiss={() => back()} label="Filters">
        <div className="relative flex flex-col" style={{ maxHeight: "calc(100dvh - max(env(safe-area-inset-top), 20px) - 60px)" }}>
          <div aria-hidden className="absolute left-1/2 top-1.5 h-[5px] w-9 -translate-x-1/2 rounded-[2.5px] bg-white/30" />
  
          <header className="shrink-0 px-5 pt-7">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-[22px] font-bold leading-[26px] text-white">Filters</h2>
              <button
                type="button"
                onClick={() => update(NO_FILTERS)}
                disabled={picked === 0}
                className="-my-2.5 -mr-2 px-2 py-2.5 text-[17px] leading-5 text-accent transition-opacity duration-200 active:opacity-55 disabled:opacity-40"
                style={{ marginTop: "-7px" }}
              >
                Clear
              </button>
            </div>
            <p className="mt-1 text-[13px] leading-4 text-secondary">{dietLine(diet, allergies)}</p>
          </header>
  
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4 pt-[26px]" style={{ touchAction: "pan-y" }} onPointerDown={stopIfScrollable}>
            <section aria-label="Time">
              <h3 className="text-[15px] font-semibold leading-[18px] text-secondary">Time</h3>
              <SegmentedControl
                className="mt-2.5"
                variant="pill"
                label="Time"
                options={TIME_OPTIONS}
                value={f.time}
                onChange={(time) => update({ ...f, time })}
              />
            </section>
  
            {GROUPS.map((g) => (
              <section key={g.key} aria-label={g.label} className="mt-6">
                <h3 className="text-[15px] font-semibold leading-[18px] text-secondary">{g.label}</h3>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {g.options.map((o) => {
                    const on = (f[g.key] as string[]).includes(o.id);
                    return (
                      <Chip
                        key={o.id}
                        variant="filter"
                        label={o.label}
                        icon={o.icon}
                        token={o.token}
                        state={on ? "on" : "off"}
                        onClick={() => toggle(g.key, o.id)}
                      />
                    );
                  })}
                </div>
              </section>
            ))}
  
            {count === 0 && picked > 0 && (
              <div className={cx(s.noteIn, "mt-4 rounded-[14px] bg-raised px-3.5 py-3")} role="status">
                <p className="text-[15px] font-semibold leading-[18px] text-white">Nothing fits all of these.</p>
                {fixHint ? (
                  <button
                    type="button"
                    onClick={() => update(fixHint.next)}
                    className="-mx-1 mt-1 px-1 text-left text-[15px] leading-[18px] text-accent active:opacity-55"
                  >
                    Remove {fixHint.label} ({fixHint.count} {fixHint.count === 1 ? "recipe" : "recipes"})
                  </button>
                ) : (
                  <button type="button" onClick={() => update(NO_FILTERS)} className="mt-1 text-left text-[15px] leading-[18px] text-accent active:opacity-55">
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
  
          <div aria-hidden className="h-px shrink-0 bg-white/[0.12]" style={{ transform: "scaleY(0.5)" }} />
          <div className="shrink-0 px-5 pt-4">
            {count === 0 ? (
              <PrimaryButton disabled className="disabled:opacity-100" style={{ background: "rgb(255 255 255 / 0.12)", color: "rgb(255 255 255 / 0.4)" }}>
                No Matches
              </PrimaryButton>
            ) : (
              <PrimaryButton onClick={() => back()}>
                Show {count} {count === 1 ? "Recipe" : "Recipes"}
              </PrimaryButton>
            )}
          </div>
        </div>
      </Sheet>
    </div>
  );
}
