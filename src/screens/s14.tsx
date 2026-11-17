"use client";

/*
 * 14 · All set (frame 2525:3038). The one celebratory moment (motion moment 11): the drawing
 * settles in, the done badge pops, then the summary rows stagger in.
 * Start Cooking and Not Now both end onboarding.
 */
import { motion } from "motion/react";
import { PrimaryButton, SectionTitle, STOVE_TYPES, TextButton } from "@/components/cravv";
import { useMotionTokens } from "@/proto/motion";
import { useProto } from "@/proto/store";
import { Screen } from "@/proto/ui";
import { finishOnboarding } from "./calib/finish";

/* eslint-disable @next/next/no-img-element */

export default function S14() {
  const m = useMotionTokens();
  const burners = useProto((s) => s.burners);
  const stoveType = useProto((s) => s.stoveType);
  const stove = STOVE_TYPES.find((t) => t.id === stoveType)?.label ?? "Electric coil";

  const rows = [
    { icon: "icon-stove.svg", label: "Stove", value: stove },
    { icon: "icon-cam.svg", label: "Camera", value: "Connected" },
    { icon: "icon-mic.svg", label: "Voice", value: "English" },
  ];

  const enter = (delay: number) => ({
    initial: { opacity: 0, y: m.reduced ? 0 : 14 },
    animate: { opacity: 1, y: 0 },
    transition: m.reduced ? m.fade : { type: "spring" as const, duration: 0.5 * m.scale, bounce: 0.15, delay: delay * m.scale },
  });

  return (
    <Screen
      footer={
        <motion.div className="flex flex-col gap-1" {...enter(0.75)}>
          <PrimaryButton onClick={finishOnboarding}>Start Cooking</PrimaryButton>
          <TextButton onClick={finishOnboarding}>Not Now</TextButton>
        </motion.div>
      }
    >
      <div className="flex flex-col items-center pb-6">
        {/* Tara drawing + done badge */}
        <motion.div
          className="relative mt-3 h-[153px] w-[164px]"
          initial={{ opacity: 0, scale: m.reduced ? 1 : 0.8, y: m.reduced ? 0 : 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={m.reduced ? m.fade : { type: "spring", duration: 0.7 * m.scale, bounce: 0.3 }}
        >
          <img src="/img/calib/tara-assembled.svg" alt="Tara, set up" width={164} height={153} className="h-[153px] w-[164px]" />
          <motion.span
            aria-hidden
            className="absolute left-[105.6px] top-[106px] flex size-[30px] items-center justify-center rounded-full border-[3px] bg-copper"
            style={{ borderColor: "#1c1c1f" /* page gradient top stop (globals .cravv-bg) */ }}
            initial={m.reduced ? { opacity: 0 } : { scale: 0, rotate: -30 }}
            animate={m.reduced ? { opacity: 1 } : { scale: 1, rotate: 0 }}
            transition={m.reduced ? m.fade : { type: "spring", duration: 0.5 * m.scale, bounce: 0.55, delay: 0.35 * m.scale }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <motion.path
                d="M2.5 7.5L5.5 10.5L11.5 3.5"
                stroke="var(--cravv-gray-1000)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={m.reduced ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3 * m.scale, delay: 0.5 * m.scale, ease: "easeOut" }}
              />
            </svg>
          </motion.span>
        </motion.div>

        <motion.h1 className="mt-[11px] text-center text-[34px] font-bold leading-[41px] tracking-[0.4px]" {...enter(0.2)}>
          You&apos;re All Set
        </motion.h1>
        <motion.p className="mt-[5px] text-center text-[17px] leading-[22px] tracking-[-0.43px] text-secondary" {...enter(0.28)}>
          {burners === 1 ? "Tara is watching your burner." : `Tara is watching all ${burners} burners.`}
        </motion.p>

        {/* Summary card: rows stagger in */}
        <motion.ul
          aria-label="Setup summary"
          className="mt-[34px] w-full overflow-hidden rounded-[26px] bg-raised"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...m.fade, delay: 0.32 * m.scale }}
        >
          {rows.map((r, i) => (
            <motion.li
              key={r.label}
              className="relative flex h-[52px] items-center gap-3 px-4"
              initial={{ opacity: 0, x: m.reduced ? 0 : -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={m.reduced ? m.fade : { type: "spring", duration: 0.5 * m.scale, bounce: 0.25, delay: (0.4 + i * 0.09) * m.scale }}
            >
              <img src={`/img/calib/${r.icon}`} alt="" width={22} height={22} className="shrink-0" />
              <span className="flex-1 text-[17px] leading-[22px] tracking-[-0.43px] text-white">{r.label}</span>
              <span className="text-[17px] leading-[22px] tracking-[-0.43px] text-secondary">{r.value}</span>
              {i < rows.length - 1 && <span aria-hidden className="absolute bottom-0 left-4 right-0 h-[0.5px] bg-[rgba(84,84,88,0.6)]" />}
            </motion.li>
          ))}
        </motion.ul>

        {/* Tonight */}
        <motion.div className="mt-4 w-full" {...enter(0.7)}>
          <SectionTitle className="pt-2">Tonight</SectionTitle>
          <button
            type="button"
            onClick={finishOnboarding}
            className="flex w-full items-center gap-3.5 rounded-[26px] bg-raised py-3 pl-3 pr-4 text-left active:opacity-80"
          >
            <img src="/img/calib/dish-tacos.webp" alt="" width={60} height={60} className="size-[60px] shrink-0 rounded-[14px] object-cover" />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-[17px] font-semibold leading-[22px] tracking-[-0.43px] text-white">Black Bean Tacos</span>
              <span className="truncate text-[15px] leading-5 tracking-[-0.23px] text-secondary">30 min · 10 min hands-on</span>
            </span>
            <img src="/img/calib/icon-chev.svg" alt="" width={18} height={18} className="shrink-0" />
          </button>
        </motion.div>
      </div>
    </Screen>
  );
}
