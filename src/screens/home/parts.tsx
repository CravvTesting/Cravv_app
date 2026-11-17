"use client";

/* eslint-disable @next/next/no-img-element */
/*
 * Home tab pieces (Figma "Home v2 · full scroll", 2568:3979). Layout is fluid 375–440;
 * cards in the rails keep their Figma sizes. Press feedback, rails and the toast are CSS only.
 */
import { useState, type ReactNode } from "react";
import { cx } from "@/components/cravv";
import type { Recipe } from "./data";
import s from "./home.module.css";

const imgProps = (lazy: boolean) => ({ draggable: false, decoding: "async" as const, loading: lazy ? ("lazy" as const) : undefined });

/* ---------- Header ---------- */

export function TaraPill({ pending, onSetUp }: { pending: boolean; onSetUp: () => void }) {
  const inner = (
    <>
      <img src="/img/home/tara.svg" alt="" width={28} height={27.194} className="shrink-0" />
      <span
        className="size-[7px] shrink-0 rounded-full"
        style={{ background: pending ? "var(--cravv-gray-400)" : "var(--cravv-status-success)" }}
        aria-hidden
      />
      <span className="whitespace-nowrap text-[14px] font-semibold text-white">{pending ? "Set up" : "Tara"}</span>
    </>
  );
  const cls = "flex h-9 shrink-0 items-center gap-[7px] rounded-[18px] bg-white/[0.08] pl-1 pr-3";
  if (pending) {
    return (
      <button type="button" onClick={onSetUp} className={cx(cls, s.press)} aria-label="Set up Tara">
        {inner}
      </button>
    );
  }
  return (
    <div className={cls} role="status" aria-label="Tara is connected">
      {inner}
    </div>
  );
}

export function SearchField() {
  return (
    <button
      type="button"
      className={cx("flex h-12 w-full items-center gap-2.5 rounded-[24px] bg-white/[0.08] pl-3.5 pr-3 text-left", s.press)}
      aria-label="Search dishes, ingredients, cuisines"
    >
      <img src="/img/home/search.svg" alt="" width={24} height={24} className="shrink-0" />
      <span className="min-w-0 flex-1 truncate text-[17px] text-[var(--cravv-gray-400)]">Dishes, ingredients, cuisines</span>
      <img src="/img/home/mic.svg" alt="" width={24} height={24} className="shrink-0" />
    </button>
  );
}

/* ---------- Quick actions ---------- */

export function QuickAction({ icon, title, hint }: { icon: string; title: string; hint: string }) {
  return (
    <button
      type="button"
      className={cx("flex h-[72px] min-w-0 items-center gap-2.5 rounded-[22px] bg-raised px-3 text-left", s.press)}
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-white/[0.08]">
        <img src={icon} alt="" width={24} height={24} />
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="truncate text-[15px] font-semibold leading-[18px] text-white">{title}</span>
        <span className="line-clamp-2 text-[10px] leading-[15px] text-secondary">{hint}</span>
      </span>
    </button>
  );
}

/* ---------- Sections ---------- */

/** `muted`: the action is a count ("6 recipes", F04) rather than a copper link. */
export function SectionHeader({ title, action, muted = false }: { title: string; action?: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 px-5">
      <h2 className="truncate text-[22px] font-bold leading-[26px] text-white">{title}</h2>
      {action && (
        <button
          type="button"
          className={cx("-my-2 shrink-0 py-2 text-[15px] leading-[18px]", muted ? "font-normal text-secondary" : "font-semibold text-accent", s.pressDim)}
        >
          {action}
        </button>
      )}
    </div>
  );
}

/**
 * Cross-fades its children when `k` changes: the old layer fades out while the new one fades in,
 * both in the same grid cell (opacity only). Leaving layers drop out when their animation ends.
 */
export function CrossFade({ k, children }: { k: string; children: ReactNode }) {
  const [shown, setShown] = useState<{ k: string; node: ReactNode }>({ k, node: children });
  const [leaving, setLeaving] = useState<{ k: string; node: ReactNode }[]>([]);
  if (shown.k !== k) {
    setLeaving((l) => [...l.filter((x) => x.k !== k && x.k !== shown.k), shown]);
    setShown({ k, node: children });
  }
  const first = leaving.length === 0 && shown.k === k;
  return (
    <div className={s.stack}>
      {leaving.map((l) => (
        <div key={l.k} className={s.layerOut} aria-hidden onAnimationEnd={() => setLeaving((xs) => xs.filter((x) => x.k !== l.k))}>
          {l.node}
        </div>
      ))}
      <div key={k} className={first ? undefined : s.layerIn}>
        {children}
      </div>
    </div>
  );
}

/** Shown in the rail's place when the meal plus the filters leave nothing. */
export function EmptyRail({ text, action, onAction }: { text: string; action: string; onAction: () => void }) {
  return (
    <div className="px-5">
      <div className="flex h-[160px] flex-col items-center justify-center gap-2 rounded-[28px] bg-raised px-6 text-center">
        <p className="text-[15px] leading-5 text-secondary">{text}</p>
        <button type="button" onClick={onAction} className={cx("-my-1 py-1 text-[15px] font-semibold leading-5 text-accent", s.pressDim)}>
          {action}
        </button>
      </div>
    </div>
  );
}

export function Rail({ children, label, gap = 12 }: { children: ReactNode; label: string; gap?: number }) {
  return (
    <div className={s.rail} style={{ gap }} role="group" aria-label={label}>
      {children}
    </div>
  );
}

/* ---------- For tonight ---------- */

export function TonightCard({ recipe, onCook }: { recipe: Recipe; onCook: () => void }) {
  return (
    <div
      className={cx("relative h-[350px] w-[270px] overflow-hidden rounded-[28px] bg-raised", s.press)}
    >
      <img alt="" {...imgProps(false)} src={recipe.img} width={270} height={350} className="absolute inset-0 size-full object-cover" />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, transparent 40%, rgb(0 0 0 / 0.85) 100%)" }}
        aria-hidden
      />
      {/* Whole card is a target; the Cook button sits above it. */}
      <button type="button" className="absolute inset-0" aria-label={recipe.title} />
      <div className="pointer-events-none absolute inset-x-4 bottom-4 flex flex-col">
        <h3 className="text-[24px] font-bold leading-[28px] text-white">{recipe.title}</h3>
        <p className="mt-1.5 text-[14px] leading-[17px] text-white/75">{recipe.meta}</p>
        <button
          type="button"
          onClick={onCook}
          className={cx(
            "pointer-events-auto mt-[15px] flex h-10 w-full items-center justify-center gap-2.5 rounded-[20px] bg-white text-[15px] font-semibold text-black",
            s.press,
          )}
        >
          <img src="/img/home/send.svg" alt="" width={13.5} height={13.5} />
          Cook with Tara
        </button>
      </div>
    </div>
  );
}

/* ---------- Your recipes ---------- */

export function RecipeTile({ recipe }: { recipe: Recipe }) {
  return (
    <button type="button" className={cx("flex w-[150px] flex-col text-left", s.press)}>
      <span className="relative block size-[150px] overflow-hidden rounded-[22px] bg-raised">
        <img alt="" {...imgProps(true)} src={recipe.img} width={150} height={150} className="absolute inset-0 size-full object-cover" />
        {recipe.tag && (
          <span className="absolute left-2.5 top-2.5 flex h-6 items-center rounded-xl bg-black/55 px-[9px] text-[11px] font-semibold text-white">
            {recipe.tag}
          </span>
        )}
      </span>
      <span className="mt-2.5 w-[160px] truncate pl-0.5 text-[15px] font-semibold leading-[18px] text-white">{recipe.title}</span>
      <span className="mt-1 pl-0.5 text-[12px] leading-[14px] text-secondary">{recipe.meta}</span>
    </button>
  );
}

/* ---------- Collections ---------- */

export function CollectionTile({ title, count, img }: { title: string; count: number; img: string }) {
  return (
    <button type="button" className={cx("relative h-[134px] overflow-hidden rounded-[22px] bg-raised text-left", s.press)}>
      <img alt="" {...imgProps(true)} src={img} width={175} height={134} className="absolute inset-0 size-full object-cover" />
      <span
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, transparent 20%, rgb(0 0 0 / 0.85) 100%)" }}
        aria-hidden
      />
      <span className="absolute inset-x-3.5 top-[68px] text-[17px] font-bold leading-5 text-white">{title}</span>
      <span className="absolute bottom-2.5 left-3.5 text-[12px] leading-[14px] text-white/75">{count} recipes</span>
    </button>
  );
}

/* ---------- Under 30 minutes ---------- */

export function QuickList({ items }: { items: Recipe[] }) {
  return (
    <ul className="overflow-hidden rounded-[26px] bg-raised">
      {items.map((r, i) => (
        <li key={r.id}>
          {i > 0 && <div className="ml-16 h-px" style={{ background: "color-mix(in srgb, var(--cravv-gray-600) 60%, transparent)" }} aria-hidden />}
          <button type="button" className={cx("flex h-16 w-full items-center gap-3 pl-3 pr-3.5 text-left", s.pressDim)}>
            <img alt="" {...imgProps(true)} src={r.img} width={40} height={40} className="size-10 shrink-0 rounded-xl object-cover" />
            <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
              <span className="truncate text-[17px] font-semibold leading-5 text-white">{r.title}</span>
              <span className="truncate text-[13px] leading-4 text-secondary">{r.meta}</span>
            </span>
            <img src="/img/home/chev.svg" alt="" width={18} height={18} className="shrink-0" />
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ---------- Toast ---------- */

export function Toast({ text, bottom }: { text: string; bottom: string }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 z-[65] flex justify-center px-5" style={{ bottom }}>
      <div
        role="status"
        aria-live="polite"
        className={cx(
          "flex h-11 items-center gap-2 rounded-full border border-white/[0.08] bg-secondary-surface px-5 text-[15px] font-semibold text-white shadow-[0_8px_24px_rgb(0_0_0/0.35)]",
          s.toast,
        )}
      >
        <span className="size-[7px] rounded-full bg-success" aria-hidden />
        {text}
      </div>
    </div>
  );
}
