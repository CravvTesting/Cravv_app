"use client";

import { useId, type ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import { Switch } from "./Switch";
import { cx, PRESS } from "./utils";

export type SettingsRowType = "navigation" | "value" | "two-line" | "switch" | "destructive";

export type SettingsRowProps = {
  type?: SettingsRowType;
  label: string;
  /** Leading 22px glyph. Always `--cravv-option-icon-off` (navigation/settings rule). */
  icon?: IconName;
  /** type="value": right-hand value ("Home WiFi"). */
  value?: string;
  /** type="two-line": second line ("Vegetarian · avoids peanuts"). */
  subtitle?: string;
  /** Hairline above the row. Default true; a SettingsGroup hides it on its first row. */
  separator?: boolean;
  /** type="switch". */
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  /** Tap on the row (navigation, value, two-line, destructive). */
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
};

/** The hairline drawn at the top of grouped rows; groups hide it on their first row. */
export function RowSeparator({ inset }: { inset: number }) {
  return (
    <span
      data-sep
      aria-hidden
      className="pointer-events-none absolute right-0 top-0 h-px origin-top scale-y-50 bg-white/[0.12]"
      style={{ left: inset }}
    />
  );
}

function Chevron({ size = 18 }: { size?: number }) {
  return (
    <span className="shrink-0" style={{ color: "var(--cravv-option-icon-off)" }}>
      <Icon name="chevron" size={size} />
    </span>
  );
}

/**
 * Grouped-list row (Figma Settings row 2674:6230). 52px (two-line 64px), raised surface.
 * Stack rows inside a <SettingsGroup>. Navigation-like rows are buttons; the Switch row is
 * a plain row whose switch is labelled by the row label.
 */
export function SettingsRow({
  type = "navigation",
  label,
  icon,
  value,
  subtitle,
  separator = true,
  checked = false,
  onChange,
  onPress,
  disabled,
  className,
}: SettingsRowProps) {
  const labelId = useId();
  const twoLine = type === "two-line";
  const base = cx(
    "relative flex w-full items-center text-left select-none",
    twoLine ? "h-16" : "h-[52px]",
    className
  );
  const bg = { background: "var(--cravv-surface-raised)" };

  if (type === "destructive") {
    return (
      <button type="button" onClick={onPress} disabled={disabled} className={cx(base, "justify-center disabled:opacity-40", PRESS)} style={bg}>
        {separator && <RowSeparator inset={0} />}
        <span className="text-[17px] leading-[22px]" style={{ color: "var(--cravv-status-alert)" }}>
          {label}
        </span>
      </button>
    );
  }

  const inner = (
    <>
      {separator && <RowSeparator inset={icon ? 52 : 16} />}
      {icon && (
        <span className="ml-4 shrink-0" style={{ color: "var(--cravv-option-icon-off)" }}>
          <Icon name={icon} size={22} />
        </span>
      )}
      <span className={cx("flex min-w-0 flex-1 flex-col", icon ? "ml-[14px]" : "ml-4")}>
        <span id={labelId} className="truncate text-[17px] leading-[22px] text-white">
          {label}
        </span>
        {twoLine && subtitle && (
          <span className="mt-px truncate text-[15px] leading-[19px]" style={{ color: "var(--cravv-text-secondary)" }}>
            {subtitle}
          </span>
        )}
      </span>
      {type === "value" && value && (
        <span className="ml-3 shrink-0 text-[17px] leading-[22px]" style={{ color: "var(--cravv-text-secondary)" }}>
          {value}
        </span>
      )}
      {type === "switch" ? (
        <Switch checked={checked} onChange={(v) => onChange?.(v)} labelledBy={labelId} disabled={disabled} className="ml-3 mr-4" />
      ) : (
        <span className={cx("mr-[14px]", type === "value" ? "ml-1.5" : "ml-3")}>
          <Chevron />
        </span>
      )}
    </>
  );

  if (type === "switch") {
    return (
      <div className={base} style={bg}>
        {inner}
      </div>
    );
  }
  return (
    <button type="button" onClick={onPress} disabled={disabled} className={cx(base, PRESS, "disabled:opacity-40")} style={bg}>
      {inner}
    </button>
  );
}

export type SettingsGroupProps = {
  /** Text above the group ("Tara", "You", "App"). */
  header?: string;
  /** Small print under the group. */
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * Rounded 16px group on the raised surface. Hides the hairline on its first row, so rows show
 * separators only between each other. Works with any row that draws <RowSeparator>
 * (SettingsRow, MealRow, NutrientRow, TaraCard).
 */
export function SettingsGroup({ header, footer, children, className }: SettingsGroupProps) {
  return (
    <section className={className}>
      {header && (
        <h3 className="px-4 pb-2 text-[15px] font-semibold leading-5" style={{ color: "var(--cravv-text-secondary)" }}>
          {header}
        </h3>
      )}
      <div
        className="flex flex-col overflow-hidden rounded-[16px] [&>:first-child_[data-sep]]:hidden"
        style={{ background: "var(--cravv-surface-raised)" }}
      >
        {children}
      </div>
      {footer && (
        <p className="px-4 pt-2 text-[13px] leading-[18px]" style={{ color: "var(--cravv-text-secondary)" }}>
          {footer}
        </p>
      )}
    </section>
  );
}

/** Small "›" for custom rows. */
export { Chevron as SettingsChevron };
