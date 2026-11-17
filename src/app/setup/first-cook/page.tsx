/* eslint-disable @next/next/no-img-element */
"use client";

import { Actions, PrimaryButton, Screen, TextButton } from "@/components/ui";
import { StatusPill, StickyActions } from "@/components/stove/parts";
import { useFinishOnboarding } from "@/components/stove/finish";
import { useHydrated, useOnboarding } from "@/lib/store";
import { pickFirstRecipe, pickedForYou } from "@/lib/sim/stove";

const WHILE_YOU_COOK = [
  { icon: "/img/stove/icon-eye.svg", text: "Watches the pan, so you don’t have to" },
  { icon: "/img/stove/icon-timer.svg", text: "Times every step on her own" },
  { icon: "/img/stove/icon-mic-small.svg", text: "Talks you through it, hands free" },
];

/** 14b · All set · first cook. "Send to Tara" opens the recipe on the display (simulated). */
export default function FirstCook() {
  const hydrated = useHydrated();
  const s = useOnboarding();
  const finish = useFinishOnboarding();
  const recipe = pickFirstRecipe(s.diet);

  return (
    <Screen>
      <div className="pt-[max(env(safe-area-inset-top),12px)]" />
      {hydrated && (
        <div className="animate-fade-up mt-2 flex flex-col">
          <StatusPill>Tara is set up · watching {s.device.burners} burners</StatusPill>
          <h1 className="mt-3 text-[34px] font-bold leading-[41px] text-white">Your first cook</h1>
          <p className="mt-[5px] text-[15px] leading-[18px] text-label-2">
            Picked for you: {pickedForYou(s.diet, s.allergies, s.servings)}.
          </p>

          <article className="mt-[18px] overflow-hidden rounded-card bg-surface">
            <div className="relative h-[190px]">
              <img src={recipe.image} alt={recipe.name} className="absolute inset-0 size-full object-cover" />
              <span className="absolute left-3.5 top-3.5 flex h-[26px] items-center rounded-[13px] bg-black/50 px-2.5 text-[12px] font-semibold text-white backdrop-blur-[7px]">
                Good first recipe
              </span>
            </div>
            <div className="px-4 pb-1 pt-3.5">
              <h2 className="text-[22px] font-bold leading-[26px] text-white">{recipe.name}</h2>
              <p className="mt-1 text-[15px] leading-[18px] text-label-2">
                {recipe.time} · {recipe.handsOn} · {recipe.cuisine}
              </p>
              <div className="mt-3.5 h-px bg-[rgba(84,84,88,0.6)]" />
              <p className="mt-[11px] text-[13px] leading-[18px] text-[rgba(235,235,245,0.7)]">
                Tara watches the pan and tells you when the onions are golden.
              </p>
            </div>
          </article>

          <section className="mt-3 rounded-card bg-surface px-4 pb-4 pt-3.5">
            <h3 className="text-[11px] font-semibold uppercase leading-[13px] text-[rgba(235,235,245,0.45)]">While you cook</h3>
            <ul className="mt-[11px] flex flex-col gap-3">
              {WHILE_YOU_COOK.map((r) => (
                <li key={r.text} className="flex items-center gap-[10px]">
                  <img src={r.icon} alt="" width={18} height={18} className="shrink-0" />
                  <span className="text-[15px] leading-[18px] text-white">{r.text}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-3 flex h-[60px] items-center rounded-[20px] bg-surface pl-3 pr-3.5">
            <div className="flex shrink-0">
              <img src="/img/stove/pick-1.png" alt="" width={36} height={36} className="size-9 rounded-[10px] border-2 border-surface object-cover" />
              <img src="/img/stove/pick-2.png" alt="" width={36} height={36} className="-ml-2 size-9 rounded-[10px] border-2 border-surface object-cover" />
            </div>
            <span className="ml-3 flex-1 text-[17px] text-white">2 more picks for you</span>
            <img src="/img/stove/icon-chev.svg" alt="" width={18} height={18} className="shrink-0" />
          </div>
        </div>
      )}

      <StickyActions>
        <Actions className="pt-[18px]!">
          <PrimaryButton onClick={finish}>Send to Tara</PrimaryButton>
          <TextButton onClick={finish}>Cook Later</TextButton>
        </Actions>
      </StickyActions>
    </Screen>
  );
}
