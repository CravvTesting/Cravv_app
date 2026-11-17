"use client";

/*
 * 05 · How you cook (2525:2745). Cooking for: stepper 1–8 (default 2). Units: US / Metric pill
 * segmented control. Skill: single-select choice tiles (default Comfortable).
 * As "e05" (Profile → How you cook): edit mode, back button instead of the step bar, Save → back.
 */
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { ChoiceTile, ChoiceTileGroup, Icon, PrimaryButton, SectionTitle, SegmentedControl, SKILLS, type IconName } from "@/components/cravv";
import { useMotionTokens } from "@/proto/motion";
import { back, go } from "@/proto/nav";
import { useProto } from "@/proto/store";
import { Screen, ScreenHeader } from "@/proto/ui";
import type { ScreenProps } from "./registry";

const MIN = 1;
const MAX = 8;

function Module({ icon, label, children }: { icon: IconName; label: string; children: ReactNode }) {
  return (
    <div className="flex h-[148px] min-w-0 flex-col rounded-[22px] bg-raised px-3.5 pt-[19px]">
      <Icon name={icon} size={26} style={{ color: "var(--cravv-option-icon-off)" }} />
      <p className="mt-[15px] text-[13px] leading-4 text-secondary">{label}</p>
      {children}
    </div>
  );
}

function StepButton({ label, glyph, disabled, onClick }: { label: string; glyph: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[20px] font-semibold leading-none text-white transition-[opacity,transform] select-none active:scale-90 disabled:opacity-30 disabled:active:scale-100 before:absolute before:-inset-1.5 before:content-['']"
    >
      <span aria-hidden className="-mt-0.5">{glyph}</span>
    </button>
  );
}

export default function S05({ id }: ScreenProps) {
  const edit = id === "e05";
  const m = useMotionTokens();
  const cookingFor = useProto((s) => s.cookingFor);
  const units = useProto((s) => s.units);
  const skill = useProto((s) => s.skill);
  const set = useProto((s) => s.set);

  const step = (d: 1 | -1) => set({ cookingFor: Math.min(MAX, Math.max(MIN, cookingFor + d)) });

  return (
    <Screen
      header={edit ? <ScreenHeader /> : <ScreenHeader steps={3} current={3} />}
      footer={<PrimaryButton onClick={() => (edit ? back() : go("06"))}>{edit ? "Save" : "Continue"}</PrimaryButton>}
    >
      <h1 className="text-[34px] font-bold leading-[41px] tracking-[0.4px] text-white">How do you cook?</h1>
      <p className="mt-[5px] text-[17px] leading-[22px] tracking-[-0.43px] text-secondary">Tara adjusts how much she says.</p>

      <div className="mt-[18px] grid grid-cols-2 gap-3">
        <Module icon="users" label="Cooking for">
          <div className="mt-6 flex items-center justify-between" role="group" aria-label="Cooking for">
            <StepButton label="Fewer people" glyph="−" disabled={cookingFor <= MIN} onClick={() => step(-1)} />
            <div className="relative h-[34px] min-w-0 flex-1 overflow-hidden text-center" aria-live="polite">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                  key={cookingFor}
                  className="absolute inset-0 text-[28px] font-bold leading-[34px] text-white tabular-nums"
                  initial={m.reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={m.reduced ? { opacity: 0 } : { opacity: 0, y: -14 }}
                  transition={m.reduced ? m.fade : m.spring}
                >
                  {cookingFor}
                </motion.span>
              </AnimatePresence>
              <span className="sr-only">{cookingFor === 1 ? "person" : "people"}</span>
            </div>
            <StepButton label="More people" glyph="+" disabled={cookingFor >= MAX} onClick={() => step(1)} />
          </div>
        </Module>
        <Module icon="cup" label="Units">
          <p className="mt-0.5 text-[12px] leading-4 text-white/50">{units === "us" ? "Cups · °F" : "Grams · °C"}</p>
          <SegmentedControl
            className="mt-[6px]"
            variant="pill"
            label="Units"
            value={units}
            onChange={(v) => set({ units: v })}
            options={[
              { value: "us", label: "US" },
              { value: "metric", label: "Metric" },
            ]}
          />
        </Module>
      </div>

      <SectionTitle className="mt-[17px]">In the kitchen, you are</SectionTitle>
      <ChoiceTileGroup label="In the kitchen, you are">
        {SKILLS.map((s) => (
          <ChoiceTile key={s.id} label={s.label} hint={s.hint} icon={s.icon} token={s.token} selected={skill === s.id} onClick={() => set({ skill: s.id })} />
        ))}
      </ChoiceTileGroup>
      <p className="mt-2 px-4 pb-4 text-[13px] leading-[18px] text-secondary">Family recipes in grams or cups are converted for you.</p>
    </Screen>
  );
}
