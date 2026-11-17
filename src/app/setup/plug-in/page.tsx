"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { Actions, PrimaryButton, Screen, TextButton, TopBar } from "@/components/ui";
import { PowerHelpSheet, SetupVideoSheet } from "@/components/connect/HelpSheets";

const STEPS = ["Camera docked", "Plug in", "“Hello” on screen"];

/** 07 · Plug in Tara */
export default function PlugIn() {
  const [sheet, setSheet] = useState<"power" | "video" | null>(null);
  const close = () => setSheet(null);

  return (
    <Screen padded={false}>
      {/* Photo with fade, flexes down on short screens (540 tall in the design). */}
      <div className="relative h-[clamp(260px,calc(100dvh-334px),540px)] shrink-0 overflow-hidden">
        <img src="/img/connect/tara-counter.png" alt="Tara on a kitchen counter" className="absolute inset-0 h-full w-full object-cover" />
        <img src="/img/connect/plug-fade.svg" alt="" width={402} height={540} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-x-0 top-0 px-5">
          <TopBar step={1} total={4} />
        </div>
        <button
          type="button"
          onClick={() => setSheet("video")}
          className="absolute bottom-5 left-1/2 flex h-8 -translate-x-1/2 items-center gap-1.5 rounded-2xl border border-white/12 bg-black/45 pl-2.5 pr-3.5 backdrop-blur-[6px] transition active:scale-95"
        >
          <img src="/img/connect/icon-play.svg" alt="" width={14} height={14} />
          <span className="whitespace-nowrap text-[13px] font-semibold text-white">Setup video · 1 min</span>
        </button>
      </div>

      <div className="px-5">
        <ol className="mt-[9px] flex justify-center gap-[18px] whitespace-nowrap text-[9px] uppercase leading-[14px] tracking-[0.36px]">
          {STEPS.map((s, i) => (
            <li key={s} className="flex gap-1.5">
              <span className="font-semibold text-accent">0{i + 1}</span>
              <span className="font-medium text-white/70">{s}</span>
            </li>
          ))}
        </ol>

        <h1 className="mt-[35px] text-center text-[28px] font-bold leading-[34px] tracking-[0.38px] text-white">Plug in Tara</h1>
        <p className="mx-auto mt-2 max-w-[330px] text-center text-[17px] leading-[22px] tracking-[-0.43px] text-label-2">
          Put the display on your counter near the stove, then plug it in.
        </p>
      </div>

      <Actions className="px-5">
        <PrimaryButton href="/setup/search">Tara Says Hello</PrimaryButton>
        <TextButton onClick={() => setSheet("power")}>Nothing on the Screen?</TextButton>
      </Actions>

      <PowerHelpSheet open={sheet === "power"} onClose={close} />
      <SetupVideoSheet open={sheet === "video"} onClose={close} />
    </Screen>
  );
}
