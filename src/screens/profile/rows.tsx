"use client";

/*
 * Profile-local grouped rows for the variants SettingsRow doesn't cover (P02–P04): value rows
 * without a chevron, two-line rows with a value or a switch, a coloured label (copper link,
 * left-aligned destructive), and a leading level dot. Same metrics as SettingsRow:
 * 52px (64px two-line), 17/15pt, hairline on top (hidden by SettingsGroup on the first row).
 */
import { useId, type ReactNode } from "react";
import { cx, PRESS, RowSeparator, SettingsChevron, Switch } from "@/components/cravv";

export type RowProps = {
  label: string;
  subtitle?: string;
  value?: string;
  valueColor?: string;
  labelColor?: string;
  /** Leading 12px dot (P03 alert levels). */
  dot?: string;
  chevron?: boolean;
  switchOn?: boolean;
  onSwitch?: (v: boolean) => void;
  onPress?: () => void;
  separator?: boolean;
  disabled?: boolean;
};

export function Row({ label, subtitle, value, valueColor, labelColor, dot, chevron = false, switchOn, onSwitch, onPress, separator = true, disabled }: RowProps) {
  const labelId = useId();
  const hasSwitch = onSwitch !== undefined;
  const cls = cx("relative flex w-full items-center text-left select-none", subtitle ? "h-16" : "h-[52px]");
  const bg = { background: "var(--cravv-surface-raised)" };

  const inner: ReactNode = (
    <>
      {separator && <RowSeparator inset={dot ? 48 : 16} />}
      {dot && <span aria-hidden className="ml-5 size-3 shrink-0 rounded-full" style={{ background: dot }} />}
      <span className={"ml-4 flex min-w-0 flex-1 flex-col"}>
        <span id={labelId} className="truncate text-[17px] leading-[22px]" style={{ color: labelColor ?? "var(--cravv-text-primary)" }}>
          {label}
        </span>
        {subtitle && (
          <span className="mt-px truncate text-[15px] leading-[19px]" style={{ color: "var(--cravv-text-secondary)" }}>
            {subtitle}
          </span>
        )}
      </span>
      {value && (
        <span className={cx("ml-3 shrink-0 text-[17px] leading-[22px]", !chevron && !hasSwitch && "mr-4")} style={{ color: valueColor ?? "var(--cravv-text-secondary)" }}>
          {value}
        </span>
      )}
      {hasSwitch && <Switch checked={!!switchOn} onChange={onSwitch} labelledBy={labelId} disabled={disabled} className="ml-3 mr-4" />}
      {chevron && (
        <span className={cx("mr-[14px]", value ? "ml-1.5" : "ml-3")}>
          <SettingsChevron />
        </span>
      )}
    </>
  );

  if (onPress && !hasSwitch) {
    return (
      <button type="button" onClick={onPress} disabled={disabled} className={cx(cls, PRESS, "disabled:opacity-40")} style={bg}>
        {inner}
      </button>
    );
  }
  return (
    <div className={cls} style={bg}>
      {inner}
    </div>
  );
}

/** Space between stacked groups (Figma: 51px from one group's bottom to the next group's top, 28px header). */
export const GROUP_GAP = "mt-[23px]";
