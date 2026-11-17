/* eslint-disable @next/next/no-img-element */
"use client";

import { cx } from "@/components/ui";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/** Green status pill: "Tara is online · Home WiFi" (11), "Tara is set up · watching 4 burners" (14b). */
export function StatusPill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("inline-flex h-[30px] w-fit items-center gap-1.5 rounded-[15px] bg-[rgba(48,209,88,0.14)] pl-2.5 pr-3", className)}>
      <img src="/img/stove/dot-online.svg" alt="" width={8} height={8} className="shrink-0" />
      <span className="whitespace-nowrap text-[13px] font-semibold text-success">{children}</span>
    </div>
  );
}

/** iOS grouped-list section header as drawn in these frames: 17 semibold, secondary label at 70%. */
export function ListHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cx("flex h-[39px] items-end px-4 pb-[9px] text-[17px] font-semibold leading-[22px] tracking-[-0.43px] text-[rgba(235,235,245,0.7)]", className)}>
      {children}
    </h2>
  );
}

export function Checkmark({ color = "#FF7A3D", size = 17, strokeWidth = 2.2 }: { color?: string; size?: number; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 17 17" fill="none" aria-hidden className="shrink-0">
      <path d="M2.5 9l4 4 8-9.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronRight({ color = "rgba(235,235,245,0.3)" }: { color?: string }) {
  return (
    <svg width="9" height="15" viewBox="0 0 9 15" fill="none" aria-hidden className="shrink-0">
      <path d="M1.5 1.5l6 6-6 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** iOS segmented control (Figma "Segmented control", 4 segments). */
export function Segmented<T extends string | number>({ options, value, onChange, label }: { options: readonly T[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex h-8 w-full items-center gap-1 rounded-full bg-[rgba(118,118,128,0.24)] p-0.5">
      {options.map((o) => {
        const on = o === value;
        return (
          <button
            key={String(o)}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o)}
            className={cx(
              "h-full flex-1 rounded-[20px] px-1.5 text-center text-[13.333px] leading-[18px] tracking-[-0.08px] text-white transition-colors",
              on ? "bg-[rgba(255,255,255,0.27)] font-semibold" : "font-medium"
            )}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

/** Bottom sheet with dimmed backdrop. */
export function Sheet({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: ReactNode; label: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={label}>
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/50 animate-fade-up" onClick={onClose} />
      <div
        className="animate-sheet-up relative w-full max-w-[430px] rounded-t-sheet bg-sheet px-5 pt-2"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 16px)" }}
      >
        <div className="mx-auto mb-4 h-[5px] w-9 rounded-full bg-white/30" />
        {children}
      </div>
    </div>
  );
}

/**
 * Keeps the bottom buttons pinned on short screens (375×667) while the content scrolls under them.
 * The Screen clips overflow, so the bar is fixed and an in-flow spacer of the same height holds its place.
 */
export function StickyActions({ children }: { children: ReactNode }) {
  const bar = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(0);
  useLayoutEffect(() => {
    const el = bar.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const pad = "max(env(safe-area-inset-bottom), 16px)";
  return (
    <>
      <div aria-hidden className="mt-auto shrink-0" style={{ height: h, marginBottom: `calc(-1 * ${pad})` }} />
      <div
        ref={bar}
        className="fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-[430px] bg-gradient-to-t from-[#0e0e10] from-60% to-transparent px-5"
        style={{ paddingBottom: pad }}
      >
        {children}
      </div>
    </>
  );
}
