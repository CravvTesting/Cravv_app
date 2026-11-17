"use client";

/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/components/ui";

export const IMG = "/img/personalise";

/** iOS "Section Title" from the Figma frames: 17 semibold, secondary label, 16px inset, 39 tall. */
export function PSectionTitle({ children, right, className }: { children: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <div className={cx("flex h-[39px] items-end justify-between px-4 pb-[9px]", className)}>
      <h2 className="text-[17px] font-semibold leading-[22px] tracking-[-0.43px] text-[rgba(235,235,245,0.7)]">{children}</h2>
      {right}
    </div>
  );
}

/** Scrollable middle region: the top bar and <Actions> stay put; this scrolls on short screens. */
export function ScrollBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("-mx-5 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5", className)}>{children}</div>;
}

export type ChipIcon = {
  /** file base in /img/personalise, without -on/-off */
  src: string;
  /** natural SVG size; defaults to 18 */
  w?: number;
  h?: number;
  /** Figma inset for icons drawn as a group inside the 18px frame */
  inset?: string;
  /** strike the icon through when selected (allergies) */
  avoid?: boolean;
};

/** Selectable pill with a per-chip selected colour, matching 04 · Your kitchen. */
export function PChip({
  selected,
  onClick,
  label,
  icon,
  color,
  variant = "diet",
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  icon: ChipIcon;
  color: string;
  variant?: "diet" | "wide";
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cx(
        "flex h-[34px] shrink-0 items-center rounded-[17px] text-[15px] text-white transition-[background-color,transform] duration-150 active:scale-95",
        variant === "diet" ? "gap-1 pl-2 pr-2.5" : "gap-[5px] pl-[9px] pr-3",
        selected ? "font-semibold" : "bg-surface font-normal"
      )}
      style={selected ? { backgroundColor: color } : undefined}
    >
      <ChipGlyph icon={icon} selected={selected} color={color} />
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

function ChipGlyph({ icon, selected, color }: { icon: ChipIcon; selected: boolean; color: string }) {
  const state = selected ? "on" : "off";
  // The peanut only exists in Figma as the 20px "Avoid" glyph, laid out at inset -5.56% of the 18px slot.
  if (icon.src === "peanut") {
    return (
      <span className="relative block size-[18px] shrink-0">
        <span className="absolute inset-[-5.56%]">
          <img alt="" width={20} height={20} className="block size-full max-w-none" src={selected ? `${IMG}/icon-avoid.svg` : `${IMG}/icon-peanut-off.svg`} />
        </span>
      </span>
    );
  }
  const w = icon.w ?? 18;
  const h = icon.h ?? 18;
  return (
    <span className="relative block size-[18px] shrink-0">
      {icon.inset ? (
        <span className="absolute" style={{ inset: icon.inset }}>
          <img alt="" width={w} height={h} className="absolute inset-0 block size-full max-w-none" src={`${IMG}/${icon.src}-${state}.svg`} />
        </span>
      ) : (
        <img alt="" width={w} height={h} className="absolute inset-0 block size-full max-w-none" src={`${IMG}/${icon.src}-${state}.svg`} />
      )}
      {icon.avoid && selected && (
        <svg className="absolute inset-[-5.56%]" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M2 2L18 18" strokeWidth="4" strokeLinecap="round" stroke={color} />
          <path d="M2 2L18 18" strokeWidth="1.8" strokeLinecap="round" stroke="white" />
        </svg>
      )}
    </span>
  );
}

/** 26px glyph used on module cards and tiles. */
export function Glyph26({ src, style }: { src: string; style?: CSSProperties }) {
  return <img alt="" width={26} height={26} className="block size-[26px] shrink-0" src={src} style={style} />;
}
