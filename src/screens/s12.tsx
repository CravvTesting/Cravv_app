"use client";

/* 12 · Attach the camera. Continue → 13. "My Hood Isn't Metal" → 12h (sheet over this screen). */
import { PrimaryButton, SetupStepStrip, TextButton } from "@/components/cravv";
import { go } from "@/proto/nav";
import { Screen, ScreenHeader } from "@/proto/ui";

const STEPS = ["Lift off base", "Magnet side up", "Light on"] as const;

export default function S12() {
  return (
    <div className="cravv-bg relative h-full w-full overflow-hidden">
      {/* Hero photo runs under the status bar; height follows the frame (874 − 540 = 334px for the text). */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[max(calc(100%-334px),55%)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/camera/hood-camera.webp" alt="" className="absolute inset-0 size-full object-cover" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/camera/hood-fade.svg" alt="" className="absolute inset-0 size-full" />
      </div>
      <Screen
        className="bg-none!"
        header={<ScreenHeader steps={4} current={4} />}
        footer={
          <>
            <PrimaryButton onClick={() => go("13")}>Continue</PrimaryButton>
            <TextButton className="mt-1.5" onClick={() => go("12h")}>
              My Hood Isn’t Metal
            </TextButton>
          </>
        }
      >
        <div className="flex min-h-full flex-col items-center justify-end pb-[46px] text-center">
          <SetupStepStrip steps={STEPS} className="justify-center" />
          <h1 className="mt-[35px] text-[28px] font-bold leading-[34px] tracking-[0.38px]">Attach the Camera</h1>
          <p className="mt-2 max-w-[330px] text-[17px] leading-[22px] tracking-[-0.43px] text-secondary">
            Hold it under your range hood, over the middle of the burners. A magnet holds it.
          </p>
        </div>
      </Screen>
    </div>
  );
}
