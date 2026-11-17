"use client";

/*
 * 14b · All set, first cook (frame 2539:2801). Alternative ending with a suggested first recipe.
 * "Picked for you" reflects the diet, allergies and cookingFor from 04/05. Every action ends onboarding.
 */
import { motion } from "motion/react";
import { ALLERGIES, DIETS, PrimaryButton, StatusPill, TextButton } from "@/components/cravv";
import { useMotionTokens } from "@/proto/motion";
import { useProto } from "@/proto/store";
import { Screen } from "@/proto/ui";
import { finishOnboarding } from "./calib/finish";

/* eslint-disable @next/next/no-img-element */

const label = (list: readonly { id: string; label: string }[], id: string) =>
  (list.find((o) => o.id === id)?.label ?? id).toLowerCase();

function joinOr(items: string[]) {
  return items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} or ${items[items.length - 1]}`;
}

/** "vegetarian, no peanuts, serves 2" */
function pickedFor(diet: string[], allergies: string[], cookingFor: number) {
  const parts: string[] = [];
  const diets = diet.filter((d) => d !== "everything").map((d) => label(DIETS, d));
  if (diets.length) parts.push(diets.join(", "));
  const avoid = allergies.filter((a) => a !== "other").map((a) => label(ALLERGIES, a));
  if (avoid.length) parts.push(`no ${joinOr(avoid)}`);
  parts.push(`serves ${cookingFor}`);
  return parts.join(", ");
}

/** The frame shows Chicken Tacos next to "vegetarian"; keep the recipe consistent with the diet. */
function recipeFor(diet: string[]) {
  if (diet.includes("vegan") || diet.includes("vegetarian")) return "Black Bean Tacos";
  if (diet.includes("pescatarian")) return "Fish Tacos";
  return "Chicken Tacos";
}

const WHILE_YOU_COOK = [
  { icon: "icon-eye.svg", text: "Watches the pan, so you don’t have to" },
  { icon: "icon-timer.svg", text: "Times every step on her own" },
  { icon: "icon-mic-small.svg", text: "Talks you through it, hands free" },
];

export default function S14b() {
  const m = useMotionTokens();
  const burners = useProto((s) => s.burners);
  const diet = useProto((s) => s.diet);
  const allergies = useProto((s) => s.allergies);
  const cookingFor = useProto((s) => s.cookingFor);

  const enter = (i: number) => ({
    initial: { opacity: 0, y: m.reduced ? 0 : 14 },
    animate: { opacity: 1, y: 0 },
    transition: m.reduced ? m.fade : { type: "spring" as const, duration: 0.5 * m.scale, bounce: 0.15, delay: (0.05 + i * 0.07) * m.scale },
  });

  return (
    <Screen
      footer={
        <motion.div className="flex flex-col gap-1" {...enter(6)}>
          <PrimaryButton onClick={finishOnboarding}>Send to Tara</PrimaryButton>
          <TextButton onClick={finishOnboarding}>Cook Later</TextButton>
        </motion.div>
      }
    >
      <div className="pb-4">
        <motion.div className="mt-1" {...enter(0)}>
          <StatusPill tone="success">
            {burners === 1 ? "Tara is set up · watching 1 burner" : `Tara is set up · watching ${burners} burners`}
          </StatusPill>
        </motion.div>
        <motion.h1 className="mt-3 text-[34px] font-bold leading-[41px] tracking-[0.4px]" {...enter(1)}>
          Your first cook
        </motion.h1>
        <motion.p className="mt-[5px] text-[15px] leading-[18px] text-secondary" {...enter(1)}>
          Picked for you: {pickedFor(diet, allergies, cookingFor)}.
        </motion.p>

        {/* Recipe card */}
        <motion.button
          type="button"
          onClick={finishOnboarding}
          className="mt-[18px] block w-full overflow-hidden rounded-[26px] bg-raised text-left active:opacity-90"
          {...enter(2)}
        >
          <div className="relative h-[190px]">
            <img src="/img/calib/dish-first-cook.webp" alt="" className="absolute inset-0 size-full object-cover" />
            <span className="absolute left-3.5 top-3.5 flex h-[26px] items-center rounded-[13px] bg-black/50 px-2.5 text-[12px] font-semibold text-white backdrop-blur-[7px]">
              Good first recipe
            </span>
          </div>
          <div className="px-4 pb-3.5">
            <p className="mt-3.5 text-[22px] font-bold leading-[26px] text-white">{recipeFor(diet)}</p>
            <p className="mt-1 text-[15px] leading-[18px] text-secondary">25 min · 10 min hands-on · Mexican</p>
            <div aria-hidden className="mt-3.5 h-px bg-[rgba(84,84,88,0.6)]" />
            <p className="mt-3 text-[13px] leading-[18px]" style={{ color: "rgba(235,235,245,0.7)" }}>
              Tara watches the pan and tells you when the onions are golden.
            </p>
          </div>
        </motion.button>

        {/* While you cook */}
        <motion.div className="mt-3 rounded-[26px] bg-raised px-4 pb-3.5 pt-3.5" {...enter(3)}>
          <p className="text-[11px] font-semibold uppercase leading-[13px]" style={{ color: "rgba(235,235,245,0.45)" }}>
            While you cook
          </p>
          <ul className="mt-2.5 flex flex-col gap-3">
            {WHILE_YOU_COOK.map((r) => (
              <li key={r.text} className="flex items-center gap-2.5">
                <img src={`/img/calib/${r.icon}`} alt="" width={18} height={18} className="shrink-0" />
                <span className="text-[15px] leading-[18px] text-white">{r.text}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* More picks */}
        <motion.button
          type="button"
          onClick={finishOnboarding}
          className="mt-3 flex h-[60px] w-full items-center rounded-[20px] bg-raised pl-3 pr-4 text-left active:opacity-80"
          {...enter(4)}
        >
          <span className="relative h-9 w-16 shrink-0">
            <img src="/img/calib/pick-1.webp" alt="" className="absolute left-0 top-0 size-9 rounded-[10px] border-2 border-raised object-cover" />
            <img src="/img/calib/pick-2.webp" alt="" className="absolute left-7 top-0 size-9 rounded-[10px] border-2 border-raised object-cover" />
          </span>
          <span className="ml-3 flex-1 text-[17px] text-white">2 more picks for you</span>
          <img src="/img/calib/icon-chev.svg" alt="" width={18} height={18} className="shrink-0" />
        </motion.button>
      </div>
    </Screen>
  );
}
