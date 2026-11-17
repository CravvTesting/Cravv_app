"use client";

import { PrimaryButton, SetupStepStrip, TextButton } from "@/components/cravv";
import { go } from "@/proto/nav";
import { Screen, ScreenHeader } from "@/proto/ui";
import { IMG, Img } from "./connect/parts";

const STEPS = ["Camera docked", "Plug in", "“Hello” on screen"] as const;

/**
 * 07 · Plug in Tara (Figma 2532:2804). Photo runs under the status bar; the header floats on it.
 * Tara Says Hello → 08. Nothing on the Screen? → 07h.
 */
export default function S07() {
  return (
    <Screen
      bleed
      contentClassName="flex flex-col"
      footer={
        <div className="flex flex-col gap-1.5">
          <PrimaryButton onClick={() => go("08")}>Tara Says Hello</PrimaryButton>
          <TextButton onClick={() => go("07h")}>Nothing on the Screen?</TextButton>
        </div>
      }
    >
      {/* Hero: 540px in the frame; shrinks on short phones so the copy stays visible. */}
      <div className="relative min-h-[260px] w-full flex-1 overflow-hidden" style={{ maxHeight: 540 }}>
        <Img src={`${IMG}/tara-counter.webp`} className="absolute inset-0 size-full object-cover" />
        <Img src={`${IMG}/fade-07.svg`} className="absolute inset-0 size-full" />
        <div className="absolute inset-x-0 top-0 px-4" style={{ paddingTop: "max(env(safe-area-inset-top), 8px)" }}>
          <ScreenHeader steps={4} current={1} />
        </div>
        <div
          className="absolute bottom-5 left-1/2 flex h-8 -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-2xl border border-white/12 bg-black/60 pl-2.5 pr-3.5"
        >
          <Img src={`${IMG}/icon-play.svg`} className="size-3.5" />
          <span className="text-[13px] font-semibold text-white">Setup video · 1 min</span>
        </div>
      </div>

      <div className="shrink-0 px-5 pb-4">
        <SetupStepStrip steps={STEPS} className="mt-[9px] justify-center leading-[14px]" />
        <h1 className="mt-[35px] text-center text-[28px] font-bold leading-[34px] tracking-[0.38px] text-white">Plug in Tara</h1>
        <p className="mx-auto mt-2 max-w-[330px] text-center text-[17px] leading-[22px] tracking-[-0.43px] text-secondary">
          Put the display on your counter near the stove, then plug it in.
        </p>
      </div>
    </Screen>
  );
}
