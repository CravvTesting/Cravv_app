"use client";

/*
 * 06 · Is Tara with you? (2525:2801). Set Up Tara → 07a. Not Yet, Explore Recipes ends onboarding
 * with setupPending = true.
 */
import { motion } from "motion/react";
import { BackButton, InfoTile, PrimaryButton, SectionTitle, SETUP_NEEDS, TextButton } from "@/components/cravv";
import { useMotionTokens } from "@/proto/motion";
import { back, go } from "@/proto/nav";
import { useProto } from "@/proto/store";
import { Screen } from "@/proto/ui";

export default function S06() {
  const m = useMotionTokens();
  const set = useProto((s) => s.set);
  return (
    <div className="relative h-full w-full">
      <Screen
        footer={
          <div className="flex flex-col gap-1.5">
            <PrimaryButton onClick={() => go("07a")}>Set Up Tara</PrimaryButton>
            <TextButton
              onClick={() => {
                set({ setupPending: true, done: true });
                go("home");
              }}
            >
              Not Yet, Explore Recipes
            </TextButton>
          </div>
        }
      >
        {/* Side-view drawing: 414×306, mirrored as in the frame, bleeds past the 20px gutters. */}
        <div className="-mx-5 mt-[10px] flex h-[306px] justify-center overflow-hidden">
          <motion.img
            src="/img/entry/tara-side.svg"
            alt="Drawing of Tara, side view"
            width={414}
            height={306}
            className="max-w-none -scale-x-100"
            initial={m.reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={m.reduced ? m.fade : { ...m.page, delay: 0.1 * m.scale }}
          />
        </div>
        <h1 className="mt-[26px] text-center text-[34px] font-bold leading-[41px] tracking-[0.4px] text-white">Is Tara with you?</h1>
        <p className="mx-auto mt-[7px] max-w-[300px] text-center text-[17px] leading-[22px] tracking-[-0.43px] text-secondary">
          Setup takes about 3 minutes, standing at your stove.
        </p>
        <SectionTitle className="mt-[29px]">You’ll need</SectionTitle>
        <div className="grid grid-cols-3 gap-[7px] pb-4">
          {SETUP_NEEDS.map((n) => (
            <InfoTile key={n.id} label={n.label} hint={n.hint} icon={n.icon} token={n.token} />
          ))}
        </div>
      </Screen>
      <div className="absolute top-0 left-0 z-20 px-4" style={{ paddingTop: "max(env(safe-area-inset-top), 8px)" }}>
        <div className="flex h-14 items-center">
          <BackButton onClick={() => back()} />
        </div>
      </div>
    </div>
  );
}
