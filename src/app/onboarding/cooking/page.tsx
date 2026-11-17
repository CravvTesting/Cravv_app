"use client";

import { useRouter } from "next/navigation";
import { Actions, Footnote, PrimaryButton, Screen, Subtitle, Title, TopBar, cx } from "@/components/ui";
import { Glyph26, IMG, PSectionTitle, ScrollBody } from "@/components/personalise";
import { useHydrated, useOnboarding, type Skill } from "@/lib/store";

const SKILL_COLOR = "#BC8101";
const SKILLS: { id: Skill; title: string; desc: string; icon: string }[] = [
  { id: "new", title: "New", desc: "Every step explained", icon: "icon-sprout-26" },
  { id: "comfortable", title: "Comfortable", desc: "Skips the basics", icon: "icon-chef" },
  { id: "confident", title: "Confident", desc: "Key moments only", icon: "icon-flame" },
];

function StepButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled: boolean; children: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex size-8 items-center justify-center rounded-full bg-white/10 text-[20px] font-semibold leading-none text-white transition active:scale-90 disabled:opacity-30"
    >
      {children}
    </button>
  );
}

/** 05 · How you cook */
export default function CookingPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const store = useOnboarding();
  const servings = hydrated ? store.servings : 2;
  const units = hydrated ? store.units : "us";
  const skill = hydrated ? store.skill : "comfortable";
  const setServings = (n: number) => store.set({ servings: Math.min(12, Math.max(1, n)) });

  return (
    <Screen className="h-dvh">
      <TopBar step={3} />
      <ScrollBody>
        <Title className="mt-1">How do you cook?</Title>
        <Subtitle className="mt-[5px]">Tara adjusts how much she says.</Subtitle>

        <div className="mt-[18px] grid shrink-0 grid-cols-2 gap-3">
          <div className="flex h-[148px] flex-col rounded-[22px] bg-surface px-[14px] pt-[19px]">
            <Glyph26 src={`${IMG}/icon-users.svg`} />
            <p className="mt-[15px] text-[13px] leading-[16px] text-label-2">Cooking for</p>
            <div className="mt-auto mb-4 flex items-center justify-between">
              <StepButton label="Fewer people" onClick={() => setServings(servings - 1)} disabled={servings <= 1}>−</StepButton>
              <span className="text-[28px] font-bold leading-none tabular-nums text-white" aria-live="polite">{servings}</span>
              <StepButton label="More people" onClick={() => setServings(servings + 1)} disabled={servings >= 12}>+</StepButton>
            </div>
          </div>

          <div className="flex h-[148px] flex-col rounded-[22px] bg-surface px-[14px] pt-[19px]">
            <Glyph26 src={`${IMG}/icon-cup.svg`} />
            <p className="mt-[15px] text-[13px] leading-[16px] text-label-2">Units</p>
            <p className="mt-[2px] text-[12px] leading-[14px] text-[rgba(235,235,245,0.5)]">{units === "us" ? "Cups · °F" : "Grams · °C"}</p>
            <div role="radiogroup" aria-label="Units" className="relative mt-auto mb-4 grid h-8 grid-cols-2 rounded-2xl bg-white/10 p-0.5">
              <span
                aria-hidden
                className="absolute bottom-0.5 left-0.5 top-0.5 w-[calc(50%-2px)] rounded-[14px] bg-white transition-transform duration-200 ease-out"
                style={{ transform: units === "metric" ? "translateX(100%)" : "none" }}
              />
              {(["us", "metric"] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  role="radio"
                  aria-checked={units === u}
                  onClick={() => store.set({ units: u })}
                  className={cx("relative z-10 text-[13px] transition-colors", units === u ? "font-semibold text-black" : "text-white")}
                >
                  {u === "us" ? "US" : "Metric"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <PSectionTitle className="mt-2">In the kitchen, you are</PSectionTitle>
        <div role="radiogroup" aria-label="Cooking skill" className="grid shrink-0 grid-cols-3 gap-[7px]">
          {SKILLS.map((s) => {
            const on = skill === s.id;
            return (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => store.set({ skill: s.id })}
                className={cx("flex h-[136px] flex-col items-start rounded-[20px] px-3 pt-[17px] text-left transition-[background-color,transform] duration-150 active:scale-[0.97]", !on && "bg-surface")}
                style={on ? { backgroundColor: SKILL_COLOR } : undefined}
              >
                <Glyph26 src={`${IMG}/${s.icon}-${on ? "on" : "off"}.svg`} />
                <span className="mt-[19px] text-[13px] font-semibold leading-[16px] text-white">{s.title}</span>
                <span className={cx("mt-[6px] max-w-[94px] text-[12px] leading-[16px]", on ? "text-white/90" : "text-label-2")}>{s.desc}</span>
              </button>
            );
          })}
        </div>

        <Footnote className="mt-2">Family recipes in grams or cups are converted for you.</Footnote>
      </ScrollBody>
      <Actions>
        <PrimaryButton onClick={() => router.push("/setup")}>Continue</PrimaryButton>
      </Actions>
    </Screen>
  );
}
