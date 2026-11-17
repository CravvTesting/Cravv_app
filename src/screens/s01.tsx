"use client";

import { useLayoutEffect, useState } from "react";

/* eslint-disable @next/next/no-img-element */
/*
 * 01 · Meet Tara (Figma 2525:2470). Hero photo with callouts, Get Started → 02, Sign In → 02b.
 */
import { motion } from "motion/react";
import { Callout, PrimaryButton, TextButton } from "@/components/cravv";
import { useMotionTokens } from "@/proto/motion";
import { go } from "@/proto/nav";
import { Screen } from "@/proto/ui";

// Hero fade from the frame ("Fade" 2525:2472): darkens the top under the status bar and melts into the page.
const HERO_FADE =
  "linear-gradient(180deg, rgba(28,28,31,0.35) 0%, rgba(28,28,31,0) 14%, rgba(28,28,31,0) 50%, rgba(22,22,26,0.85) 80%, var(--cravv-gray-950) 100%)";

export default function S01() {
  const m = useMotionTokens();
  // Callouts and leader lines fade in after the page lands.
  const [stageScale, setStageScale] = useState(1);
  useLayoutEffect(() => {
    const read = () => setStageScale(Math.min(window.innerWidth, 440) / 402);
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);
  const reveal = (i: number) => ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { ...m.fade, duration: 0.4 * m.scale, delay: (0.25 + i * 0.12) * m.scale },
  });

  return (
    <Screen
      bleed
      contentClassName="overflow-hidden"
      footer={
        <div className="flex flex-col gap-1.5">
          <PrimaryButton onClick={() => go("02")}>Get Started</PrimaryButton>
          <TextButton onClick={() => go("02b")}>Sign In</TextButton>
        </div>
      }
    >
      {/* No scrolling: the hero takes whatever height is left. The 402×600 frame is a "stage"
          pinned to the bottom of that space and scaled to the screen width, so photo and
          annotations stay aligned; short screens crop its top, tall ones blend into the page. */}
      <div className="flex h-full flex-col">
      <div className="relative min-h-0 flex-1 overflow-hidden">
      <div
        className="absolute bottom-0 left-1/2 h-[600px] w-[402px]"
        style={{ transform: `translateX(-50%) scale(${stageScale})`, transformOrigin: "50% 100%" }}
      >
        <img src="/img/entry/hero-01.webp" alt="Tara on a kitchen counter" className="absolute inset-0 size-full object-cover" />
        <div aria-hidden className="absolute inset-0" style={{ backgroundImage: HERO_FADE }} />
        <div aria-hidden className="absolute inset-x-0 top-0 h-24" style={{ background: "linear-gradient(180deg, #1c1c1f, rgba(28,28,31,0))" }} />
        {/* Annotation layer, laid out on the 402px frame. */}
        <div aria-hidden className="absolute inset-0">
          <motion.p
            {...reveal(0)}
            className="absolute top-[70px] w-full text-center text-[10px] font-medium uppercase leading-[14px] tracking-[0.4px] whitespace-pre text-white/50"
          >
            {"Tara  ·  Display + camera module"}
          </motion.p>
          <motion.div {...reveal(1)}>
            <img src="/img/entry/leader1.svg" alt="" width={80.3374} height={64.869} className="absolute top-[117px] left-[125px]" />
            <img src="/img/entry/node.svg" alt="" width={6} height={6} className="absolute top-[179px] left-[203px]" />
            <Callout number={1} label="Display" className="absolute top-[104px] left-[39px]" />
          </motion.div>
          <motion.div {...reveal(2)}>
            <img src="/img/entry/leader2.svg" alt="" width={81.3849} height={41.8192} className="absolute top-[500px] left-[171px]" />
            <img src="/img/entry/node.svg" alt="" width={6} height={6} className="absolute top-[497px] left-[168px]" />
            <Callout number={2} label="Camera, docked" className="absolute top-[527px] left-[252px]" />
          </motion.div>
        </div>
      </div>
      </div>
      <div className="relative -mt-1 shrink-0 px-5 pb-4 text-center">
        <h1 className="text-[40px] font-bold leading-[46px] tracking-[0.37px] text-white">Meet Tara</h1>
        <p className="mt-2 text-[17px] leading-[22px] tracking-[-0.43px] text-secondary">She watches the stove while you cook.</p>
      </div>
      </div>
    </Screen>
  );
}
