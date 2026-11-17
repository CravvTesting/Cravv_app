"use client";

import { useRef, type KeyboardEvent } from "react";
import { useMotionTokens } from "@/proto/motion";
import { cx } from "./utils";

export type SegmentedOption<V extends string | number> = { value: V; label: string };

export type SegmentedControlProps<V extends string | number> = {
  /** Options, or plain values used as their own labels. */
  options: readonly (SegmentedOption<V> | V)[];
  value: V;
  onChange: (value: V) => void;
  /** Accessible name for the group, e.g. "Burners". */
  label: string;
  /**
   * "ios" (default): iOS segmented control restyled, track + soft grey pill (Burners, 2610:4171).
   * "pill": white thumb with black label on a 10% white track (US / Metric on 05, 2525:2772).
   */
  variant?: "ios" | "pill";
  className?: string;
};

const norm = <V extends string | number>(o: SegmentedOption<V> | V): SegmentedOption<V> =>
  typeof o === "object" ? o : { value: o, label: String(o) };

/**
 * Generic single-select segmented control (radiogroup). 32px tall, fills its container width.
 * The thumb slides between segments; arrow keys move the selection.
 */
export function SegmentedControl<V extends string | number>({
  options,
  value,
  onChange,
  label,
  variant = "ios",
  className,
}: SegmentedControlProps<V>) {
  const m = useMotionTokens();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const opts = options.map(norm);
  const pill = variant === "pill";
  const gap = pill ? 0 : 4;
  const selected = opts.findIndex((o) => o.value === value);

  const onKey = (e: KeyboardEvent, i: number) => {
    const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (i + d + opts.length) % opts.length;
    onChange(opts[n].value);
    refs.current[n]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cx("relative flex h-8 w-full rounded-full p-0.5", pill ? "gap-0" : "gap-1", className)}
      style={{ background: pill ? "rgba(255,255,255,0.1)" : "rgba(118,118,128,0.24)" }}
    >
      {/* Thumb: one element slid with a compositor-friendly transform. */}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0.5 left-0.5 top-0.5 rounded-full"
        style={{
          width: `calc((100% - 4px - ${(opts.length - 1) * gap}px) / ${opts.length})`,
          transform: `translate3d(calc(${Math.max(0, selected)} * (100% + ${gap}px)), 0, 0)`,
          transition: m.reduced ? "none" : `transform ${0.35 * m.scale}s var(--ease-ios)`,
          background: pill ? "var(--cravv-white)" : "rgba(255,255,255,0.27)",
          willChange: "transform",
        }}
      />
      {opts.map((o, i) => {
        const on = o.value === value;
        return (
          <button
            key={String(o.value)}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKey(e, i)}
            className={cx(
              "relative min-w-0 flex-1 select-none rounded-full px-1.5",
              // 44px tall hit area over the 28px segment
              "before:absolute before:inset-x-0 before:-inset-y-2 before:content-['']"
            )}
          >
            <span
              className={cx(
                "relative block truncate text-center",
                pill ? "text-[13px] leading-[16px]" : "text-[13.33px] leading-[18px] tracking-[-0.08px]",
                pill ? (on ? "font-semibold" : "font-normal") : "font-semibold"
              )}
              style={{
                color: pill && on ? "var(--cravv-black)" : "var(--cravv-white)",
                transition: `color ${0.2 * m.scale}s ease`,
              }}
            >
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
