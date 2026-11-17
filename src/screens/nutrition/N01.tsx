"use client";

/*
 * N01 · Nutrition · first open (2601:3864). Shown while nutritionSetup is false (rootOf("nutrition")).
 * Set My Targets → N02. "Use standard targets" (Skip) → 2,000 kcal targets, setup done, R01 in place.
 */
import { Icon, PrimaryButton, SectionTitle, SettingsGroup, optionBase } from "@/components/cravv";
import { go } from "@/proto/nav";
import { useProto } from "@/proto/store";
import { LargeTitleScreen } from "@/proto/ui";
import { STANDARD_TARGETS } from "./setup/calc";
import { RowSep, TargetRing } from "./setup/parts";

const BENEFITS = [
  { icon: "target", color: "var(--cravv-status-success)", title: "Targets made for you", hint: "From your age, size, activity and goal" },
  { icon: "salt", color: optionBase("nutrient-sodium"), title: "Flags for what you watch", hint: "Sodium, added sugar, fiber and more" },
  { icon: "bolt", color: optionBase("nutrient-carbs"), title: "Fills in as you cook", hint: "Tara logs each recipe. No food diary." },
] as const;

export default function N01() {
  const set = useProto((s) => s.set);

  const skip = () => {
    // Standard 2,000 kcal day: 75 g protein, 275 g carbs, 67 g fat. Not calculated, so mode "custom".
    set({ targets: { ...STANDARD_TARGETS, mode: "custom" }, nutritionSetup: true });
    go("R01", { replace: true, dir: "none" });
  };

  return (
    <LargeTitleScreen tabRoot
      title="Nutrition"
      subtitle="Targets sized to you, tracked from every cook."
      footer={
        <div className="flex flex-col items-center">
          <PrimaryButton onClick={() => go("N02")}>Set My Targets</PrimaryButton>
          <button type="button" onClick={skip} className="mt-1 h-11 w-full text-[15px] font-semibold text-copper">
            Use standard targets (2,000 kcal)
          </button>
        </div>
      }
    >
      {/* Preview */}
      <div className="-mt-1 rounded-[24px] bg-raised px-4 pb-3.5 pt-[22px]">
        <div className="flex items-start">
          <div className="ml-3">
            <TargetRing size={112} stroke={10} shares={{ protein: 0.18, carbs: 0.52, fat: 0.3 }} dim>
              <Icon name="flame" size={30} style={{ color: "var(--cravv-orange-500)" }} />
            </TargetRing>
          </div>
          <div className="ml-4 min-w-0 flex-1 pt-3">
            <p className="text-[17px] font-semibold leading-[22px] text-white">Your daily targets</p>
            <p className="mt-0.5 text-[13px] leading-[18px] text-secondary">Calories, protein, carbs and fat, sized to your body and goal.</p>
          </div>
        </div>
        <div className="relative mt-3 grid grid-cols-3 pt-2.5">
          <span aria-hidden className="absolute inset-x-0 top-0 h-px scale-y-50 bg-white/[0.12]" />
          {[
            ["Protein", "— g"],
            ["Fiber", "— g"],
            ["Sodium", "— mg"],
          ].map(([l, v]) => (
            <div key={l}>
              <p className="text-[12px] leading-4 text-secondary">{l}</p>
              <p className="text-[15px] font-semibold leading-5 text-white/35">{v}</p>
            </div>
          ))}
        </div>
      </div>

      <SectionTitle className="mt-[18px]">What you get</SectionTitle>
      <SettingsGroup className="mt-0">
        {BENEFITS.map((b) => (
          <div key={b.title} className="relative flex h-[62px] items-center">
            <RowSep inset={64} />
            <span className="ml-5 shrink-0" style={{ color: b.color }}>
              <Icon name={b.icon} size={28} />
            </span>
            <div className="ml-4 min-w-0">
              <p className="truncate text-[16px] font-semibold leading-5 text-white">{b.title}</p>
              <p className="mt-px truncate text-[13px] leading-4 text-secondary">{b.hint}</p>
            </div>
          </div>
        ))}
      </SettingsGroup>

      <div className="mt-[15px] flex gap-2">
        <span className="mt-px shrink-0" style={{ color: "var(--cravv-option-icon-off)" }}>
          <Icon name="lock" size={16} />
        </span>
        <p className="text-[13px] leading-4 text-secondary">Your answers stay in your account. Never sold or shared.</p>
      </div>
    </LargeTitleScreen>
  );
}
