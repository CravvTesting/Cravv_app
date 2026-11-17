"use client";

import { useMotionTokens } from "@/proto/motion";
import { cx } from "./utils";

export type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Accessible name (or pass `labelledBy`). */
  label?: string;
  labelledBy?: string;
  disabled?: boolean;
  className?: string;
};

/**
 * iOS switch (Figma Switch 2674:6233), 51×31. On = `--cravv-toggle-on-fill`.
 * The knob slides with a transform and the on fill fades in over the off track, so the
 * whole thing runs on the compositor.
 */
export function Switch({ checked, onChange, label, labelledBy, disabled, className }: SwitchProps) {
  const m = useMotionTokens();
  const d = (m.reduced ? 0.15 : 0.35) * m.scale;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        "relative isolate h-[31px] w-[51px] shrink-0 overflow-hidden rounded-full select-none disabled:opacity-40",
        "before:absolute before:-inset-[7px] before:content-['']",
        className
      )}
      style={{ background: "var(--cravv-gray-700)" }}
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{ background: "var(--cravv-toggle-on-fill)", opacity: checked ? 1 : 0, transition: `opacity ${d * 0.8}s ease` }}
      />
      <span
        aria-hidden
        className="absolute left-0.5 top-0.5 size-[27px] rounded-full bg-white"
        style={{
          boxShadow: "0 3px 8px rgba(0,0,0,0.15), 0 3px 1px rgba(0,0,0,0.06)",
          transform: `translateX(${checked ? 20 : 0}px)`,
          // Slight overshoot, like the UIKit switch spring.
          transition: `transform ${d}s ${m.reduced ? "ease" : "cubic-bezier(0.34, 1.36, 0.64, 1)"}`,
        }}
      />
    </button>
  );
}
