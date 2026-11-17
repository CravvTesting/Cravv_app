"use client";

import { createContext, useContext, type MouseEvent, type ReactNode } from "react";
import { BloomFill, useBloomOrigin, useColorTransition } from "./Bloom";
import { Icon, type IconName } from "./Icon";
import { optionFill, type OptionToken } from "./options";
import { cx } from "./utils";

const InGroup = createContext(false);

export type ChoiceTileProps = {
  label: string;
  hint?: string;
  icon: IconName;
  /** Option token, e.g. "skill-comfortable". */
  token: OptionToken;
  selected: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  className?: string;
};

/**
 * Single-choice tile (Figma Choice tile 2611:4126), 136px tall. Selected = solid option fill
 * blooming from the touch point, white icon, hint at 90% white. Put 2–4 in a <ChoiceTileGroup>.
 */
export function ChoiceTile({ label, hint, icon, token, selected, onClick, disabled, className }: ChoiceTileProps) {
  const inGroup = useContext(InGroup);
  const { origin, onPointerDown, onKeyDown } = useBloomOrigin();
  const colorT = useColorTransition();
  return (
    <button
      type="button"
      role={inGroup ? "radio" : undefined}
      aria-checked={inGroup ? selected : undefined}
      aria-pressed={inGroup ? undefined : selected}
      disabled={disabled}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      className={cx(
        "relative isolate flex h-[136px] min-w-0 flex-col items-start overflow-hidden rounded-[20px] pl-3 pt-[17px] text-left text-white select-none disabled:opacity-40",
        // Figma narrows the hint on the selected tile (94 → 82px)
        selected ? "pr-[22px]" : "pr-2.5",
        className
      )}
      style={{ background: "var(--cravv-option-surface-off)" }}
    >
      <BloomFill on={selected} color={optionFill(token)} origin={origin} />
      <span
        className="relative"
        style={{ color: selected ? "var(--cravv-option-icon-on-fill)" : "var(--cravv-option-icon-off)", transition: colorT }}
      >
        <Icon name={icon} size={26} />
      </span>
      <span className="relative mt-[19px] text-[13px] font-semibold leading-4">{label}</span>
      {hint && (
        <span
          className="relative mt-1.5 text-[12px] leading-4"
          style={{ color: selected ? "rgba(255,255,255,0.9)" : "var(--cravv-text-secondary)", transition: colorT }}
        >
          {hint}
        </span>
      )}
    </button>
  );
}

/** Row of choice tiles with radiogroup semantics. Tiles share the width equally (7px gap). */
export function ChoiceTileGroup({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <InGroup.Provider value={true}>
      <div role="radiogroup" aria-label={label} className={cx("grid auto-cols-fr grid-flow-col gap-[7px]", className)}>
        {children}
      </div>
    </InGroup.Provider>
  );
}
