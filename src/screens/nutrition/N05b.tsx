"use client";

/*
 * N05b · How we worked it out (2604:4167). Read-only explainer drawn as a sheet over the N05 view
 * (the registry makes N05b a pushed route, so it repeats N05 underneath and is reached with a
 * cross-fade). Close / drag / dim → N05.
 */
import { useId } from "react";
import { Icon, formatNumber } from "@/components/cravv";
import { go } from "@/proto/nav";
import { Sheet } from "@/proto/ui";
import { ACTIVITY_LABEL, FAT_SHARE, FIBER_PER_1000, GOAL_LABEL } from "./setup/calc";
import { CloseGlyph } from "./setup/parts";
import { TargetsView, usePlan } from "./setup/TargetsView";
import { useProto } from "@/proto/store";

function Row({ label, sub, value, strong, first }: { label: string; sub?: string; value: string; strong?: boolean; first?: boolean }) {
  return (
    <div className="relative flex items-start py-3.5">
      {!first && <span aria-hidden className="absolute inset-x-0 top-0 h-px scale-y-50 bg-white/[0.12]" />}
      <div className="min-w-0 flex-1">
        <p className={strong ? "text-[17px] font-semibold leading-[22px] text-white" : "text-[16px] leading-5 text-white"}>{label}</p>
        {sub && <p className="mt-0.5 text-[12px] leading-4 text-secondary">{sub}</p>}
      </div>
      <span className={strong ? "shrink-0 text-[17px] font-bold leading-[22px] tabular-nums text-white" : "shrink-0 text-[16px] leading-5 tabular-nums text-white/75"}>
        {value}
      </span>
    </div>
  );
}

export default function N05b() {
  const plan = usePlan();
  const activity = useProto((s) => s.activity);
  const goal = useProto((s) => s.goal);
  const titleId = useId();
  const close = () => go("N05", { dir: "none" });
  const sign = plan.goalKcal < 0 ? "−" : "+";

  return (
    <>
      <TargetsView />
      <Sheet onDismiss={close} label="How we worked it out">
        <div className="max-h-[calc(100dvh-140px)] overflow-y-auto overscroll-contain px-5">
          <div aria-hidden className="mx-auto mt-1.5 h-[5px] w-9 rounded-[3px] bg-white/30" />
          <div className="mt-[15px] flex items-center justify-between">
            <h2 id={titleId} className="text-[22px] font-bold leading-7 text-white">How we worked it out</h2>
            <button type="button" onClick={close} aria-label="Close" className="relative flex size-8 items-center justify-center rounded-full bg-white/10 text-white/80 before:absolute before:-inset-1.5 before:content-['']">
              <CloseGlyph />
            </button>
          </div>

          <div className="mt-[22px] rounded-[16px] bg-secondary-surface px-4">
            <Row first label="Resting energy" sub="Mifflin–St Jeor equation" value={`${formatNumber(plan.resting)} kcal`} />
            <Row label={ACTIVITY_LABEL[activity]} value={`× ${plan.factor}`} />
            <Row label={GOAL_LABEL[goal]} value={`${sign} ${formatNumber(Math.abs(plan.goalKcal))} kcal`} />
            {plan.pregnancyKcal > 0 && <Row label="Pregnant or breastfeeding" value={`+ ${plan.pregnancyKcal} kcal`} />}
            <Row strong label="Daily calories" sub="Rounded to the nearest 50." value={`${formatNumber(plan.kcal)} kcal`} />
          </div>

          <dl className="mt-[22px] flex flex-col gap-[10px]">
            {[
              ["Protein", `${plan.proteinPerKg} g per kg of body weight, for your goal.`],
              ["Fat and carbs", `Fat at ${Math.round(FAT_SHARE * 100)}% of calories. Carbs make up the rest.`],
              ["Fiber", `${FIBER_PER_1000} g per 1,000 kcal.`],
              ["Sodium, sugar, saturated fat", "Limits from the Dietary Guidelines for Americans 2025–2030."],
            ].map(([t, d]) => (
              <div key={t}>
                <dt className="text-[15px] font-semibold leading-5 text-white">{t}</dt>
                <dd className="mt-px text-[14px] leading-[18px] text-secondary">{d}</dd>
              </div>
            ))}
          </dl>

          <div className="mb-2 mt-[26px] flex gap-3 rounded-[16px] bg-secondary-surface py-[13px] pl-4 pr-4">
            <span className="mt-px shrink-0" style={{ color: "var(--cravv-option-feedback-tip-base)" }}>
              <Icon name="info" size={20} />
            </span>
            <p className="text-[14px] leading-[19px] text-white/75">General targets, not medical advice. If a clinician gave you targets, use theirs.</p>
          </div>
        </div>
      </Sheet>
    </>
  );
}
