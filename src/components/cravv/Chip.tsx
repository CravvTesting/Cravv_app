"use client";

import type { MouseEvent } from "react";
import { BloomFill, useBloomOrigin, useColorTransition } from "./Bloom";
import { Icon, type IconName } from "./Icon";
import { optionFill, type OptionToken } from "./options";
import { cx } from "./utils";

export type ChipState = "off" | "on" | "avoid";

export type ChipProps = {
  label: string;
  icon: IconName;
  /** off = grey icon on surface; on = solid option fill; avoid = allergy picked (struck icon). */
  state: ChipState;
  /** Option token, e.g. "diet-vegetarian", "allergy-avoid", "cuisine-indian". */
  token: OptionToken;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  /**
   * Spacing. "onboarding" (default) = Figma Chip 2611:4108: 8/10px padding, 4px gap (avoid: 9/12, 5).
   * "filter" = Home filter sheet chips (2680:6714, handoff §11): 9/12px padding, 5px gap in every state.
   */
  variant?: "onboarding" | "filter";
  className?: string;
};

/**
 * Multi-select chip (Figma Chip 2611:4108). 34px pill; the hit area extends to 44px.
 * Selecting blooms the option fill from the touch point and turns the icon white.
 */
export function Chip({ label, icon, state, token, onClick, disabled, variant = "onboarding", className }: ChipProps) {
  const { origin, onPointerDown, onKeyDown } = useBloomOrigin();
  const colorT = useColorTransition();
  const filled = state !== "off";
  const avoid = state === "avoid";

  return (
    <button
      type="button"
      aria-pressed={filled}
      disabled={disabled}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      className={cx(
        "relative isolate inline-flex h-[34px] shrink-0 items-center rounded-[17px] text-[15px] leading-none text-white",
        "before:absolute before:inset-x-0 before:-inset-y-[5px] before:content-['']",
        "select-none disabled:opacity-40",
        avoid || variant === "filter" ? "gap-[5px] pl-[9px] pr-[12px]" : "gap-1 pl-2 pr-2.5",
        className
      )}
      style={{ background: "var(--cravv-option-surface-off)" }}
    >
      <span aria-hidden className="absolute inset-0 -z-10 overflow-hidden rounded-[17px]">
        <BloomFill on={filled} color={optionFill(token)} origin={origin} />
      </span>
      <span
        className="flex size-[18px] items-center justify-center"
        style={{ color: filled ? "var(--cravv-option-icon-on-fill)" : "var(--cravv-option-icon-off)", transition: colorT }}
      >
        <Icon name={icon} size={avoid ? 20 : 18} strike={avoid} className={avoid ? "-m-px" : undefined} />
      </span>
      <span className={cx("whitespace-nowrap", filled ? "font-semibold" : "font-normal")}>{label}</span>
    </button>
  );
}
