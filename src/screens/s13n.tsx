"use client";

/*
 * 13n · Turn on alerts (frame 2626:4780). Pre-permission with a sample alert.
 * Turn On Alerts shows a simulated iOS notification prompt; either answer, or Not Now, goes to
 * the ending chosen in the debug menu (14 or 14b).
 */
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { PrimaryButton, TextButton } from "@/components/cravv";
import { useMotionTokens } from "@/proto/motion";
import { go } from "@/proto/nav";
import { useProto } from "@/proto/store";
import { Screen, ScreenHeader, SystemAlert } from "@/proto/ui";

export default function S13n() {
  const m = useMotionTokens();
  const set = useProto((s) => s.set);
  const [asking, setAsking] = useState(false);

  const finish = (alerts?: boolean) => {
    if (alerts !== undefined) set({ alerts });
    setAsking(false);
    go(useProto.getState().debug.ending === "14b" ? "14b" : "14");
  };

  const rise = (i: number) => ({
    initial: { opacity: 0, y: m.reduced ? 0 : 10 },
    animate: { opacity: 1, y: 0 },
    transition: m.reduced ? m.fade : { ...m.spring, delay: (0.05 + i * 0.06) * m.scale },
  });

  return (
    <>
    <Screen
      header={<ScreenHeader onBack={() => go("13s", { dir: "pop" })} />}
      footer={
        <div className="flex flex-col gap-1">
          <PrimaryButton onClick={() => setAsking(true)}>Turn On Alerts</PrimaryButton>
          <TextButton onClick={() => finish()}>Not Now</TextButton>
        </div>
      }
    >
      <div className="flex flex-col items-center pb-6 text-center">
        <motion.div
          className="mt-[46px] flex size-[120px] items-center justify-center rounded-[32px]"
          style={{ background: "color-mix(in srgb, var(--cravv-option-setup-power-base) 16%, transparent)" }}
          initial={{ opacity: 0, scale: m.reduced ? 1 : 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={m.reduced ? m.fade : { type: "spring", duration: 0.5 * m.scale, bounce: 0.3 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/calib/bell.svg" alt="" width={56} height={56} />
        </motion.div>

        <motion.h1 className="mt-6 text-[34px] font-bold leading-[41px] tracking-[0.4px]" {...rise(1)}>
          Burner left on?
        </motion.h1>
        <motion.p className="mt-[7px] max-w-[330px] text-[17px] leading-[22px] text-secondary" {...rise(2)}>
          Tara can alert your phone when the stove is on and no one is cooking.
        </motion.p>

        {/* Sample notification */}
        <motion.div
          aria-label="Example notification"
          className="relative mt-[54px] flex w-full gap-3 rounded-[22px] p-3.5 pb-4 text-left"
          style={{ background: "color-mix(in srgb, var(--cravv-surface-secondary) 90%, transparent)" }}
          {...rise(3)}
        >
          <div className="flex size-[38px] shrink-0 items-start justify-center rounded-[9px] bg-recessed pt-2 text-[16px] font-bold leading-[19px] text-accent">
            c.
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between">
              <span className="text-[15px] font-semibold leading-[18px] text-white">Tara</span>
              <span className="text-[13px] text-secondary">now</span>
            </div>
            <p className="mt-[3px] pr-3 text-[15px] leading-5 text-white">Front left burner is on. No one is at the stove.</p>
          </div>
        </motion.div>
        <motion.p className="mt-2.5 max-w-[330px] text-[13px] leading-4 text-secondary" {...rise(4)}>
          Example alert. You choose which ones you get in Settings.
        </motion.p>
      </div>
    </Screen>

      {/* Outside Screen so the alert and its dim cover the whole page. */}
      <AnimatePresence>
        {asking && (
          <SystemAlert
            key="notif"
            title="“Cravv” Would Like to Send You Notifications"
            message="Notifications may include alerts, sounds and icon badges. These can be configured in Settings."
            actions={[
              { label: "Don’t Allow", onPress: () => finish(false) },
              { label: "Allow", onPress: () => finish(true), bold: true },
            ]}
          />
        )}
      </AnimatePresence>
    </>
  );
}
