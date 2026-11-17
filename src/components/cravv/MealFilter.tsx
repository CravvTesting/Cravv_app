"use client";

import type { MouseEvent } from "react";
import { useMotionTokens } from "@/proto/motion";
import { BloomFill, useBloomOrigin, useColorTransition } from "./Bloom";
import { Icon, type IconName } from "./Icon";
import { MEALS, optionFill, type MealId } from "./options";
import { cx } from "./utils";

/* 8% white surface, +8% while pressed (= 16%), opacity-only overlay. */
const PRESSABLE =
  "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-white after:opacity-0 after:transition-opacity after:duration-100 active:after:opacity-[0.08] after:content-['']";

export type MealChipProps = {
  meal: MealId;
  selected: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
};

/**
 * Home meal chip (Figma Meal chip 2677:6228). 36px. Off = 8% white + grey icon, Pressed = 16% white,
 * On = `--cravv-option-meal-<meal>-fill` blooming from the touch point, white icon.
 * The label is Semibold in every state, so the chip never changes width.
 */
export function MealChip({ meal, selected, onClick, className }: MealChipProps) {
  const opt = MEALS.find((x) => x.id === meal)!;
  const { origin, onPointerDown, onKeyDown } = useBloomOrigin();
  const colorT = useColorTransition();
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      className={cx(
        "relative isolate inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[18px] bg-white/[0.08] pl-[11px] pr-[14px] select-none",
        "before:absolute before:inset-x-0 before:-inset-y-1 before:content-['']",
        PRESSABLE,
        className
      )}
    >
      <span aria-hidden className="absolute inset-0 -z-10 overflow-hidden rounded-[18px]">
        <BloomFill on={selected} color={optionFill(opt.token)} origin={origin} />
      </span>
      <span style={{ color: selected ? "var(--cravv-option-icon-on-fill)" : "var(--cravv-option-icon-off)", transition: colorT }}>
        <Icon name={opt.icon} size={18} />
      </span>
      <span className="whitespace-nowrap text-[14px] font-semibold leading-[17px] text-white">{opt.label}</span>
    </button>
  );
}

export type FilterButtonProps = {
  /** Active filters (diet from Profile isn't counted). 0 = Default state; > 0 shows the badge. */
  count?: number;
  onClick?: () => void;
  /** Glyph. Default "filters" (Icon grid · Meal filter); Home v2 frames draw "sliders". */
  icon?: IconName;
  className?: string;
};

/**
 * Opens the filter sheet (Figma Filter button 2677:6231). 36px circle; Active (count > 0) = 16% white,
 * white icon and an 18px white count badge on the top-right corner.
 */
export function FilterButton({ count = 0, onClick, icon = "filters", className }: FilterButtonProps) {
  const m = useMotionTokens();
  const active = count > 0;
  const colorT = useColorTransition();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={active ? `Filters, ${count} on` : "Filters"}
      className={cx(
        "relative flex size-9 shrink-0 items-center justify-center rounded-full select-none",
        "before:absolute before:-inset-1 before:content-['']",
        PRESSABLE,
        className
      )}
      style={{ background: active ? "rgb(255 255 255 / 0.16)" : "rgb(255 255 255 / 0.08)" }}
    >
      <span style={{ color: active ? "var(--cravv-text-primary)" : "var(--cravv-option-icon-off)", transition: colorT }}>
        <Icon name={icon} size={18} />
      </span>
      <span
        aria-hidden
        className="absolute -right-1.5 -top-1 flex size-[18px] items-center justify-center rounded-full border-2 bg-white text-[11px] font-bold leading-none text-black tabular-nums"
        style={{
          borderColor: "var(--cravv-bg-page)",
          opacity: active ? 1 : 0,
          transform: active || m.reduced ? "scale(1)" : "scale(0.4)",
          transition: `transform ${0.35 * m.scale}s cubic-bezier(0.34, 1.56, 0.64, 1), opacity ${0.15 * m.scale}s ease`,
        }}
      >
        {count > 0 ? count : ""}
      </span>
    </button>
  );
}

export type MealFilterRowProps = {
  /** null = no meal (all meals; section reads "Recipes for you"). */
  selected: MealId | null;
  /** Tapping the selected chip calls onSelect(null). */
  onSelect: (meal: MealId | null) => void;
  /** Active filter count for the Filter button. */
  filterCount?: number;
  onFilters?: () => void;
  className?: string;
};

/**
 * The chip row above "For tonight" on Home (Figma Meal filter row 2677:6506): Filter button, then
 * Breakfast · Lunch · Dinner (single choice, 8px gaps; fits 362px). The new chip blooms while the
 * previous one fades. Use `mealForHour(new Date().getHours())` for the initial choice.
 */
export function MealFilterRow({ selected, onSelect, filterCount = 0, onFilters, className }: MealFilterRowProps) {
  return (
    <div role="group" aria-label="Meal" className={cx("flex items-center gap-2", className)}>
      <FilterButton count={filterCount} onClick={onFilters} />
      {MEALS.map((meal) => (
        <MealChip key={meal.id} meal={meal.id} selected={selected === meal.id} onClick={() => onSelect(selected === meal.id ? null : meal.id)} />
      ))}
    </div>
  );
}
