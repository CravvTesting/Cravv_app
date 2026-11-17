"use client";

/*
 * N06 · Nutrition · ready, no cooks (2604:4274). The empty Today after setup.
 * Sets nutritionSetup = true on arrival. "Find a Recipe" → R01 in place (cross-fade);
 * "Your targets" → R08.
 */
import { useEffect } from "react";
import { TargetsRow, formatNumber } from "@/components/cravv";
import { go } from "@/proto/nav";
import { useProto } from "@/proto/store";
import { LargeTitleScreen } from "@/proto/ui";
import { PanGlyph } from "./setup/parts";
import { SODIUM_LIMIT } from "./setup/calc";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[12px] leading-4 text-secondary">{label}</p>
      <p className="truncate text-[15px] font-semibold leading-5 text-white">{value}</p>
      <span aria-hidden className="mt-[3px] block h-1 rounded-[2px] bg-white/10" />
    </div>
  );
}

export default function N06() {
  const targets = useProto((s) => s.targets);
  const set = useProto((s) => s.set);
  const fiber = Math.round((targets.kcal / 1000) * 14);

  useEffect(() => {
    set({ nutritionSetup: true });
  }, [set]);

  return (
    <LargeTitleScreen tabRoot title="Nutrition" subtitle="From what you cook with Tara.">
      {/* This week · empty */}
      <section aria-label="This week" className="-mt-1 rounded-[20px] bg-raised px-4 pb-3.5 pt-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold leading-[13px] text-secondary">THIS WEEK</p>
            <p className="mt-0.5 flex items-baseline gap-1">
              <span className="text-[44px] font-bold leading-[52px] text-white">0</span>
              <span className="text-[17px] text-secondary">cooks</span>
            </p>
          </div>
          <div aria-hidden className="mr-0.5 mt-1.5 flex gap-2.5">
            {DAYS.map((d, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="h-[52px] w-3 rounded-[6px] bg-white/[0.08]" />
                <span className="mt-1.5 text-[10px] leading-3 text-white/50">{d}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative mt-3 grid grid-cols-2 gap-x-4 gap-y-3 pt-3">
          <span aria-hidden className="absolute inset-x-0 top-0 h-px scale-y-50 bg-white/[0.12]" />
          <Stat label="Calories" value={`0 / ${formatNumber(targets.kcal)}`} />
          <Stat label="Protein" value={`0 / ${targets.protein} g`} />
          <Stat label="Fiber" value={`0 / ${fiber} g`} />
          <Stat label="Sodium" value={`0 / ${formatNumber(SODIUM_LIMIT)} mg`} />
        </div>
      </section>

      {/* Empty state */}
      <section className="mt-4 rounded-[20px] bg-raised p-4 pt-[18px]">
        <div className="flex items-start">
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-[12px]"
            style={{ background: "color-mix(in srgb, var(--cravv-orange-500) 16%, transparent)", color: "var(--cravv-orange-500)" }}
          >
            <PanGlyph />
          </span>
          <div className="ml-4 min-w-0 pt-0.5">
            <p className="text-[17px] font-semibold leading-[22px] text-white">Your first cook fills this in</p>
            <p className="mt-0.5 text-[14px] leading-[19px] text-secondary">Cook any recipe with Tara and its nutrition logs here on its own.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => go("R01", { dir: "none" })}
          className="mt-[22px] h-11 w-full rounded-[12px] bg-white/[0.08] text-[17px] text-white/85 transition-opacity active:opacity-60"
        >
          Find a Recipe
        </button>
      </section>

      <TargetsRow className="mt-[18px]" value={`${formatNumber(targets.kcal)} kcal`} onPress={() => go("R08")} />
    </LargeTitleScreen>
  );
}
