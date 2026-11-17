"use client";

/*
 * Journal building blocks that the cravv library doesn't have (listed in the report):
 * extra glyphs (camera, minus, check, more, shuffle, grip, swap, note, x/check circles),
 * the round + button, the pill stepper, the list checkbox, mosaic covers, empty states.
 */
import type { CSSProperties, ReactNode } from "react";
import { Icon, PrimaryButton, cx, PRESS } from "@/components/cravv";
import { RECIPES } from "./data";

export const SECONDARY = "var(--cravv-text-secondary)";
export const TERTIARY = "rgb(235 235 245 / 0.5)";
export const ICON_OFF = "var(--cravv-option-icon-off)";
export const FAV = "var(--cravv-pink-500)"; // favourite heart: "true" state

// ---------------------------------------------------------------------------
// Glyphs (24-unit, filled, currentColor)
// ---------------------------------------------------------------------------
const GLYPHS = {
  camera: <path d="M9 4.5 7.6 6.5H5A2.5 2.5 0 0 0 2.5 9v9A2.5 2.5 0 0 0 5 20.5h14a2.5 2.5 0 0 0 2.5-2.5V9A2.5 2.5 0 0 0 19 6.5h-2.6L15 4.5H9Zm3 4.5a4.25 4.25 0 1 1 0 8.5 4.25 4.25 0 0 1 0-8.5Z" />,
  minus: <rect x="4" y="11" width="16" height="2.2" rx="1.1" />,
  plus: <path d="M10.9 4.5a1.1 1.1 0 0 1 2.2 0v6.4h6.4a1.1 1.1 0 0 1 0 2.2h-6.4v6.4a1.1 1.1 0 0 1-2.2 0v-6.4H4.5a1.1 1.1 0 0 1 0-2.2h6.4V4.5Z" />,
  check: <path d="M9.3 17.6a1.1 1.1 0 0 1-.8-.3l-4.3-4.3a1.1 1.1 0 1 1 1.6-1.6l3.5 3.5 8.7-8.7a1.1 1.1 0 1 1 1.6 1.6l-9.5 9.5a1.1 1.1 0 0 1-.8.3Z" />,
  more: <><circle cx="5.5" cy="12" r="1.9" /><circle cx="12" cy="12" r="1.9" /><circle cx="18.5" cy="12" r="1.9" /></>,
  grip: <><circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" /><circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" /></>,
  shuffle: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h3c2 0 3 1 4.5 3.5l3 5C15 18 16 19 18 19h2.5" /><path d="M3 17h3c1.3 0 2.2-.5 3-1.5" /><path d="M14.5 8.5C15.3 7.5 16.2 7 18 7h2.5" /><path d="M18 4l3 3-3 3" /><path d="M18 16l3 3-3 3" /></g>,
  swap: <path d="M16.3 2.8a1 1 0 0 1 1.4 0l3 3a1 1 0 0 1 0 1.4l-3 3a1 1 0 1 1-1.4-1.4l1.3-1.3H5.5a1 1 0 1 1 0-2h12.1l-1.3-1.3a1 1 0 0 1 0-1.4ZM7.7 13.8a1 1 0 0 1 0 1.4l-1.3 1.3h12.1a1 1 0 1 1 0 2H6.4l1.3 1.3a1 1 0 1 1-1.4 1.4l-3-3a1 1 0 0 1 0-1.4l3-3a1 1 0 0 1 1.4 0Z" />,
  note: <path d="M5.5 3A2.5 2.5 0 0 0 3 5.5v13A2.5 2.5 0 0 0 5.5 21H14l7-7V5.5A2.5 2.5 0 0 0 18.5 3h-13ZM14 14.5c0-.3.2-.5.5-.5H20l-6 6v-5.5ZM7 8h10v1.8H7V8Zm0 3.6h6v1.8H7v-1.8Z" />,
  xcircle: <path d="M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19Zm-3.2 5.1L12 10.8l3.2-3.2a1 1 0 0 1 1.4 1.4L13.4 12.2l3.2 3.2a1 1 0 0 1-1.4 1.4L12 13.6l-3.2 3.2a1 1 0 0 1-1.4-1.4l3.2-3.2L7.4 9a1 1 0 0 1 1.4-1.4Z" />,
  checkcircle: <path d="M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19Zm4.6 6.4a1 1 0 0 1 0 1.4l-5.4 5.4a1 1 0 0 1-1.4 0l-2.6-2.6a1 1 0 1 1 1.4-1.4l1.9 1.9 4.7-4.7a1 1 0 0 1 1.4 0Z" />,
  close: <path d="M6.2 4.8a1 1 0 0 0-1.4 1.4l5.8 5.8-5.8 5.8a1 1 0 1 0 1.4 1.4l5.8-5.8 5.8 5.8a1 1 0 0 0 1.4-1.4L13.4 12l5.8-5.8a1 1 0 0 0-1.4-1.4L12 10.6 6.2 4.8Z" />,
} as const;
export type GlyphName = keyof typeof GLYPHS;

export function Glyph({ name, size = 24, className, style }: { name: GlyphName; size?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={cx("block shrink-0", className)} style={style}>
      {GLYPHS[name]}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------

/** 44px round 12% white button with a glyph (Journal + / More). */
export function RoundButton({ label, onClick, glyph = "plus" }: { label: string; onClick: () => void; glyph?: GlyphName }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/[0.12] text-white transition-transform active:scale-95"
    >
      <Glyph name={glyph} size={20} />
    </button>
  );
}

/** Pill stepper: − value + (J04 portion 196×40, J11 amounts 120×32). */
export function Stepper({
  value,
  onMinus,
  onPlus,
  label,
  size = "sm",
  minusDisabled,
}: {
  value: string;
  onMinus: () => void;
  onPlus: () => void;
  label: string;
  size?: "sm" | "lg";
  minusDisabled?: boolean;
}) {
  const lg = size === "lg";
  const btn = cx(
    "relative flex h-full shrink-0 items-center justify-center text-white active:opacity-50 disabled:opacity-30",
    lg ? "w-11" : "w-8",
    "before:absolute before:-inset-y-1.5 before:inset-x-0 before:content-['']"
  );
  return (
    <div
      role="group"
      aria-label={label}
      className={cx("flex shrink-0 items-center rounded-full bg-white/[0.08]", lg ? "h-10 w-[196px]" : "h-8 w-[120px]")}
    >
      <button type="button" aria-label={`Less ${label}`} className={btn} onClick={onMinus} disabled={minusDisabled}>
        <Glyph name="minus" size={lg ? 20 : 16} />
      </button>
      <span aria-live="polite" className={cx("min-w-0 flex-1 truncate text-center font-semibold tabular-nums text-white", lg ? "text-[15px]" : "text-[14px]")}>
        {value}
      </span>
      <button type="button" aria-label={`More ${label}`} className={btn} onClick={onPlus}>
        <Glyph name="plus" size={lg ? 20 : 16} />
      </button>
    </div>
  );
}

/** 24px rounded checkbox: on = toggle green with a white check, off = 35% white ring. */
export function CheckBox({ on, label, onChange }: { on: boolean; label: string; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className="relative flex size-6 shrink-0 items-center justify-center rounded-[7px] before:absolute before:-inset-2.5 before:content-['']"
      style={{
        background: on ? "var(--cravv-toggle-on-fill)" : "transparent",
        boxShadow: on ? undefined : "inset 0 0 0 2px rgb(255 255 255 / 0.35)",
        transition: "background-color 0.2s ease",
      }}
    >
      <Glyph name="check" size={18} className="text-white" style={{ opacity: on ? 1 : 0, transition: "opacity 0.2s ease" }} />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Imagery
// ---------------------------------------------------------------------------

/** Food photo, or a grey icon well when there's none. */
export function Thumb({ src, size = 44, radius = 12, className }: { src?: string; size?: number; radius?: number; className?: string }) {
  return (
    <span
      className={cx("flex shrink-0 items-center justify-center overflow-hidden", className)}
      style={{ width: size, height: size, borderRadius: radius, background: src ? "#333" : "rgb(255 255 255 / 0.06)" }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" draggable={false} />
      ) : (
        <span style={{ color: ICON_OFF }}>
          <Icon name="bowl" size={Math.round(size / 2)} />
        </span>
      )}
    </span>
  );
}

/** 2×2 mosaic cover from the first four recipes with a photo (2px gutters). */
export function Mosaic({ recipeIds, size, radius, gap = 2 }: { recipeIds: string[]; size?: number; radius: number; gap?: number }) {
  const photos = recipeIds.map((id) => RECIPES[id]?.photo).filter(Boolean).slice(0, 4) as string[];
  return (
    <span
      className="grid shrink-0 grid-cols-2 grid-rows-2 overflow-hidden"
      style={{ width: size ?? "100%", height: size, aspectRatio: size ? undefined : "1", borderRadius: radius, gap, background: "#333" }}
    >
      {[0, 1, 2, 3].map((i) =>
        photos[i] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={photos[i]} alt="" className="size-full object-cover" draggable={false} />
        ) : (
          <span key={i} className="bg-white/[0.06]" />
        )
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Layout bits
// ---------------------------------------------------------------------------

/** Footnote caps label above a card ("COLLECTIONS", "RECENT"). */
export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cx("px-4 pb-2 text-[12px] font-semibold uppercase leading-[14px]", className)} style={{ color: TERTIARY }}>
      {children}
    </p>
  );
}

/** Raised rounded card. */
export function Card({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={cx("overflow-hidden rounded-[16px]", className)} style={{ background: "var(--cravv-surface-raised)", ...style }}>
      {children}
    </div>
  );
}

/** 0.5px divider. */
export function Hairline({ inset = 16, right = 0 }: { inset?: number; right?: number }) {
  return <span aria-hidden className="pointer-events-none absolute top-0 h-px origin-top scale-y-50 bg-white/[0.12]" style={{ left: inset, right }} />;
}

/** Empty states (J05, J10, J15): tinted 120px tile, title, body, then an action. */
export function EmptyState({
  icon,
  color,
  tint,
  title,
  body,
  action,
  onAction,
  link,
}: {
  icon: ReactNode;
  color: string;
  tint: string;
  title: string;
  body: string;
  action: string;
  onAction: () => void;
  link?: boolean;
}) {
  return (
    <div className="flex flex-col items-center pt-[42px] text-center">
      <span className="flex size-[120px] items-center justify-center rounded-[32px]" style={{ background: tint, color }}>
        {icon}
      </span>
      <h2 className="mt-6 text-[22px] font-bold leading-7 text-white">{title}</h2>
      <p className="mt-2 max-w-[310px] text-[15px] leading-5" style={{ color: SECONDARY }}>
        {body}
      </p>
      {link ? (
        <button type="button" onClick={onAction} className="mt-[30px] flex h-11 items-center px-4 text-[17px] font-semibold active:opacity-50" style={{ color: "var(--cravv-text-accent)" }}>
          {action}
        </button>
      ) : (
        <PrimaryButton className="mt-[30px]" onClick={onAction}>
          {action}
        </PrimaryButton>
      )}
    </div>
  );
}

/** Generic pressable row inside a Card. */
export function PressRow({ children, onClick, className, label }: { children: ReactNode; onClick?: () => void; className?: string; label?: string }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className={cx("relative flex w-full items-center text-left select-none", PRESS, className)}>
      {children}
    </button>
  );
}

/** Tint helper for option-like colours (14–16% backgrounds of a base colour). */
export const tint = (color: string, pct: number) => `color-mix(in srgb, ${color} ${pct}%, transparent)`;

/**
 * Sheets over the tab roots (J03, J12): the shell keeps the tab bar mounted (z 70) for these
 * ids, but the frames draw it under the dim, so the sheet layer sits above it.
 */
export function AboveTabBar({ children }: { children: ReactNode }) {
  return <div className="absolute inset-0 z-[80]">{children}</div>;
}
