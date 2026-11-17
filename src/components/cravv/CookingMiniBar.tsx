"use client";

import { useMotionTokens } from "@/proto/motion";
import { Icon } from "./Icon";
import { optionBase } from "./options";
import { cx } from "./utils";

/** Height of the mini bar, px. It sits 6px above the tab bar. */
export const MINI_BAR_HEIGHT = 58;
export const MINI_BAR_GAP = 6;

export type CookingMiniBarProps = {
  /** Cooking = dish photo in the thumb; Watching = eye in a grey well. */
  mode: "cooking" | "watching";
  /** "Rajma Chawal · Step 4 of 9" / "Watching 2 burners". */
  title: string;
  /** "Back left · 6:12 · Tara is watching" / "Front right · whistle 2 of 3". */
  detail: string;
  /** Ring progress 0..1 (step progress; mint, never copper). Update it as often as you like. */
  progress: number;
  /** Dish photo URL (cooking mode). */
  photo?: string;
  /** Camera paused: the live dot turns grey and stops pulsing. */
  cameraPaused?: boolean;
  /** Opens the live session. */
  onPress?: () => void;
  className?: string;
};

const R = 13.5;
const C = 2 * Math.PI * R;

/**
 * Cooking mini bar (Figma 2674:6186). Glass pill above the tab bar while a cook or a watch runs.
 * The ring eases to each new `progress` (stroke-dashoffset transition), so it reads as continuous.
 */
export function CookingMiniBar({ mode, title, detail, progress, photo, cameraPaused = false, onPress, className }: CookingMiniBarProps) {
  const m = useMotionTokens();
  const p = Math.min(1, Math.max(0, progress));
  return (
    <button
      type="button"
      onClick={onPress}
      className={cx(
        "relative flex w-full items-center overflow-hidden rounded-[29px] border border-white/[0.08] text-left backdrop-blur-[12px] select-none",
        "transition-transform duration-150 active:scale-[0.98]",
        className
      )}
      style={{ height: MINI_BAR_HEIGHT, background: "color-mix(in srgb, var(--cravv-gray-800) 92%, transparent)" }}
    >
      <span
        className="ml-[6px] flex size-[42px] shrink-0 items-center justify-center overflow-hidden rounded-full"
        style={{ background: mode === "watching" || !photo ? "var(--cravv-gray-700)" : undefined }}
      >
        {mode === "cooking" && photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className="size-full object-cover" />
        ) : (
          <span style={{ color: "var(--cravv-text-primary)" }}>
            <Icon name={mode === "watching" ? "eye" : "pot"} size={24} />
          </span>
        )}
      </span>
      <span className="ml-[10px] flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[15px] font-semibold leading-[18px] text-white">{title}</span>
        <span className="mt-1 flex min-w-0 items-center gap-1.5">
          <span
            aria-hidden
            className={cx("size-[7px] shrink-0 rounded-full", !cameraPaused && !m.reduced && "cravv-live-dot")}
            style={{
              background: cameraPaused ? "var(--cravv-option-icon-off)" : optionBase("live-temperature"),
              animationDuration: `${1.6 * m.scale}s`,
            }}
          />
          <span className="truncate text-[12px] leading-[14px]" style={{ color: "rgb(235 235 245 / 0.7)" }}>
            {detail}
          </span>
        </span>
      </span>
      <svg
        width="30"
        height="30"
        viewBox="0 0 30 30"
        className="mx-[14px] shrink-0"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(p * 100)}
      >
        <circle cx="15" cy="15" r={R} fill="none" stroke="white" strokeOpacity={0.15} strokeWidth={3} />
        <circle
          cx="15"
          cy="15"
          r={R}
          fill="none"
          stroke={optionBase("live-timer")}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - p)}
          transform="rotate(-90 15 15)"
          style={{ transition: `stroke-dashoffset ${(m.reduced ? 0 : 0.9) * m.scale}s linear` }}
        />
      </svg>
      <style>{`@keyframes cravv-live-dot{0%,100%{opacity:1}50%{opacity:.35}}.cravv-live-dot{animation:cravv-live-dot 1.6s ease-in-out infinite}`}</style>
    </button>
  );
}
