"use client";

import type { MouseEvent, ReactNode } from "react";
import { useColorTransition } from "./Bloom";
import { Icon, type IconName } from "./Icon";
import { optionBase, type OptionToken } from "./options";
import { cx } from "./utils";

export type ListRowProps = {
  label: string;
  icon: IconName;
  /** Option token; selected rows draw the icon and check in its base colour. */
  token: OptionToken;
  selected: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  className?: string;
};

/** 48px single-select row inside a <ListGroup> (Figma List row 2611:4206). */
export function ListRow({ label, icon, token, selected, onClick, disabled, className }: ListRowProps) {
  const colorT = useColorTransition();
  const c = selected ? optionBase(token) : "var(--cravv-option-icon-off)";
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "group relative flex h-12 w-full items-center gap-3 px-4 text-left select-none active:bg-white/5 disabled:opacity-40",
        className
      )}
    >
      <span style={{ color: c, transition: colorT }}>
        <Icon name={icon} size={22} />
      </span>
      <span className="min-w-0 flex-1 truncate text-[17px] leading-[22px] tracking-[-0.43px] text-white">{label}</span>
      <svg
        aria-hidden
        width="17"
        height="16"
        viewBox="0 0 17 16"
        fill="none"
        className="shrink-0"
        style={{ color: optionBase(token), opacity: selected ? 1 : 0, transition: colorT }}
      >
        <path d="M1.5 8.5L6.2 13.5L15.5 2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span data-sep aria-hidden className="absolute bottom-0 left-4 right-0 h-px scale-y-50 bg-[rgba(84,84,88,0.6)]" />
    </button>
  );
}

/** Grouped list (rounded 26, raised surface). Hides the separator on the last row. */
export function ListGroup({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cx("flex flex-col overflow-hidden rounded-[26px] [&>:last-child_[data-sep]]:hidden", className)}
      style={{ background: "var(--cravv-surface-raised)" }}
    >
      {children}
    </div>
  );
}
