"use client";

import { useMotionTokens } from "@/proto/motion";
import { cx } from "./utils";

export type RatingProps = {
  /** 0–5. */
  value: number;
  /** Makes the stars tappable (each star gets a 44px-tall hit area); tapping the current value clears it. */
  onChange?: (value: number) => void;
  /** Star size in px. Figma: 11 with a 2px gap; interactive ratings usually want 28–32. */
  size?: number;
  className?: string;
};

const STAR = "M5.5 1.14583L6.82917 3.94167L9.85417 4.30833L7.60833 6.41667L8.20417 9.39583L5.5 7.92917L2.79583 9.39583L3.39167 6.41667L1.14583 4.30833L4.17083 3.94167L5.5 1.14583Z";

function Star({ on, size, fade }: { on: boolean; size: number; fade?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 11 11" aria-hidden className="block">
      <path d={STAR} fill="white" fillOpacity={0.25} />
      <path d={STAR} fill="var(--cravv-amber-500)" style={{ opacity: on ? 1 : 0, transition: fade }} />
    </svg>
  );
}

/** Star rating (Figma Rating 2675:6349). On = `--cravv-amber-500` (#FFD60A), off = 25% white. */
export function Rating({ value, onChange, size = 11, className }: RatingProps) {
  const m = useMotionTokens();
  const v = Math.max(0, Math.min(5, Math.round(value)));
  const gap = Math.max(2, Math.round(size * 0.18));
  const t = `opacity ${0.2 * m.scale}s ease, transform ${0.35 * m.scale}s cubic-bezier(0.34, 1.56, 0.64, 1)`;

  if (!onChange) {
    return (
      <span role="img" aria-label={`${v} of 5 stars`} className={cx("inline-flex", className)} style={{ gap }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} on={i <= v} size={size} />
        ))}
      </span>
    );
  }
  return (
    <span role="radiogroup" aria-label="Rating" className={cx("inline-flex", className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={i === v}
          aria-label={`${i} star${i > 1 ? "s" : ""}`}
          onClick={() => onChange(i === v ? 0 : i)}
          className="flex min-h-11 items-center justify-center select-none"
          style={{ paddingInline: gap / 2 }}
        >
          <span className="block active:scale-90" style={{ transition: t }}>
            <Star on={i <= v} size={size} fade={`opacity ${0.2 * m.scale}s ease`} />
          </span>
        </button>
      ))}
    </span>
  );
}
