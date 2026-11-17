"use client";

import { useEffect, type ReactNode } from "react";
import { cx } from "@/components/ui";

/**
 * Bottom sheet from frame 08x: 8px from the screen edges, 38px corners,
 * grabber, dimmed (55% black) screen behind. Tapping the dim or Escape closes it.
 */
export function Sheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  label,
}: {
  open: boolean;
  onClose?: () => void;
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  label?: string;
}) {
  useEffect(() => {
    if (!open || !onClose) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={label ?? title}>
      <button type="button" aria-label="Close" tabIndex={-1} onClick={onClose} className="absolute inset-0 cursor-default bg-black/55" />
      <div
        className="animate-sheet-up relative mx-2 mb-2 w-full max-w-[414px] rounded-sheet bg-sheet px-4 pt-[30px]"
        style={{ paddingBottom: "max(calc(env(safe-area-inset-bottom) + 16px), 50px)" }}
      >
        <div className="absolute left-1/2 top-2 h-[5px] w-9 -translate-x-1/2 rounded-[3px] bg-white/25" aria-hidden />
        <h2 className="text-center text-[28px] font-bold leading-[33px] text-white">{title}</h2>
        {subtitle && <p className="mt-[7px] text-center text-[15px] leading-[18px] text-label-2">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

/** Inset grouped list inside a sheet (the 08x checklist). */
export function Checklist({ items, className }: { items: { icon?: string; title: string; detail: string }[]; className?: string }) {
  return (
    <ul className={cx("overflow-hidden rounded-[20px] bg-elevated", className)}>
      {items.map((it, i) => (
        <li key={it.title} className="relative flex h-[60px] items-start">
          {it.icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={it.icon} alt="" width={22} height={22} className="ml-4 mt-[19px] shrink-0" />
          ) : (
            <span className="ml-4 mt-[19px] flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-white/10 text-[12px] font-semibold text-label-2">
              {i + 1}
            </span>
          )}
          <div className="ml-[14px] min-w-0 pt-[10px]">
            <p className="truncate text-[17px] leading-[20px] text-white">{it.title}</p>
            <p className="mt-[3px] truncate text-[13px] leading-[16px] text-label-2">{it.detail}</p>
          </div>
          {i < items.length - 1 && <div className="absolute bottom-0 left-[52px] right-0 h-px bg-[rgba(84,84,88,0.6)]" />}
        </li>
      ))}
    </ul>
  );
}
