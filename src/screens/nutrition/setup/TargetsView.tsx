"use client";

/*
 * N05 body ("Your daily targets", 2604:3943). Shared with N05b, which draws its sheet over it.
 */
import { Icon, SectionTitle, SettingsGroup, formatNumber, optionBase, type IconName, type OptionToken } from "@/components/cravv";
import { back, go } from "@/proto/nav";
import { useProto, type Nutrient } from "@/proto/store";
import { computePlan, type Plan } from "./calc";
import { RowSep, TargetRing } from "./parts";
import { SetupScreen } from "./SetupScreen";

export function usePlan(): Plan {
  const body = useProto((s) => s.body);
  const activity = useProto((s) => s.activity);
  const goal = useProto((s) => s.goal);
  return computePlan(body, activity, goal);
}

export function TargetsView({ onHow }: { onHow?: () => void }) {
  const plan = usePlan();
  const watching = useProto((s) => s.watching);
  const set = useProto((s) => s.set);

  const start = () => {
    set({ targets: { kcal: plan.kcal, protein: plan.protein, carbs: plan.carbs, fat: plan.fat, mode: "forYou" } });
    go("N06");
  };

  const macros = [
    { id: "protein", label: "Protein", g: plan.protein, pct: plan.pct.protein },
    { id: "carbs", label: "Carbs", g: plan.carbs, pct: plan.pct.carbs },
    { id: "fat", label: "Fat", g: plan.fat, pct: plan.pct.fat },
  ] as const;

  const limits: { id: Nutrient; label: string; icon: IconName; token: OptionToken; value: string; min: boolean; hint: string }[] = [
    { id: "fiber", label: "Fiber", icon: "leaf", token: "nutrient-fiber", value: `${plan.fiber} g`, min: true, hint: "aim for at least" },
    { id: "sodium", label: "Sodium", icon: "salt", token: "nutrient-sodium", value: `${formatNumber(plan.sodium)} mg`, min: false, hint: "keep under" },
    { id: "added-sugar", label: "Added sugar", icon: "cube", token: "nutrient-added-sugar", value: `${plan.addedSugar} g`, min: false, hint: "keep under, per meal" },
    { id: "saturated-fat", label: "Saturated fat", icon: "drop", token: "nutrient-saturated-fat", value: `${plan.saturatedFat} g`, min: false, hint: "keep under" },
  ];
  if (watching.includes("protein")) {
    limits.unshift({ id: "protein", label: "Protein", icon: "drumstick", token: "nutrient-protein", value: `${plan.protein} g`, min: true, hint: "aim for at least" });
  }

  return (
    <SetupScreen
      title="Your daily targets"
      subtitle={
        <>
          <p>Based on US Dietary Guidelines, 2025–2030.</p>
          <button type="button" onClick={onHow} className="-my-2.5 h-11 text-[15px] font-semibold text-copper">
            How we worked this out
          </button>
        </>
      }
      button="Start Tracking"
      onButton={start}
    >
      <div className="mt-[14px] flex h-[196px] items-center rounded-[24px] bg-raised pl-[18px] pr-4">
        <TargetRing size={148} stroke={13} shares={{ protein: plan.pct.protein / 100, carbs: plan.pct.carbs / 100, fat: plan.pct.fat / 100 }}>
          <span className="text-[28px] font-bold leading-[34px] tabular-nums text-white">{formatNumber(plan.kcal)}</span>
          <span className="text-[12px] leading-[14px] text-secondary">kcal a day</span>
        </TargetRing>
        <div className="ml-6 min-w-0 flex-1">
          {macros.map((x, i) => (
            <div key={x.id} className="relative flex items-start py-[7px]">
              {i > 0 && <span aria-hidden className="absolute inset-x-0 top-0 h-px scale-y-50 bg-white/[0.12]" />}
              <span aria-hidden className="mt-[5px] size-2.5 shrink-0 rounded-full" style={{ background: optionBase(`nutrient-${x.id}`) }} />
              <div className="ml-2 min-w-0 flex-1">
                <p className="text-[15px] leading-5 text-white">{x.label}</p>
                <p className="text-[12px] leading-4 text-secondary">{x.pct}% of calories</p>
              </div>
              <span className="shrink-0 text-[15px] font-semibold leading-5 tabular-nums text-white">{x.g} g</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-[22px] flex items-baseline justify-between">
        <SectionTitle>What Tara flags</SectionTitle>
        <button type="button" onClick={() => back("N04")} className="-my-3 h-11 pl-3 pr-1.5 text-[15px] font-semibold text-copper">
          Edit
        </button>
      </div>
      <SettingsGroup>
        {limits.map((l) => {
          const watched = watching.includes(l.id);
          return (
            <div key={l.id} className="relative flex h-[60px] items-center">
              <RowSep />
              <span className="ml-4 shrink-0" style={{ color: watched ? optionBase(l.token) : "var(--cravv-option-icon-off)" }}>
                <Icon name={l.icon} size={22} />
              </span>
              <div className="ml-[14px] min-w-0 flex-1">
                <p className="text-[17px] leading-[22px] text-white">{l.label}</p>
                <p className="text-[13px] leading-4" style={{ color: watched ? optionBase(l.token) : "var(--cravv-text-secondary)" }}>
                  {watched ? `Watching · ${l.hint}` : l.hint.charAt(0).toUpperCase() + l.hint.slice(1)}
                </p>
              </div>
              <span className="mr-4 shrink-0 text-[17px] font-semibold tabular-nums text-white">{l.value}</span>
            </div>
          );
        })}
      </SettingsGroup>
    </SetupScreen>
  );
}
