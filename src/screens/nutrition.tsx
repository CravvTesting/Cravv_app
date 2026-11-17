"use client";

/*
 * Nutrition tab (Figma 2568:4293). "This week" card: 4 cooks, M–S day bars, Protein / Fiber /
 * Calories with coloured progress lines; "By meal" list; "Your targets" row.
 * Bars and fills grow in once per session with CSS keyframes (transform only). Rows press but
 * don't navigate.
 */
import { useEffect, useState, type CSSProperties } from "react";
import s from "./tabs/tabs.module.css";
import { Glyph, Group, INK, MealRow, Row, Chevron, Section, TabScreen, Thumb, SEPARATOR } from "./tabs/ui";

/** Cooked bar height per day, out of the 58px track (0 = didn't cook). */
const DAYS = [
  { d: "M", h: 38 },
  { d: "T", h: 0 },
  { d: "W", h: 30 },
  { d: "T", h: 0 },
  { d: "F", h: 44 },
  { d: "S", h: 26 },
  { d: "S", h: 0 },
];
const TRACK_H = 58;

const STATS = [
  { label: "Protein", value: "52 g", pct: 0.74, color: "var(--cravv-green-500)" },
  { label: "Fiber", value: "24 g", pct: 0.8, color: "var(--cravv-amber-500)" },
  { label: "Calories", value: "1,640", pct: 0.82, color: "var(--cravv-orange-500)" },
];

const MEALS = [
  { img: "rajma", title: "Rajma Chawal", sub: "Mon · 520 kcal · 18 g protein" },
  { img: "tacos", title: "Black Bean Tacos", sub: "Wed · 460 kcal · 16 g protein" },
  { img: "spaghetti", title: "Spaghetti Pomodoro", sub: "Fri · 610 kcal · 19 g protein" },
];

// The grow-in plays the first time the tab is shown in a session, not on every tab switch.
let introPlayed = false;

export default function Nutrition() {
  const [intro] = useState(() => !introPlayed);
  useEffect(() => { introPlayed = true; }, []);

  return (
    <TabScreen title="Nutrition">
      <p className="mt-[5px] text-[15px] leading-[18px] text-secondary">From what you cooked with Tara this week.</p>

      {/* This week */}
      <section aria-label="This week" className="mt-[18px] rounded-[26px] bg-raised px-4 pb-[14px] pt-4">
        <div className="flex h-[102px] items-start justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold leading-[13px]" style={{ color: INK.muted45 }}>THIS WEEK</p>
            <p className="mt-[2px] flex items-baseline gap-1">
              <span className="text-[44px] font-bold leading-[52px] text-white">4</span>
              <span className="text-[15px] leading-[18px]" style={{ color: INK.muted70 }}>cooks</span>
            </p>
          </div>
          <div className="-mr-1 mt-[14px] flex gap-[10px]" role="img" aria-label="Cooked on Monday, Wednesday, Friday and Saturday">
            {DAYS.map((day, i) => (
              <div key={i} className="flex w-3 flex-col items-center">
                <div className="relative w-3 overflow-hidden rounded-[6px] bg-white/[0.08]" style={{ height: TRACK_H }}>
                  {day.h > 0 && (
                    <div
                      className={`absolute inset-x-0 bottom-0 rounded-[6px] bg-white/85 ${intro ? s.barIn : ""}`}
                      style={{ height: day.h, "--i": i } as CSSProperties}
                    />
                  )}
                </div>
                <span className="mt-[6px] text-[10px] leading-[12px]" style={{ color: INK.muted50 }}>{day.d}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="h-px scale-y-50" style={{ background: SEPARATOR }} aria-hidden />
        <div className="mt-[11px] grid grid-cols-3 gap-[14px] pr-2">
          {STATS.map((st, i) => (
            <div key={st.label} className="min-w-0">
              <p className="text-[12px] leading-[14px] text-secondary">{st.label}</p>
              <p className="mt-[2px] text-[17px] font-semibold leading-[20px] tracking-[-0.43px] text-white">{st.value}</p>
              <div
                className="mt-[6px] h-1 overflow-hidden rounded-[2px] bg-white/10"
                role="progressbar"
                aria-label={`${st.label}, ${Math.round(st.pct * 100)}% of target`}
                aria-valuenow={Math.round(st.pct * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="h-full origin-left" style={{ transform: `scaleX(${st.pct})` }}>
                  <div
                    className={`h-full rounded-[2px] ${intro ? s.fillIn : ""}`}
                    style={{ background: st.color, "--i": i } as CSSProperties}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <p className="mt-2 px-4 text-[13px] leading-[16px] text-secondary">Daily average on days you cooked, against your targets.</p>

      <Section first className="mt-[12px]">By meal</Section>
      <Group label="By meal">
        {MEALS.map((m) => (
          <MealRow key={m.title} lead={<Thumb src={m.img} />} title={m.title} subtitle={m.sub} chevron />
        ))}
      </Group>

      <Group className="mt-3" radius={20}>
        <Row height={56} sepInset={0} className="pl-4 pr-[14px]" label="Your targets, US guidelines">
          <Glyph name="target" size={24} />
          <span className="ml-3 min-w-0 flex-1 truncate text-[17px] leading-[22px] tracking-[-0.43px] text-white">Your targets</span>
          <span className="ml-3 truncate text-[17px] leading-[22px] tracking-[-0.43px] text-secondary">US guidelines</span>
          <Chevron className="ml-3" />
        </Row>
      </Group>
    </TabScreen>
  );
}
