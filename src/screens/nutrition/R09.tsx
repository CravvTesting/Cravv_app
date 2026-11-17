"use client";

/* R09 · Sodium detail: 7-day bars against the limit, top sources this week, a lighter-version suggestion. */
import { useEffect, useState } from "react";
import { TipNote, formatNumber } from "@/components/cravv";
import { useMotionTokens } from "@/proto/motion";
import { useProto } from "@/proto/store";
import { LargeTitleScreen } from "@/proto/ui";
import { LIMITS, TODAY, foodByName, isCook, lastDays, mealsOn, photoOf, servingsOf, totalsOf, weekdayLetter, weekdayName } from "./today-data";
import { Card, GroupLabel, ListItem, SECONDARY, Thumb } from "./today-ui";

const PX_PER_MG = 79.733 / 2300; // frame: the limit line sits 80px above the baseline

export default function R09() {
  const meals = useProto((s) => s.meals);
  const m = useMotionTokens();
  const [shown, setShown] = useState(m.reduced);
  const [lighter, setLighter] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
    return () => cancelAnimationFrame(id);
  }, []);

  const limit = LIMITS.sodium;
  const days = lastDays(7).map((d) => ({ day: d, mg: totalsOf(mealsOn(meals, d)).sodium }));
  const full = days.filter((d) => d.day !== TODAY);
  const avg = Math.round(full.reduce((s, d) => s + d.mg, 0) / full.length);
  const overDays = full.filter((d) => d.mg > limit).length;
  const k = Math.min(PX_PER_MG, 110 / Math.max(limit * 1.3, ...days.map((d) => d.mg)));

  const sources = full
    .flatMap((d) => mealsOn(meals, d.day))
    .map((x) => ({ meal: x, mg: Math.round((x.sodium ?? 0) * servingsOf(x)) }))
    .sort((a, b) => b.mg - a.mg)
    .slice(0, 3);
  const tipCook = sources.find((s) => isCook(s.meal))?.meal;

  return (
    <LargeTitleScreen title="Sodium" back subtitle={`Last 7 days · limit ${formatNumber(limit)} mg a day`}>
      <div className="relative h-[236px] rounded-[24px] px-4" style={{ background: "var(--cravv-surface-raised)" }}>
        <p className="pt-4 text-[11px] font-semibold uppercase leading-[13px]" style={{ color: SECONDARY }}>Daily average</p>
        <p className="mt-[3px] flex items-baseline gap-3">
          <span className="text-[34px] font-bold leading-[41px] tabular-nums text-white">{formatNumber(avg)}</span>
          <span
            className={overDays ? "text-[13px] font-semibold leading-4" : "text-[13px] leading-4"}
            style={{ color: overDays ? "var(--cravv-status-warning)" : SECONDARY }}
          >
            mg · {overDays ? `over on ${overDays} of ${full.length} days` : "under the limit every day"}
          </span>
        </p>
        <div className="absolute inset-x-4 bottom-9 top-[96px]">
          <div aria-hidden className="absolute inset-x-0 h-px bg-white/45" style={{ bottom: limit * k }} />
          <span className="absolute right-0 text-[10px] leading-3" style={{ bottom: limit * k + 4, color: SECONDARY }}>{formatNumber(limit)}</span>
          <div className="absolute inset-0 flex items-end justify-between px-[10px]">
            {days.map((d, i) => {
              const today = d.day === TODAY;
              const over = d.mg > limit;
              const color = today
                ? "color-mix(in srgb, var(--cravv-option-nutrient-sodium-base) 35%, transparent)"
                : over ? "var(--cravv-status-warning)" : "var(--cravv-option-nutrient-sodium-base)";
              return (
                <div
                  key={d.day}
                  title={`${formatNumber(d.mg)} mg`}
                  className="w-[22px] origin-bottom rounded-[6px]"
                  style={{
                    height: Math.max(4, d.mg * k),
                    background: color,
                    transform: shown ? "scaleY(1)" : "scaleY(0)",
                    transition: m.reduced ? "none" : `transform ${0.6 * m.scale}s var(--ease-ios) ${i * 0.04 * m.scale}s`,
                  }}
                />
              );
            })}
          </div>
        </div>
        <div className="absolute inset-x-4 bottom-0 flex h-9 justify-between px-[10px]">
          {days.map((d) => (
            <span key={d.day} className="mt-2 w-[22px] text-center text-[11px] leading-[13px]" style={{ color: SECONDARY }}>{weekdayLetter(d.day)}</span>
          ))}
        </div>
      </div>

      {sources.length > 0 && (
        <>
          <GroupLabel className="mt-5">Top sources this week</GroupLabel>
          <Card>
            {sources.map(({ meal, mg }, i) => (
              <ListItem
                key={meal.id}
                separator={i > 0}
                thumb={<Thumb photo={isCook(meal) || meal.source === "leftovers" ? photoOf(meal) : undefined} icon={foodByName(meal.name)?.icon ?? "bowl"} />}
                name={meal.name}
                detail={`${weekdayName(meal.day)} · ${isCook(meal) ? "cooked with Tara" : meal.source === "leftovers" ? "leftovers" : "logged"}`}
                trailing={<span className="text-[15px] font-semibold leading-[18px] tabular-nums text-white">{formatNumber(mg)} mg</span>}
              />
            ))}
          </Card>
        </>
      )}

      {tipCook && (
        <TipNote
          className="mt-3"
          action={
            <button
              type="button"
              onClick={() => setLighter((v) => !v)}
              aria-pressed={lighter}
              className="mt-2.5 flex h-8 items-center rounded-[16px] bg-white/[0.12] px-[18px] text-[14px] font-semibold text-white transition-transform active:scale-95"
            >
              {lighter ? "On · Undo" : "Turn On"}
            </button>
          }
        >
          {lighter
            ? `Done. Tara will suggest a third less salt next time you cook ${tipCook.name}.`
            : `Tara can use a third less salt in ${tipCook.name} next time. It’ll ask before you start.`}
        </TipNote>
      )}
    </LargeTitleScreen>
  );
}
