"use client";

import { Icon } from "./Icon";
import { Rating } from "./Rating";
import { RowSeparator } from "./Settings";
import { formatNumber, useCountUp } from "./useCountUp";
import { cx, PRESS } from "./utils";

export type MealRowType = "tara-cook" | "logged" | "not-logged";

export type MealRowProps = {
  /** nutrition = meal slot label on top (R01); journal = name on top, rating under (J01). */
  context: "nutrition" | "journal";
  type: MealRowType;
  /** Nutrition: the slot label on top ("Breakfast", shown in caps). Ignored in Journal (put it in `detail`). */
  slot?: string;
  /** Dish name. Not logged (Nutrition) defaults to "Not logged yet". */
  name?: string;
  /** Second line: "8:10 AM · logged", "Lunch · cooked with Tara", "Cooking tonight? Tara logs it for you." */
  detail?: string;
  kcal?: number;
  /** Dish photo (Tara cooks). */
  photo?: string;
  /** Journal Tara cooks: 0–5 stars under the detail. */
  rating?: number;
  /** Tap on the row. */
  onPress?: () => void;
  /** Not logged: the "Log" pill. */
  onLog?: () => void;
  /** Hairline above the row (inset 72). A SettingsGroup hides it on the first row. */
  separator?: boolean;
  className?: string;
};

const secondary = "var(--cravv-text-secondary)";
const tertiary = "rgb(235 235 245 / 0.5)";

/**
 * Meal row (Figma 2674:6290), 72px on the raised surface. Stack inside a <SettingsGroup>.
 * Tara cooks show the dish photo; logged meals a grey bowl well; not logged a plus well and a Log pill.
 */
export function MealRow({
  context,
  type,
  slot,
  name,
  detail,
  kcal,
  photo,
  rating,
  onPress,
  onLog,
  separator = true,
  className,
}: MealRowProps) {
  const nutrition = context === "nutrition";
  const notLogged = type === "not-logged";
  const title = name ?? (notLogged ? "Not logged yet" : "");

  const content = (
    <>
      {separator && <RowSeparator inset={72} />}
      <span
        className="ml-4 flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-[12px]"
        style={{ background: type === "tara-cook" && photo ? undefined : "rgb(255 255 255 / 0.06)" }}
      >
        {type === "tara-cook" && photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className="size-full object-cover" />
        ) : (
          <span style={{ color: "var(--cravv-option-icon-off)" }}>
            <Icon name={notLogged ? "plus" : "bowl"} size={22} />
          </span>
        )}
      </span>

      <span className={cx("ml-3 flex min-w-0 flex-1 flex-col self-start", nutrition ? "pt-3" : "pt-[13px]", notLogged && "pr-4")}>
        {nutrition ? (
          <>
            <span className="truncate text-[11px] font-semibold uppercase leading-[13px]" style={{ color: tertiary }}>
              {slot}
            </span>
            <span
              className={cx("mt-0.5 truncate text-[16px] leading-[19px]", notLogged ? "font-normal" : "font-semibold text-white")}
              style={notLogged ? { color: "rgb(255 255 255 / 0.6)" } : undefined}
            >
              {title}
            </span>
            {detail && (
              <span className="mt-0.5 truncate text-[12px] leading-[14px]" style={{ color: secondary }}>
                {detail}
              </span>
            )}
          </>
        ) : (
          <>
            <span className="truncate text-[16px] font-semibold leading-[19px] text-white">{title}</span>
            {detail && (
              <span className="mt-[3px] truncate text-[12px] leading-[14px]" style={{ color: secondary }}>
                {detail}
              </span>
            )}
            {type === "tara-cook" && rating !== undefined && <Rating value={rating} className="mt-[3px]" />}
          </>
        )}
      </span>

      {notLogged && nutrition ? (
        <span className="absolute right-4 top-[22px]">
          {/* Real button only when the row itself isn't one (no nested buttons). */}
          <span
            role={onPress ? undefined : "button"}
            tabIndex={onPress ? undefined : 0}
            onClick={(e) => {
              e.stopPropagation();
              onLog?.();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onLog?.();
              }
            }}
            className="relative flex h-[30px] w-[60px] items-center justify-center rounded-[15px] bg-white/[0.12] text-[15px] font-semibold text-white transition-transform active:scale-95 before:absolute before:-inset-y-[7px] before:inset-x-0 before:content-['']"
          >
            Log
          </span>
        </span>
      ) : (
        kcal !== undefined && <Kcal value={kcal} big={nutrition} />
      )}
    </>
  );

  const base = cx("relative flex h-[72px] w-full items-center text-left select-none", className);
  const bg = { background: "var(--cravv-surface-raised)" };
  if (onPress) {
    return (
      <button type="button" onClick={onPress} className={cx(base, PRESS)} style={bg}>
        {content}
      </button>
    );
  }
  return (
    <div className={base} style={bg}>
      {content}
    </div>
  );
}

function Kcal({ value, big }: { value: number; big: boolean }) {
  const n = useCountUp(value);
  return (
    <span className={cx("mr-4 ml-3 flex shrink-0 flex-col items-end self-start", big ? "pt-[22px]" : "pt-5")}>
      <span className={cx("font-semibold tabular-nums text-white", big ? "text-[16px] leading-[19px]" : "text-[15px] leading-[18px]")}>
        {formatNumber(n)}
      </span>
      <span className={cx("text-[11px] leading-[13px]", big ? "mt-px" : "mt-0.5")} style={{ color: tertiary }}>
        kcal
      </span>
    </span>
  );
}

export type DayHeaderProps = {
  /** "Today · Tue 17" (shown in caps). */
  label: string;
  /** Day total. Ticks up when it changes. */
  kcal: number;
  className?: string;
};

/** Journal day label with the day's total (Figma Day header 2674:6293). Footnote caps, 60% white. */
export function DayHeader({ label, kcal, className }: DayHeaderProps) {
  const n = useCountUp(kcal);
  return (
    <div className={cx("flex h-5 items-center justify-between px-4 text-[12px] leading-[14px]", className)} style={{ color: secondary }}>
      <span className="truncate uppercase">{label}</span>
      <span className="ml-3 shrink-0 tabular-nums">{formatNumber(n)} kcal</span>
    </div>
  );
}
