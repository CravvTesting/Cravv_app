"use client";

/* 12h · Hood isn't metal. Sheet over 12 with three numbered steps; Got It (or drag / dim tap) → 12. */
import { PrimaryButton, SheetHeader } from "@/components/cravv";
import { back } from "@/proto/nav";
import { Sheet } from "@/proto/ui";

const STEPS = [
  { title: "Wipe the spot clean", hint: "Dry, over the middle of the burners", color: "var(--cravv-cyan-500)" },
  { title: "Press the plate on", hint: "Hold firmly for 30 seconds", color: "var(--cravv-violet-500)" },
  { title: "Snap the camera on", hint: "The magnet holds it to the plate", color: "var(--cravv-green-500)" },
] as const;

export default function S12h() {
  const close = () => back("12");
  return (
    <Sheet onDismiss={close} label="Hood isn’t metal?">
      <SheetHeader title="Hood isn’t metal?" subtitle="Use the adhesive plate from the box." />
      <ol className="mx-4 mt-6 overflow-hidden rounded-[18px] bg-secondary-surface">
        {STEPS.map((s, i) => (
          <li key={s.title} className="relative flex h-[60px] items-start gap-3.5 pl-4 pt-[10px]">
            <span
              aria-hidden
              className="mt-[9px] flex size-[22px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold"
              style={{ color: s.color, background: `color-mix(in srgb, ${s.color} 20%, transparent)` }}
            >
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="text-[16px] leading-[19px] text-white">
                <span className="sr-only">Step {i + 1}: </span>
                {s.title}
              </p>
              <p className="mt-[3px] text-[13px] leading-4 text-secondary">{s.hint}</p>
            </div>
            {i < STEPS.length - 1 && <span aria-hidden className="absolute bottom-0 left-[52px] right-0 h-px scale-y-50 bg-white/12" />}
          </li>
        ))}
      </ol>
      <div className="px-4 pt-6">
        <PrimaryButton onClick={close}>Got It</PrimaryButton>
      </div>
    </Sheet>
  );
}
