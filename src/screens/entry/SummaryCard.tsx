/* eslint-disable @next/next/no-img-element */
/*
 * Read-only summary list: icon, label, value on the right, inset separators.
 * Matches "Restored" on 02c (2526:2747): 52px rows, raised surface, radius 26.
 */
import type { ReactNode } from "react";

export type SummaryRow = { key: string; label: string; value: ReactNode; icon?: ReactNode };

export function SummaryCard({ rows, className }: { rows: SummaryRow[]; className?: string }) {
  return (
    <ul className={`overflow-hidden rounded-[26px] bg-raised ${className ?? ""}`}>
      {rows.map((r, i) => (
        <li key={r.key} className="relative flex min-h-[52px] items-center gap-3.5 pl-4 pr-4">
          {r.icon && <span className="flex size-[22px] shrink-0 items-center justify-center">{r.icon}</span>}
          <span className="shrink-0 text-[17px] leading-[22px] tracking-[-0.43px] text-white">{r.label}</span>
          <span className="ml-auto min-w-0 truncate py-[15px] text-right text-[17px] leading-[22px] tracking-[-0.43px] text-secondary">{r.value}</span>
          {i < rows.length - 1 && (
            <span
              aria-hidden
              className={`absolute right-0 bottom-0 h-px ${r.icon ? "left-[52px]" : "left-4"}`}
              style={{ background: "color-mix(in srgb, var(--cravv-gray-600) 60%, transparent)" }}
            />
          )}
        </li>
      ))}
    </ul>
  );
}

/** A 22px icon from public/img/entry. */
export const RowIcon = ({ name }: { name: string }) => <img src={`/img/entry/icon-${name}.svg`} alt="" width={22} height={22} />;
