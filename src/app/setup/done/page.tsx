/* eslint-disable @next/next/no-img-element */
"use client";

import { Actions, PrimaryButton, Screen, TextButton } from "@/components/ui";
import { Checkmark, ChevronRight, ListHeader, StickyActions } from "@/components/stove/parts";
import { useFinishOnboarding } from "@/components/stove/finish";
import { useHydrated, useOnboarding } from "@/lib/store";
import { pickFirstRecipe, stoveLabel } from "@/lib/sim/stove";

/** 14 · All set */
export default function AllSet() {
  const hydrated = useHydrated();
  const device = useOnboarding((s) => s.device);
  const diet = useOnboarding((s) => s.diet);
  const finish = useFinishOnboarding();
  const recipe = pickFirstRecipe(diet);

  const rows = [
    { icon: "/img/stove/icon-stove.svg", label: "Stove", value: stoveLabel(device.stoveType) },
    { icon: "/img/stove/icon-cam.svg", label: "Camera", value: "Connected" },
    { icon: "/img/stove/icon-mic.svg", label: "Voice", value: "English" },
  ];

  return (
    <Screen>
      <div className="pt-[max(env(safe-area-inset-top),12px)]">
        <div className="relative mx-auto mt-4 h-[150px] w-[163.636px]">
          <img src="/img/stove/tara-isometric.svg" alt="Tara display and camera module" width={163.636} height={153.131} className="absolute left-0 top-0 max-w-none" />
          <div className="absolute left-[105.64px] top-[106px] flex size-[30px] items-center justify-center rounded-full border-[3px] border-[#1c1c1f] bg-accent">
            <Checkmark color="#1c1c1f" size={14} strokeWidth={2.6} />
          </div>
        </div>
      </div>

      <h1 className="mt-3.5 text-center text-[34px] font-bold leading-[41px] tracking-[0.4px] text-white">You&apos;re All Set</h1>

      {hydrated && (
        <div className="animate-fade-up flex flex-col">
          <p className="mt-[5px] text-center text-[17px] leading-[22px] tracking-[-0.43px] text-label-2">
            Tara is watching all {device.burners} burners.
          </p>

          <div className="mt-[34px] overflow-hidden rounded-card bg-surface">
            {rows.map((r, i) => (
              <div key={r.label} className="relative flex h-[52px] items-center gap-3 px-4">
                <img src={r.icon} alt="" width={22} height={22} className="shrink-0" />
                <span className="flex-1 text-[17px] leading-[22px] tracking-[-0.43px] text-white">{r.label}</span>
                <span className="whitespace-nowrap text-[17px] leading-[22px] tracking-[-0.43px] text-label-2">{r.value}</span>
                {i < rows.length - 1 && <span className="absolute bottom-0 left-4 right-0 h-[0.5px] bg-[rgba(84,84,88,0.6)]" />}
              </div>
            ))}
          </div>

          <ListHeader className="mt-4 h-[40px]">Tonight</ListHeader>
          <div className="flex items-center gap-3.5 rounded-card bg-surface py-3 pl-3 pr-4">
            <img src={recipe.image} alt="" width={60} height={60} className="size-[60px] shrink-0 rounded-[14px] object-cover" />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="truncate text-[17px] font-semibold leading-[22px] tracking-[-0.43px] text-white">{recipe.name}</p>
              <p className="truncate text-[15px] leading-[20px] tracking-[-0.23px] text-label-2">
                {recipe.time} · {recipe.handsOn}
              </p>
            </div>
            <ChevronRight />
          </div>
        </div>
      )}

      <StickyActions>
        <Actions>
          <PrimaryButton onClick={finish}>Start Cooking</PrimaryButton>
          <TextButton onClick={finish}>Not Now</TextButton>
        </Actions>
      </StickyActions>
    </Screen>
  );
}
