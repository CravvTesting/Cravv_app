"use client";

/* eslint-disable @next/next/no-img-element */
/*
 * Shared building blocks for the Nutrition, Journal and Profile tabs (Figma 2568:4293, 2568:4383,
 * 2568:4456): a scrolling tab screen with a large title, raised grouped lists and their rows.
 * Rows are pressable (press highlight) but don't navigate.
 */
import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/components/cravv";
import { TAB_BAR_SPACE } from "@/proto/TabBar";

export const IMG = "/img/tabs-content";

/** Secondary label tints from the frames (no token for these alphas of ink-secondary's base). */
export const INK = {
  secondary: "var(--cravv-text-secondary)", // 60%
  muted45: "rgba(235,235,245,0.45)",
  muted50: "rgba(235,235,245,0.5)",
  muted70: "rgba(235,235,245,0.7)",
};

/** iOS hairline separator colour used across the frames and the ListRow component. */
export const SEPARATOR = "rgba(84,84,88,0.6)";

/**
 * Full-height tab screen: content scrolls under the floating tab bar (padded by TAB_BAR_SPACE
 * plus `extraBottom`), with the frames' bottom scroll fade. The title sits 4px under the status bar.
 */
export function TabScreen({
  title,
  children,
  overlay,
  extraBottom = 0,
}: {
  title: string;
  children: ReactNode;
  /** Fixed content above the tab bar (Journal's cooking mini bar). */
  overlay?: ReactNode;
  extraBottom?: number;
}) {
  return (
    <div className="cravv-bg relative h-full w-full overflow-hidden">
      <div
        className="h-full overflow-y-auto overscroll-contain px-5"
        style={{
          paddingTop: "calc(max(env(safe-area-inset-top), 62px) + 4px)",
          paddingBottom: `calc(${TAB_BAR_SPACE} + ${extraBottom + 24}px)`,
        }}
      >
        <h1 className="text-[34px] font-bold leading-[41px] tracking-[0.4px] text-white">{title}</h1>
        {children}
      </div>
      {/* Scroll fade behind the tab bar: starts 48px above it, as in the frames. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
        style={{
          height: `calc(${TAB_BAR_SPACE} + 36px)`,
          background: "linear-gradient(180deg, transparent 0%, var(--cravv-gray-1000) 55%, var(--cravv-gray-1000) 100%)",
        }}
      />
      {overlay}
    </div>
  );
}

/** Section title above a group: 17 semibold secondary, inset 16, 21px above (frames). */
export function Section({ children, className, first }: { children: ReactNode; className?: string; first?: boolean }) {
  return (
    <h2
      className={cx(
        "px-4 pb-2 text-[17px] font-semibold leading-[22px] tracking-[-0.43px] text-secondary",
        !first && "mt-[21px]",
        className
      )}
    >
      {children}
    </h2>
  );
}

/** Raised rounded group (26px radius). The last row's separator is hidden. */
export function Group({ children, className, radius = 26, label }: { children: ReactNode; className?: string; radius?: number; label?: string }) {
  return (
    <div
      role={label ? "group" : undefined}
      aria-label={label}
      className={cx("flex flex-col overflow-hidden bg-raised [&>:last-child_[data-sep]]:hidden", className)}
      style={{ borderRadius: radius }}
    >
      {children}
    </div>
  );
}

/** A pressable row with a hairline separator starting at `sepInset`. */
export function Row({
  children,
  height,
  sepInset,
  className,
  style,
  label,
}: {
  children: ReactNode;
  height: number;
  sepInset: number;
  className?: string;
  style?: CSSProperties;
  label?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cx("relative flex w-full shrink-0 items-center text-left select-none active:bg-white/5", className)}
      style={{ height, ...style }}
    >
      {children}
      <span data-sep aria-hidden className="absolute bottom-0 right-0 h-px scale-y-50" style={{ left: sepInset, background: SEPARATOR }} />
    </button>
  );
}

/** 18px grey chevron at the right of a row (Figma "Icon · chev"). */
export function Chevron({ className }: { className?: string }) {
  return <img src={`${IMG}/chev.svg`} alt="" width={18} height={18} className={cx("shrink-0", className)} aria-hidden />;
}

/** A Figma icon asset (22 or 24px), drawn as exported. */
export function Glyph({ name, size = 22, className }: { name: string; size?: number; className?: string }) {
  return <img src={`${IMG}/${name}.svg`} alt="" width={size} height={size} className={cx("shrink-0", className)} aria-hidden />;
}

/** 40px rounded food thumbnail. */
export function Thumb({ src, size = 40, radius = 12, className }: { src: string; size?: number; radius?: number; className?: string }) {
  return (
    <img
      src={`${IMG}/${src}.webp`}
      alt=""
      width={size}
      height={size}
      decoding="async"
      className={cx("shrink-0 object-cover", className)}
      style={{ width: size, height: size, borderRadius: radius }}
      aria-hidden
    />
  );
}

/** Meal row used by Nutrition and Journal: 64px, thumbnail (or any leading node), title and subtitle. */
export function MealRow({
  lead,
  title,
  subtitle,
  subtitleColor = INK.secondary,
  chevron,
}: {
  lead: ReactNode;
  title: string;
  subtitle: string;
  subtitleColor?: string;
  chevron?: boolean;
}) {
  return (
    <Row height={64} sepInset={64} className="gap-3 pl-3 pr-[14px]" label={`${title}, ${subtitle}`}>
      {lead}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[17px] font-semibold leading-[20px] tracking-[-0.43px] text-white">{title}</span>
        <span className="mt-[3px] truncate text-[13px] leading-[16px]" style={{ color: subtitleColor }}>
          {subtitle}
        </span>
      </span>
      {chevron && <Chevron />}
    </Row>
  );
}

/** Settings-style row: 52px, 22px icon, label, optional value, chevron. */
export function SettingRow({ icon, label, value }: { icon: string; label: string; value?: string }) {
  return (
    <Row height={52} sepInset={52} className="pl-4 pr-[14px]" label={value ? `${label}, ${value}` : label}>
      <Glyph name={icon} />
      <span className="ml-[14px] min-w-0 flex-1 truncate text-[17px] leading-[22px] tracking-[-0.43px] text-white">{label}</span>
      {value && (
        <span className="ml-3 max-w-[45%] truncate text-[17px] leading-[22px] tracking-[-0.43px] text-secondary">{value}</span>
      )}
      <Chevron className="ml-3" />
    </Row>
  );
}
