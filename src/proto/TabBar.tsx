"use client";

/* eslint-disable @next/next/no-img-element */
/*
 * App tab bar (Figma "Tab bar", e.g. 2568:4270). Floating 362×64 pill, 12px blur, 85% #1C1C1E.
 * The active tab is a 124px pill with a filled icon in its own colour and a 15pt label; the
 * others are 76.67px with a grey icon over a 10pt label. Switching is instant, like iOS.
 * The pill widths animate with a CSS transition; icons cross-fade.
 */
import { go, TABS, type TabId } from "./nav";
import { useMotionTokens } from "./motion";

const LABEL: Record<TabId, string> = { home: "Home", nutrition: "Nutrition", journal: "Journal", profile: "Profile" };

/** Height the tab bar takes at the bottom of the screen, for screens to pad their content. */
export const TAB_BAR_SPACE = "calc(64px + 12px + max(env(safe-area-inset-bottom), 12px))";

export function TabBar({ active }: { active: TabId }) {
  const m = useMotionTokens();
  const t = (prop: string) => (m.reduced ? "none" : `${prop} ${0.35 * m.scale}s var(--ease-ios)`);
  return (
    <nav
      aria-label="Tabs"
      className="absolute inset-x-0 bottom-0 z-[70] flex justify-center px-5"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}
    >
      <div
        className="flex h-16 w-full max-w-[362px] items-center rounded-[32px] border border-white/[0.08] p-[3px]"
        style={{ background: "rgba(28,28,30,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
        role="tablist"
      >
        {TABS.map((tab) => {
          const on = tab === active;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={on}
              aria-label={LABEL[tab]}
              onClick={() => { if (!on) go(tab, { dir: "instant" }); }}
              className="relative h-14 shrink-0 overflow-hidden rounded-[28px] active:opacity-70"
              style={{
                flexGrow: on ? 0 : 1,
                flexBasis: on ? 124 : 0,
                background: on ? "rgba(255,255,255,0.1)" : "transparent",
                transition: [t("flex-basis"), t("flex-grow"), t("background-color")].join(", "),
              }}
            >
              {/* Active layout: icon left, 15pt label */}
              <span
                className="absolute inset-0 flex items-center gap-2 pl-4"
                style={{ opacity: on ? 1 : 0, transition: t("opacity") }}
                aria-hidden
              >
                <img src={`/img/tabs/${tab}-on.svg`} alt="" width={24} height={24} />
                <span className="text-[15px] font-semibold text-white">{LABEL[tab]}</span>
              </span>
              {/* Inactive layout: icon over 10pt label */}
              <span
                className="absolute inset-0 flex flex-col items-center justify-center gap-[3px] pt-px"
                style={{ opacity: on ? 0 : 1, transition: t("opacity") }}
                aria-hidden
              >
                <img src={`/img/tabs/${tab}-off.svg`} alt="" width={24} height={24} />
                <span className="text-[10px] font-medium leading-3 text-[var(--cravv-gray-400)]">{LABEL[tab]}</span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
