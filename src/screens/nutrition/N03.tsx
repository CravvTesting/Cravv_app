"use client";

/*
 * N03 · Activity (2601:4302). Single choice, outlined cards with a sentence each (store.activity).
 * Selected = 2px option-activity base outline over a 14% tint, tinted icon well, check.
 * The selected look is one overlay layer that fades (opacity only).
 */
import { Icon, PRESS, cx, optionBase, optionTint, type IconName, type OptionToken } from "@/components/cravv";
import { useMotionTokens } from "@/proto/motion";
import { go } from "@/proto/nav";
import { useProto, type Tabs } from "@/proto/store";
import { CheckCircleGlyph } from "./setup/parts";
import { SetupScreen } from "./setup/SetupScreen";

const ACTIVITIES: { id: Tabs["activity"]; label: string; hint: string; icon: IconName; token: OptionToken }[] = [
  { id: "mostly-sitting", label: "Mostly sitting", hint: "Desk job, little exercise", icon: "chair", token: "activity-mostly-sitting" },
  { id: "lightly-active", label: "Lightly active", hint: "On your feet, 1–3 workouts a week", icon: "walk", token: "activity-lightly-active" },
  { id: "active", label: "Active", hint: "Workouts 3–5 days a week", icon: "dumbbell", token: "activity-active" },
  { id: "very-active", label: "Very active", hint: "Physical job or training most days", icon: "bolt", token: "activity-very-active" },
];

export default function N03() {
  const activity = useProto((s) => s.activity);
  const set = useProto((s) => s.set);
  const m = useMotionTokens();
  const t = m.reduced ? "none" : `opacity ${0.25 * m.scale}s var(--ease-ios)`;
  const tc = m.reduced ? "none" : `color ${0.25 * m.scale}s var(--ease-ios)`;

  return (
    <SetupScreen step={2} title="How active are you?" subtitle="Outside of cooking, in a typical week." button="Continue" onButton={() => go("N04")}>
      <div role="radiogroup" aria-label="Activity" className="mt-[19px] flex flex-col gap-2.5">
        {ACTIVITIES.map((a) => {
          const on = activity === a.id;
          return (
            <button
              key={a.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => set({ activity: a.id })}
              className={cx("relative isolate flex h-[82px] items-center overflow-hidden rounded-[18px] bg-raised text-left select-none", PRESS)}
            >
              {/* Selected layer: tint + 2px outline */}
              <span
                aria-hidden
                className="absolute inset-0 -z-10 rounded-[18px]"
                style={{ background: optionTint(a.token), boxShadow: `inset 0 0 0 2px ${optionBase(a.token)}`, opacity: on ? 1 : 0, transition: t }}
              />
              <span className="relative ml-4 flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-white/[0.06]">
                <span aria-hidden className="absolute inset-0" style={{ background: optionTint(a.token, 20), opacity: on ? 1 : 0, transition: t }} />
                <span className="relative" style={{ color: on ? optionBase(a.token) : "var(--cravv-option-icon-off)", transition: tc }}>
                  <Icon name={a.icon} size={22} />
                </span>
              </span>
              <span className="ml-4 min-w-0 flex-1">
                <span className="block text-[17px] font-semibold leading-[22px] text-white">{a.label}</span>
                <span className="mt-0.5 block text-[14px] leading-[18px] text-secondary">{a.hint}</span>
              </span>
              <span className="mr-[22px] ml-2 shrink-0" style={{ color: optionBase(a.token), opacity: on ? 1 : 0, transition: t }}>
                <CheckCircleGlyph />
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-[18px] px-4 text-[13px] leading-4 text-secondary">Not sure? Pick the lower one. You can change it anytime.</p>
    </SetupScreen>
  );
}
