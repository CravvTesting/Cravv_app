"use client";

/* eslint-disable @next/next/no-img-element */
/*
 * 02 · Create account (2525:2491), 02b · Sign in (2525:2509), 02x · Sign-in cancelled (2628:4676).
 * One component: the bottom sheet stays mounted and morphs its height between modes (motion `layout`),
 * the hero photo cross-fades. Apple / Google fake a system sign-in sheet for TIMING.fakeSignInSheet.
 */
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { SheetHeader } from "@/components/cravv";
import { useMotionTokens } from "@/proto/motion";
import { go } from "@/proto/nav";
import { useProto } from "@/proto/store";
import { useTiming, wait } from "@/proto/timing";
import { Sheet } from "@/proto/ui";
import { FakeSignInSheet, type Provider } from "./entry/FakeSignInSheet";
import type { ScreenProps } from "./registry";

type Mode = "create" | "signin" | "cancelled";

const COPY = {
  create: { title: "Create your account", subtitle: "Your stove setup, recipes and food preferences, saved." },
  signin: { title: "Welcome back", subtitle: "Sign in with the Apple or Google account you used before." },
} as const;

export default function Auth({ id }: ScreenProps) {
  const mode: Mode = id === "02b" ? "signin" : id === "02x" ? "cancelled" : "create";
  const m = useMotionTokens();
  const t = useTiming();
  const [busy, setBusy] = useState<Provider | null>(null);
  const copy = mode === "signin" ? COPY.signin : COPY.create;

  const signIn = async (provider: Provider) => {
    if (busy) return;
    setBusy(provider);
    await wait(t("fakeSignInSheet"));
    setBusy(null);
    const { debug } = useProto.getState();
    if (mode === "signin") go("02c");
    else if (mode === "create" && debug.signIn === "cancelled") go("02x", { dir: "none" });
    else go("03"); // 02 success, or a retry from 02x
  };

  // Children keep their size while the sheet's height morphs (no stretch).
  const pos = { layout: "position" as const, transition: m.sheet };

  return (
    <div className="cravv-bg relative h-full w-full overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[639px]">
        <AnimatePresence initial={false}>
          <motion.img
            key={mode === "signin" ? "02b" : "02"}
            src={mode === "signin" ? "/img/entry/hero-02b.webp" : "/img/entry/hero-02.webp"}
            alt=""
            className="absolute inset-0 size-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ ...m.fade, duration: 0.4 * m.scale }}
          />
        </AnimatePresence>
        <div aria-hidden className="absolute inset-x-0 top-0 h-[130px] bg-gradient-to-b from-black/55 to-transparent" />
      </div>

      <Sheet dim={false} label={copy.title}>
        <motion.div {...pos} aria-hidden className="mx-auto mt-2 h-[5px] w-9 rounded-[3px] bg-white/25" />
        <AnimatePresence initial={false}>
          {mode === "cancelled" && (
            <motion.div
              key="notice"
              className="overflow-hidden px-4"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={m.reduced ? m.fade : m.sheet}
            >
              <div role="status" className="mt-[13px] flex min-h-9 items-center gap-2 rounded-[18px] bg-white/[0.08] px-3 py-2">
                <img src="/img/entry/info.svg" alt="" width={20} height={20} className="shrink-0" />
                <p className="text-[14px] leading-[18px] text-[rgba(235,235,245,0.85)]">Sign-in was cancelled. Pick one to try again.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div {...pos} className={mode === "cancelled" ? "-mt-[18px]" : "-mt-[13px]"}>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div key={copy.title} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={m.fade}>
              <SheetHeader title={copy.title} subtitle={copy.subtitle} grabber={false} />
            </motion.div>
          </AnimatePresence>
        </motion.div>
        <motion.div {...pos} className="-mt-0.5 flex flex-col gap-2 px-6">
          <button
            type="button"
            onClick={() => signIn("apple")}
            className="flex h-[52px] w-full items-center justify-center gap-[7px] rounded-[26px] bg-white text-[17px] font-semibold text-black transition-transform active:scale-[0.98] active:opacity-85"
          >
            <img src="/img/entry/apple.svg" alt="" width={17} height={17} className="-mt-0.5" />
            Continue with Apple
          </button>
          <button
            type="button"
            onClick={() => signIn("google")}
            className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-[26px] text-[17px] font-semibold text-white transition-transform active:scale-[0.98] active:opacity-85"
            style={{ background: "var(--cravv-button-surface-fill)" }}
          >
            <img src="/img/entry/google.svg" alt="" width={16} height={16} />
            Continue with Google
          </button>
        </motion.div>
        <motion.div {...pos} className="mt-2 flex flex-col items-center px-6 text-center">
          <p className="flex h-8 items-center justify-center gap-1 text-[15px] text-secondary">
            {mode === "signin" ? "New to Tara?" : "Already have an account?"}
            <button
              type="button"
              className="-my-1.5 h-11 font-semibold text-accent active:opacity-50"
              onClick={() => go(mode === "signin" ? "02" : "02b", { dir: "none" })}
            >
              {mode === "signin" ? "Create Account" : "Sign In"}
            </button>
          </p>
          <p className="mt-1 max-w-[300px] text-[12px] leading-4 text-[rgba(235,235,245,0.4)]">
            By continuing you agree to the Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </Sheet>

      <AnimatePresence>{busy && <FakeSignInSheet key="fake" provider={busy} />}</AnimatePresence>
    </div>
  );
}
