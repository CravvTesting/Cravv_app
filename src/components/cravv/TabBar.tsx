"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useMotionTokens } from "@/proto/motion";
import { Icon } from "./Icon";
import { optionBase, TABS, type TabId } from "./options";
import { cx } from "./utils";

/** Height of the floating tab bar in px (excluding the home-indicator gap below it). */
export const TAB_BAR_HEIGHT = 64;
/** Distance from the screen edges to the tab bar, px. */
export const TAB_BAR_INSET = 20;

const PAD = 3; // inset of the tabs inside the 1px border
const ACTIVE_W = 124; // active tab (icon + label in a pill)

export type TabBarProps = {
  active: TabId;
  onSelect: (tab: TabId) => void;
  className?: string;
};

/**
 * Floating tab bar (Figma Tab bar 2674:6167). Fills its container's width: place it
 * `TAB_BAR_INSET` px from the screen sides, above the home indicator.
 *
 * One pill slides between tabs (transform only). The active tab's icon moves beside its
 * label and takes `--cravv-option-tab-<tab>-base`; the others show a grey icon over a
 * small label. The bar itself uses backdrop-filter (fixed chrome only).
 */
export function TabBar({ active, onSelect, className }: TabBarProps) {
  const m = useMotionTokens();
  const ref = useRef<HTMLElement>(null);
  const [inner, setInner] = useState(360); // 362 − 2px border at 402pt; measured on mount
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setInner(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const id = requestAnimationFrame(() => setReady(true));
    return () => {
      ro.disconnect();
      cancelAnimationFrame(id);
    };
  }, []);

  const w = (inner - PAD * 2 - ACTIVE_W) / 3; // inactive tab width
  const activeIdx = TABS.findIndex((t) => t.id === active);
  const xOf = (i: number) => PAD + i * w + (i > activeIdx ? ACTIVE_W - w : 0);

  const d = ready && !m.reduced ? 0.4 * m.scale : 0;
  const move = `transform ${d}s var(--ease-ios)`;
  const fade = `opacity ${(m.reduced ? 0.2 : 0.25) * m.scale}s ease`;
  const colour = `color ${0.3 * m.scale}s ease`;

  return (
    <nav
      ref={ref}
      aria-label="Tabs"
      className={cx("relative w-full overflow-hidden rounded-[32px] border border-white/[0.08] backdrop-blur-[12px]", className)}
      style={{ height: TAB_BAR_HEIGHT, background: "color-mix(in srgb, var(--cravv-gray-900) 85%, transparent)" }}
    >
      <span
        aria-hidden
        className="absolute left-0 rounded-[28px] bg-white/10"
        style={{ top: PAD, height: 56, width: ACTIVE_W, transform: `translateX(${xOf(activeIdx)}px)`, transition: move }}
      />
      {TABS.map((t, i) => {
        const on = t.id === active;
        const iconX = on ? 16 : (w - 24) / 2;
        const iconY = on ? 16 : 9;
        return (
          <button
            key={t.id}
            type="button"
            aria-current={on ? "page" : undefined}
            onClick={() => onSelect(t.id)}
            className="absolute left-0 rounded-[28px] select-none"
            style={{ top: PAD, height: 56, width: on ? ACTIVE_W : w, transform: `translateX(${xOf(i)}px)`, transition: move }}
          >
            <span
              aria-hidden
              className="absolute left-0 top-0"
              style={{
                color: on ? optionBase(t.token) : "var(--cravv-option-icon-off)",
                transform: `translate(${iconX}px, ${iconY}px)`,
                transition: `${move}, ${colour}`,
              }}
            >
              <Icon name={t.icon} size={24} />
            </span>
            <span
              className="absolute left-12 top-[18px] text-[15px] font-semibold leading-[18px] whitespace-nowrap text-white"
              style={{ opacity: on ? 1 : 0, transition: fade }}
              aria-hidden
            >
              {t.label}
            </span>
            <span
              className="absolute left-0 top-9 text-center text-[10px] font-medium leading-3 whitespace-nowrap"
              style={{ width: w, color: "var(--cravv-option-icon-off)", opacity: on ? 0 : 1, transition: fade }}
              aria-hidden
            >
              {t.label}
            </span>
            <span className="sr-only">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
