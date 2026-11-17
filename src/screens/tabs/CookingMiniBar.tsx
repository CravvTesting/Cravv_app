"use client";

/* eslint-disable @next/next/no-img-element */
/*
 * Cooking mini bar (Figma 2568:4445): fixed just above the tab bar while a cook is in progress.
 * "Back left · 6:12" counts down live once per second; the ring shows the step timer's elapsed
 * share and follows it (stroke-dashoffset transition). The frosted background is the one
 * backdrop-filter allowed: the bar is fixed, never inside scrolling content.
 */
import { useEffect, useState } from "react";
import { IMG } from "./ui";
import s from "./tabs.module.css";

/** Step 4 timer: 12:00 in total, 6:12 left when the tab first opens. */
const STEP_TOTAL = 12 * 60;
const START_LEFT = 6 * 60 + 12;

// The countdown keeps running across tab switches (the screen remounts), like a real cook.
let startedAt: number | null = null;
const secondsLeft = () => {
  if (startedAt === null) startedAt = Date.now();
  return Math.max(0, START_LEFT - Math.floor((Date.now() - startedAt) / 1000));
};

const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

/** Height of the bar plus its 6px gap above the tab bar, for padding scroll content. */
export const MINI_BAR_SPACE = 58 + 6;

const R = 13.5;
const C = 2 * Math.PI * R;

export function CookingMiniBar() {
  const [left, setLeft] = useState(secondsLeft);

  useEffect(() => {
    if (left <= 0) return;
    const t = setInterval(() => setLeft(secondsLeft()), 1000);
    return () => clearInterval(t);
  }, [left]);

  const progress = (STEP_TOTAL - left) / STEP_TOTAL;

  return (
    <button
      type="button"
      aria-label={`Rajma Chawal, step 4 of 9. Back left burner, ${fmt(left)} left. Tara is watching.`}
      className="absolute inset-x-5 z-20 flex h-[58px] items-center rounded-[29px] border border-white/[0.08] pl-[7px] pr-[14px] text-left active:opacity-80"
      style={{
        bottom: "calc(64px + max(env(safe-area-inset-bottom), 12px) + 6px)",
        background: "color-mix(in srgb, var(--cravv-gray-800) 92%, transparent)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <img src={`${IMG}/rajma.webp`} alt="" width={42} height={42} className="size-[42px] shrink-0 rounded-full object-cover" aria-hidden />
      <span className="ml-[10px] flex min-w-0 flex-1 flex-col" aria-hidden>
        <span className="truncate text-[15px] font-semibold leading-[18px] text-white">Rajma Chawal · Step 4 of 9</span>
        <span className="mt-[3px] flex items-center gap-[6px] text-[12px] leading-[14px]" style={{ color: "rgba(235,235,245,0.7)" }}>
          <span className="size-[7px] shrink-0 rounded-full" style={{ background: "var(--cravv-orange-500)" }} />
          <span className="truncate">
            Back left · <span className="tabular-nums">{fmt(left)}</span> · Tara is watching
          </span>
        </span>
      </span>
      <svg width="30" height="30" viewBox="0 0 30 30" className="ml-3 shrink-0" aria-hidden>
        <circle cx="15" cy="15" r={R} fill="none" stroke="white" strokeOpacity="0.15" strokeWidth="3" />
        <circle
          cx="15"
          cy="15"
          r={R}
          fill="none"
          stroke="var(--cravv-mint-500)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - progress)}
          transform="rotate(-90 15 15)"
          className={s.ring}
        />
      </svg>
    </button>
  );
}
