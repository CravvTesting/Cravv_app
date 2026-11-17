"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useMotionTokens } from "@/proto/motion";
import { Icon } from "./Icon";
import { NUTRIENTS, optionBase, type NutrientId } from "./options";
import { RowSeparator } from "./Settings";
import { formatNumber, useCountUp } from "./useCountUp";
import { cx, PRESS } from "./utils";

const secondary = "var(--cravv-text-secondary)";

/* ── Bar ──────────────────────────────────────────────────────────────────── */

/**
 * 6px progress bar. The fill is a full-width bar slid in with translateX inside a clipped track,
 * so changes animate on the compositor and the rounded end stays round.
 */
export function ProgressBar({ value, color, className }: { value: number; color: string; className?: string }) {
  const m = useMotionTokens();
  const p = Math.min(1, Math.max(0, value));
  const [shown, setShown] = useState(m.reduced ? p : 0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(p));
    return () => cancelAnimationFrame(id);
  }, [p]);
  return (
    <span aria-hidden className={cx("relative block h-1.5 overflow-hidden rounded-[3px] bg-white/10", className)}>
      <span
        className="absolute inset-0 rounded-[3px]"
        style={{
          background: color,
          transform: `translateX(${(shown - 1) * 100}%)`,
          transition: `transform ${(m.reduced ? 0 : 0.7) * m.scale}s var(--ease-ios)`,
        }}
      />
    </span>
  );
}

/* ── Nutrient row ─────────────────────────────────────────────────────────── */

export type NutrientRowProps = {
  nutrient: NutrientId;
  value: number;
  target: number;
  /** Defaults to the nutrient's unit (g, mg). */
  unit?: string;
  /** "min" = reach it (fiber), "limit" = stay under (sodium). Defaults per nutrient. */
  kind?: "min" | "limit";
  /** Status line. Default: "12 g to go" / "Target met" / "Well under the limit" / "300 mg over the limit". */
  status?: string;
  /** Override the label ("Fiber"). */
  label?: string;
  /** Hairline above the row (inset 52); a SettingsGroup hides it on the first row. */
  separator?: boolean;
  className?: string;
};

/**
 * A watched nutrient (Figma Nutrient row 2675:6100), 66px. Icon and bar take
 * `--cravv-option-nutrient-<id>-base`. Over a limit the status line turns `--cravv-status-warning`
 * (the bar keeps its colour).
 */
export function NutrientRow({ nutrient, value, target, unit, kind, status, label, separator = true, className }: NutrientRowProps) {
  const n = NUTRIENTS.find((x) => x.id === nutrient)!;
  const u = unit ?? n.unit;
  const k = kind ?? n.kind;
  const over = k === "limit" && value > target;
  const defaultStatus =
    k === "min"
      ? value >= target
        ? "Target met"
        : `${formatNumber(target - value)} ${u} to go`
      : over
        ? `${formatNumber(value - target)} ${u} over the limit`
        : value > target * 0.8
          ? `${formatNumber(target - value)} ${u} left`
          : "Well under the limit";
  return (
    <div className={cx("relative h-[66px] w-full", className)} style={{ background: "var(--cravv-surface-raised)" }}>
      {separator && <RowSeparator inset={52} />}
      <span className="absolute left-4 top-[14px]" style={{ color: optionBase(n.token) }}>
        <Icon name={n.icon} size={22} />
      </span>
      <div className="absolute left-[52px] right-4 top-3 flex items-baseline justify-between gap-3">
        <span className="truncate text-[16px] font-semibold leading-[19px] text-white">{label ?? n.label}</span>
        <span className="shrink-0 text-[14px] leading-[17px] tabular-nums" style={{ color: "rgb(235 235 245 / 0.75)" }}>
          {formatNumber(value)} / {formatNumber(target)} {u}
        </span>
      </div>
      <div className="absolute left-[52px] right-4 top-[38px]">
        <ProgressBar value={value / target} color={optionBase(n.token)} />
      </div>
      <span
        className="absolute left-[52px] right-4 top-12 truncate text-[12px] leading-[14px]"
        style={{ color: over ? "var(--cravv-status-warning)" : secondary }}
      >
        {status ?? defaultStatus}
      </span>
    </div>
  );
}

/* ── Macro ring card ──────────────────────────────────────────────────────── */

type Macro = { value: number; target: number };
export type MacroRingCardProps = {
  kcalTarget: number;
  kcalEaten: number;
  /** Grams eaten and targeted. Ring segments = macro kcal (4/4/9 per g) as a share of `kcalTarget`. */
  macros: { protein: Macro; carbs: Macro; fat: Macro };
  className?: string;
};

const MACROS = [
  { id: "protein", label: "Protein", kcalPerG: 4 },
  { id: "carbs", label: "Carbs", kcalPerG: 4 },
  { id: "fat", label: "Fat", kcalPerG: 9 },
] as const;

const RING = 150;
const SW = 12;
const RR = (RING - SW) / 2; // 69
const CIRC = 2 * Math.PI * RR;
const GAP = 2.5; // px of arc between segments

/**
 * Today summary (Figma Macro ring card 2675:6122). The ring splits the eaten kcal by protein,
 * carbs and fat in their nutrient colours; the centre shows kcal left ("over" in amber).
 * First mount: segments draw clockwise in macro order and the number counts down from the target.
 * Later changes: segments ease to their new arcs and the number counts.
 */
export function MacroRingCard({ kcalTarget, kcalEaten, macros, className }: MacroRingCardProps) {
  const m = useMotionTokens();
  const [drawn, setDrawn] = useState(m.reduced);
  const [firstDraw, setFirstDraw] = useState(!m.reduced);
  useEffect(() => {
    // Two frames so the 0-length state paints before the draw starts.
    let id2 = 0;
    const id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => setDrawn(true));
    });
    const done = setTimeout(() => setFirstDraw(false), 1500 * m.scale);
    return () => {
      cancelAnimationFrame(id1);
      cancelAnimationFrame(id2);
      clearTimeout(done);
    };
  }, [m.scale]);

  const kcals = MACROS.map((x) => macros[x.id].value * x.kcalPerG);
  const total = kcals.reduce((a, b) => a + b, 0);
  const fit = total > kcalTarget ? kcalTarget / total : 1; // over target: segments share the full circle
  const fracs = kcals.map((k) => (k / kcalTarget) * fit);

  const left = kcalTarget - kcalEaten;
  const over = left < 0;
  const shownLeft = useCountUp(Math.abs(left), { from: kcalTarget, duration: 0.9 });

  const DRAW = 0.9 * m.scale; // whole-ring draw time on first mount
  let start = 0;
  const segs = fracs.map((f, i) => {
    const len = Math.max(0, f * CIRC - (f > 0 ? GAP : 0));
    const seg = { id: MACROS[i].id, start, len, frac: f };
    start += f;
    return seg;
  });

  return (
    <div
      className={cx("relative flex h-[200px] w-full items-center rounded-[24px] pl-4 pr-4", className)}
      style={{ background: "var(--cravv-surface-raised)" }}
    >
      <div className="relative shrink-0" style={{ width: RING, height: RING }}>
        <svg width={RING} height={RING} viewBox={`0 0 ${RING} ${RING}`} aria-hidden className="block">
          <circle cx={RING / 2} cy={RING / 2} r={RR} fill="none" stroke="white" strokeOpacity={0.1} strokeWidth={SW} />
          {segs.map((s) => {
            const isFirst = firstDraw;
            const delay = isFirst ? s.start * DRAW : 0;
            const dur = isFirst ? Math.max(0.05, s.frac * DRAW) : 0.6 * m.scale;
            const ease = isFirst ? "linear" : "var(--ease-ios)";
            return (
              <circle
                key={s.id}
                cx={RING / 2}
                cy={RING / 2}
                r={RR}
                fill="none"
                stroke={optionBase(`nutrient-${s.id}`)}
                strokeWidth={SW}
                strokeDasharray={`${CIRC} ${CIRC}`}
                strokeDashoffset={CIRC - (drawn ? s.len : 0)}
                style={{
                  transformOrigin: `${RING / 2}px ${RING / 2}px`,
                  transform: `rotate(${s.start * 360 - 90}deg)`,
                  transition: m.reduced
                    ? "none"
                    : `stroke-dashoffset ${dur}s ${ease} ${delay}s, transform ${0.6 * m.scale}s var(--ease-ios)`,
                }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-px">
          <span
            className="text-[30px] font-bold leading-9 tabular-nums"
            style={{ color: over ? "var(--cravv-status-warning)" : "var(--cravv-text-primary)" }}
          >
            {formatNumber(shownLeft)}
          </span>
          <span className="text-[12px] leading-[14px]" style={{ color: over ? "var(--cravv-status-warning)" : secondary }}>
            {over ? "kcal over" : "kcal left"}
          </span>
        </div>
      </div>
      <div className="ml-5 flex min-w-0 flex-1 flex-col gap-[26px] pt-px">
        {MACROS.map((x) => {
          const v = macros[x.id];
          return (
            <div key={x.id} className="flex flex-col">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[15px] leading-[18px] text-white">{x.label}</span>
                <span className="shrink-0 text-[13px] leading-4 tabular-nums" style={{ color: secondary }}>
                  {formatNumber(v.value)} / {formatNumber(v.target)} g
                </span>
              </div>
              <ProgressBar value={v.value / v.target} color={optionBase(`nutrient-${x.id}`)} className="mt-2" />
            </div>
          );
        })}
      </div>
      <span className="sr-only">
        {over ? `${formatNumber(-left)} kcal over` : `${formatNumber(left)} kcal left`} of {formatNumber(kcalTarget)}.
      </span>
    </div>
  );
}

/* ── Tip note ─────────────────────────────────────────────────────────────── */

export type TipNoteProps = {
  children: ReactNode;
  /** Copper text link under the text ("See Recipe"). */
  linkLabel?: string;
  onLink?: () => void;
  /** Or any custom action (e.g. a small button) in place of the link. */
  action?: ReactNode;
  className?: string;
};

/** Info note with an optional copper link (Figma Tip note 2675:6130). Info icon in `--cravv-option-feedback-tip-base`. */
export function TipNote({ children, linkLabel, onLink, action, className }: TipNoteProps) {
  return (
    <div className={cx("flex w-full gap-3 rounded-[16px] py-[14px] pl-4 pr-4", className)} style={{ background: "var(--cravv-surface-raised)" }}>
      <span className="mt-0.5 shrink-0" style={{ color: optionBase("feedback-tip") }}>
        <Icon name="info" size={20} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col items-start">
        <p className="text-[14px] leading-[19px]" style={{ color: "rgb(235 235 245 / 0.85)" }}>
          {children}
        </p>
        {action ??
          (linkLabel && (
            <button
              type="button"
              onClick={onLink}
              className="relative mt-1 text-[14px] font-semibold leading-[17px] active:opacity-60 before:absolute before:-inset-x-2 before:-inset-y-3 before:content-['']"
              style={{ color: "var(--cravv-text-accent)" }}
            >
              {linkLabel}
            </button>
          ))}
      </div>
    </div>
  );
}

/* ── Targets row ──────────────────────────────────────────────────────────── */

export type TargetsRowProps = {
  /** "1,900 kcal". */
  value: string;
  label?: string;
  /** Targets set: target icon in `--cravv-status-success` (true). Not set: grey. Default true. */
  set?: boolean;
  onPress?: () => void;
  className?: string;
};

/** Last row on Nutrition, opens R08 (Figma Targets row 2675:6140). */
export function TargetsRow({ value, label = "Your targets", set = true, onPress, className }: TargetsRowProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={cx("relative flex h-14 w-full items-center rounded-[16px] text-left select-none", PRESS, className)}
      style={{ background: "var(--cravv-surface-raised)" }}
    >
      <span className="ml-4 shrink-0" style={{ color: set ? "var(--cravv-status-success)" : "var(--cravv-option-icon-off)" }}>
        <Icon name="target" size={22} />
      </span>
      <span className="ml-[14px] min-w-0 flex-1 truncate text-[17px] leading-[22px] text-white">{label}</span>
      <span className="ml-3 shrink-0 text-[17px] leading-[22px]" style={{ color: secondary }}>
        {value}
      </span>
      <span className="mr-4 ml-2 shrink-0" style={{ color: "var(--cravv-option-icon-off)" }}>
        <Icon name="chevron" size={14} />
      </span>
    </button>
  );
}
