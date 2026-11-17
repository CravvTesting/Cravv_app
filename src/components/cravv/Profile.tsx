"use client";

import { useMotionTokens } from "@/proto/motion";
import { PrimaryButton } from "./Buttons";
import { Icon } from "./Icon";
import { optionFill } from "./options";
import { RowSeparator } from "./Settings";
import { StatusPill } from "./StatusPill";
import { cx, PRESS } from "./utils";

const secondary = "var(--cravv-text-secondary)";

/* ── Account card ─────────────────────────────────────────────────────────── */

export type AccountCardProps = {
  name: string;
  /** Default "Signed in with Apple". */
  subtitle?: string;
  /** Avatar letter; defaults to the first letter of `name`. */
  initial?: string;
  onPress?: () => void;
  className?: string;
};

/** Top of Profile (Figma Account card 2675:6150). Avatar = `--cravv-option-tab-profile-fill` with the initial. */
export function AccountCard({ name, subtitle = "Signed in with Apple", initial, onPress, className }: AccountCardProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={cx("relative flex h-[76px] w-full items-center rounded-[16px] text-left select-none", PRESS, className)}
      style={{ background: "var(--cravv-surface-raised)" }}
    >
      <span
        aria-hidden
        className="ml-3 flex size-[52px] shrink-0 items-center justify-center rounded-full text-[22px] font-semibold text-white"
        style={{ background: optionFill("tab-profile") }}
      >
        {(initial ?? name.trim().charAt(0)).toUpperCase()}
      </span>
      <span className="ml-[14px] flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[17px] font-semibold leading-[22px] text-white">{name}</span>
        <span className="mt-0.5 truncate text-[15px] leading-5" style={{ color: secondary }}>
          {subtitle}
        </span>
      </span>
      <span className="mr-[14px] ml-3 shrink-0" style={{ color: "var(--cravv-option-icon-off)" }}>
        <Icon name="chevron" size={18} />
      </span>
    </button>
  );
}

/* ── Tara card ────────────────────────────────────────────────────────────── */

export type TaraState = "online" | "offline" | "not-set-up";

export type TaraCardProps = {
  state: TaraState;
  /** Default "Tara · Kitchen". */
  name?: string;
  /** Second line. Defaults: "Ready to cook" / "Last seen 6:40 PM" (with `lastSeen`) / set-up pitch. */
  detail?: string;
  /** Offline: time for the default detail ("6:40 PM"). */
  lastSeen?: string;
  /** Offline: amber note under the detail. Pass "" to hide. */
  note?: string;
  /** Tap on the card (online/offline). */
  onPress?: () => void;
  /** Not set up: "Set Up Tara". */
  onSetUp?: () => void;
  /** Hairline above the card; a SettingsGroup hides it on the first row. Default false (it is usually first). */
  separator?: boolean;
  className?: string;
};

const OFFLINE_NOTE = "Alarms still run on Tara. Voice and phone alerts are paused until it’s back on Wi-Fi.";

/**
 * First row of the Tara group on Profile (Figma Tara card 2675:6269). Online = green pill,
 * Offline = amber pill + note, Not set up = pitch + "Set Up Tara". The pill cross-fades between
 * Online and Offline. Sits inside a <SettingsGroup> (no radius of its own).
 */
export function TaraCard({ state, name, detail, lastSeen, note, onPress, onSetUp, separator = false, className }: TaraCardProps) {
  const m = useMotionTokens();
  const fade = `opacity ${0.3 * m.scale}s ease`;
  const notSetUp = state === "not-set-up";
  const title = name ?? (notSetUp ? "Tara isn’t set up yet" : "Tara · Kitchen");
  const line =
    detail ??
    (state === "online"
      ? "Ready to cook"
      : state === "offline"
        ? `Last seen${lastSeen ? ` ${lastSeen}` : ""}`
        : "Connect it to cook with guidance and let it watch your stove.");
  const offlineNote = note ?? OFFLINE_NOTE;

  const body = (
    <>
      {separator && <RowSeparator inset={80} />}
      <div className="flex items-start">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/tabs-ui/tara.svg" alt="" width={48} height={46.619} className="ml-4 mt-[18px] h-[46.619px] w-12 shrink-0" />
        <div className={cx("ml-4 flex min-w-0 flex-1 flex-col pr-4", notSetUp ? "pt-5" : "pt-[22px]")}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-[17px] font-semibold leading-[22px] text-white">{title}</span>
              <span className={cx("mt-0.5 text-[15px] leading-5", !notSetUp && "truncate")} style={{ color: secondary }}>
                {line}
              </span>
            </div>
            {!notSetUp && (
              <span className="mt-[7px] grid shrink-0 justify-items-end">
                <span className="col-start-1 row-start-1" style={{ opacity: state === "online" ? 1 : 0, transition: fade }} aria-hidden={state !== "online"}>
                  <StatusPill tone="success">Online</StatusPill>
                </span>
                <span className="col-start-1 row-start-1" style={{ opacity: state === "offline" ? 1 : 0, transition: fade }} aria-hidden={state !== "offline"}>
                  <StatusPill tone="warning">Offline</StatusPill>
                </span>
              </span>
            )}
          </div>
          {state === "offline" && offlineNote && (
            <p className="mt-2 max-w-[250px] pb-4 text-[13px] leading-4" style={{ color: "var(--cravv-status-warning)" }}>
              {offlineNote}
            </p>
          )}
        </div>
      </div>
      {notSetUp && (
        <div className="px-4 pb-4 pt-[26px]">
          <PrimaryButton onClick={onSetUp} className="h-[50px]!">
            Set Up Tara
          </PrimaryButton>
        </div>
      )}
    </>
  );

  const cls = cx("relative flex w-full flex-col text-left select-none", !notSetUp && "min-h-[88px]", className);
  const style = { background: "var(--cravv-surface-raised)" };

  if (onPress && !notSetUp) {
    return (
      <button type="button" onClick={onPress} className={cx(cls, PRESS)} style={style}>
        {body}
      </button>
    );
  }
  return (
    <div className={cls} style={style}>
      {body}
    </div>
  );
}
