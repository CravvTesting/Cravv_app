import type { ReactNode } from "react";
import { cx } from "./utils";

export type StatusTone = "success" | "warning" | "error";

const TONE: Record<StatusTone, string> = {
  success: "var(--cravv-status-success)",
  warning: "var(--cravv-status-warning)",
  error: "var(--cravv-status-alert)",
};

/** Device status under a screen title (Figma Status pill 2611:4150). 14% tint, dot and text in the tone colour. */
export function StatusPill({ tone, children, className }: { tone: StatusTone; children: ReactNode; className?: string }) {
  const c = TONE[tone];
  return (
    <span
      role="status"
      className={cx("inline-flex h-[30px] items-center gap-1.5 rounded-[15px] pl-2.5 pr-3 text-[13px] font-semibold whitespace-nowrap", className)}
      style={{ background: `color-mix(in srgb, ${c} 14%, transparent)`, color: c }}
    >
      <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ background: c }} />
      {children}
    </span>
  );
}
