"use client";

/*
 * N04 · Goal (2601:4503). 2×2 choice tiles → store.goal (option-goal-* tokens).
 * "Anything to watch?" multi-select chips → store.watching (option-nutrient-* tokens); these are
 * R01's watched nutrients. "Fewer carbs" has no Nutrient id in the store yet, so it is local only.
 */
import { useState } from "react";
import { Chip, ChoiceTile, Icon, SectionTitle, type IconName, type OptionToken } from "@/components/cravv";
import { go } from "@/proto/nav";
import { useProto, type Nutrient, type Tabs } from "@/proto/store";
import { SetupScreen } from "./setup/SetupScreen";

const GOALS: { id: Tabs["goal"]; label: string; hint: string; icon: IconName; token: OptionToken }[] = [
  { id: "lose", label: "Lose weight", hint: "Small daily deficit", icon: "arrow-down", token: "goal-lose" },
  { id: "maintain", label: "Maintain weight", hint: "Stay where you are", icon: "equals", token: "goal-maintain" },
  { id: "gain", label: "Gain weight", hint: "Small daily surplus", icon: "arrow-up", token: "goal-gain" },
  { id: "build-muscle", label: "Build muscle", hint: "Higher protein", icon: "dumbbell", token: "goal-build-muscle" },
];

const WATCH: { id: Nutrient | "carbs"; label: string; icon: IconName; token: OptionToken }[] = [
  { id: "protein", label: "More protein", icon: "drumstick", token: "nutrient-protein" },
  { id: "fiber", label: "More fiber", icon: "leaf", token: "nutrient-fiber" },
  { id: "sodium", label: "Less sodium", icon: "salt", token: "nutrient-sodium" },
  { id: "added-sugar", label: "Less added sugar", icon: "cube", token: "nutrient-added-sugar" },
  { id: "carbs", label: "Fewer carbs", icon: "bread", token: "nutrient-carbs" },
  { id: "saturated-fat", label: "Less saturated fat", icon: "drop", token: "nutrient-saturated-fat" },
];

export default function N04() {
  const goal = useProto((s) => s.goal);
  const watching = useProto((s) => s.watching);
  const set = useProto((s) => s.set);
  const [fewerCarbs, setFewerCarbs] = useState(false);

  const toggle = (id: Nutrient | "carbs") => {
    if (id === "carbs") return setFewerCarbs((v) => !v);
    set({ watching: watching.includes(id) ? watching.filter((w) => w !== id) : [...watching, id] });
  };

  return (
    <SetupScreen step={3} title="What’s your goal?" subtitle="Pick one. Tara sizes your calories to it." button="See My Targets" onButton={() => go("N05")}>
      <div role="radiogroup" aria-label="Goal" className="mt-[19px] grid grid-cols-2 gap-2">
        {GOALS.map((g) => (
          <ChoiceTile
            key={g.id}
            label={g.label}
            hint={g.hint}
            icon={g.icon}
            token={g.token}
            selected={goal === g.id}
            onClick={() => set({ goal: g.id })}
            className="!h-[112px] [&>span:nth-of-type(3)]:!mt-[13px] [&>span:nth-of-type(3)]:!text-[15px] [&>span:nth-of-type(3)]:!leading-5"
          />
        ))}
      </div>

      <div className="mt-[22px] flex items-baseline justify-between">
        <SectionTitle>Anything to watch?</SectionTitle>
        <span className="pr-1.5 text-[15px] text-secondary">Optional</span>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {WATCH.map((w) => {
          const on = w.id === "carbs" ? fewerCarbs : watching.includes(w.id);
          return <Chip key={w.id} label={w.label} icon={w.icon} token={w.token} state={on ? "on" : "off"} onClick={() => toggle(w.id)} />;
        })}
      </div>

      <div className="mt-[30px] flex gap-3 rounded-[16px] bg-raised py-[15px] pl-4 pr-4">
        <span className="mt-px shrink-0" style={{ color: "var(--cravv-option-feedback-tip-base)" }}>
          <Icon name="info" size={20} />
        </span>
        <p className="text-[14px] leading-[19px] text-white/75">
          Managing diabetes, blood pressure or another condition? Use the targets your clinician gave you. You can type them in next.
        </p>
      </div>
    </SetupScreen>
  );
}
