"use client";

/* eslint-disable @next/next/no-img-element */
/*
 * Simulated iOS "Sign in with Apple / Google" system sheet shown while the fake sign-in runs
 * (TIMING.fakeSignInSheet). Not in Figma: a neutral stand-in so the tap gets a believable beat.
 */
import { motion } from "motion/react";
import { Spinner } from "@/components/cravv";
import { MOTION, useMotionTokens } from "@/proto/motion";
import { useProto } from "@/proto/store";

export type Provider = "apple" | "google";

export function FakeSignInSheet({ provider }: { provider: Provider }) {
  const m = useMotionTokens();
  const name = useProto((s) => s.name) || "Priya";
  const apple = provider === "apple";
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end" aria-live="polite">
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: MOTION.dimOpacity }}
        exit={{ opacity: 0 }}
        transition={m.fade}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={apple ? "Sign in with Apple" : "Sign in with Google"}
        className="relative mx-2 flex flex-col items-center rounded-[38px] bg-raised px-6 pt-7 text-center"
        style={{ marginBottom: "max(calc(env(safe-area-inset-bottom) - 26px), 8px)", paddingBottom: "max(env(safe-area-inset-bottom), 28px)" }}
        initial={m.reduced ? { opacity: 0 } : { y: "100%" }}
        animate={m.reduced ? { opacity: 1 } : { y: 0 }}
        exit={m.reduced ? { opacity: 0 } : { y: "110%" }}
        transition={m.sheet}
      >
        <div className="flex size-14 items-center justify-center rounded-full bg-white">
          <img src={apple ? "/img/entry/apple.svg" : "/img/entry/google.svg"} alt="" width={apple ? 26 : 24} height={apple ? 26 : 24} />
        </div>
        <p className="mt-4 text-[17px] font-semibold leading-[22px] text-white">{apple ? "Sign in with Apple" : "Sign in with Google"}</p>
        <p className="mt-1 text-[15px] leading-5 text-secondary">Continuing as {name}</p>
        <div className="mt-6 flex h-[52px] w-full items-center justify-center gap-2.5 rounded-[26px] bg-white/10 text-[15px] text-white/85">
          <Spinner size={18} label="" />
          Signing in…
        </div>
      </motion.div>
    </div>
  );
}
