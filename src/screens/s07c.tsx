"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { PrimaryButton, TextButton } from "@/components/cravv";
import { useMotionTokens } from "@/proto/motion";
import { back, go } from "@/proto/nav";
import { useTiming, wait } from "@/proto/timing";
import { Screen, ScreenHeader } from "@/proto/ui";
import { IMG, PermissionHero, TitleBlock } from "./connect/parts";

/**
 * 07c · Bluetooth is off (Figma 2626:4697).
 * Open Settings fakes leaving the app and coming back (TIMING.openSettingsRoundTrip), then → 07a.
 * Back → 06.
 */
export default function S07c() {
  const ms = useTiming();
  const m = useMotionTokens();
  const [away, setAway] = useState(false);

  const openSettings = async () => {
    if (away) return;
    setAway(true);
    await wait(ms("openSettingsRoundTrip"));
    go("07a", { dir: "pop" });
  };

  return (
    <>
      <Screen
        header={<ScreenHeader />}
        footer={
          <div className="flex flex-col gap-1.5">
            <PrimaryButton onClick={openSettings}>Open Settings</PrimaryButton>
            <TextButton onClick={() => back()}>Back</TextButton>
          </div>
        }
      >
        <div className="pt-[82px]">
          <PermissionHero tint="var(--cravv-gray-400)" src={`${IMG}/bt-off.svg`} />
          <TitleBlock
            className="mt-8"
            title="Bluetooth is off"
            body="Tara can’t be found without it. Turn it on in Settings, then come back here."
          />
        </div>
      </Screen>
      {/* Simulated trip to the Settings app: the app shrinks away to black, then returns. */}
      <AnimatePresence>
        {away && (
          <motion.div
            key="away"
            className="absolute inset-0 z-50 flex items-center justify-center bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={m.fade}
            role="status"
          >
            <span className="text-[15px] text-secondary">Opening Settings…</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
