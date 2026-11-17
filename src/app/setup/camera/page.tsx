/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Actions, PrimaryButton, Screen, TextButton, TopBar } from "@/components/ui";
import { HoodHelpSheet } from "@/components/stove/HoodHelpSheet";

const STEPS = [
  ["01", "Lift off base"],
  ["02", "Magnet side up"],
  ["03", "Light on"],
] as const;

/** 12 · Attach the camera */
export default function AttachCamera() {
  const router = useRouter();
  const [help, setHelp] = useState(false);

  return (
    <Screen padded={false}>
      {/* Hero: 402×540 in the frame; shrinks on short screens so the text never overlaps it. */}
      <div className="absolute inset-x-0 top-0 h-[min(540px,calc(100dvh-334px))] overflow-hidden">
        <img src="/img/stove/camera-under-hood.jpg" alt="Tara's camera module attached under a range hood" className="absolute inset-0 size-full object-cover" />
        <img src="/img/stove/camera-fade.svg" alt="" width={402} height={540} className="absolute inset-0 h-full w-full" />
      </div>

      <div className="relative px-5">
        <TopBar step={4} total={4} />
      </div>

      <div className="relative mt-auto px-5">
      <div className="flex flex-col items-center text-center">
        <ol className="flex gap-[18px] text-[9px] uppercase leading-[14px] tracking-[0.36px]">
          {STEPS.map(([n, label]) => (
            <li key={n} className="flex gap-1.5 whitespace-nowrap">
              <span className="font-semibold text-accent">{n}</span>
              <span className="font-medium text-white/70">{label}</span>
            </li>
          ))}
        </ol>
        <h1 className="mt-[35px] text-[28px] font-bold leading-[34px] tracking-[0.38px] text-white">Attach the Camera</h1>
        <p className="mt-2 max-w-[330px] text-[17px] leading-[22px] tracking-[-0.43px] text-label-2">
          Hold it under your range hood, over the middle of the burners. A magnet holds it.
        </p>
      </div>

      <Actions className="pt-9!">
        <PrimaryButton onClick={() => router.push("/setup/calibrate")}>Continue</PrimaryButton>
        <TextButton onClick={() => setHelp(true)}>My Hood Isn&apos;t Metal</TextButton>
      </Actions>
      </div>

      <HoodHelpSheet open={help} onClose={() => setHelp(false)} />
    </Screen>
  );
}
