"use client";

/*
 * 10b · Updating Tara. Ring and bar fill 0 → 100% over TIMING.update (motion moment 9);
 * at 100% the ring turns into a check, then → 11.
 */
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { useMotionTokens } from "@/proto/motion";
import { back, go } from "@/proto/nav";
import { useTiming } from "@/proto/timing";
import { Screen, ScreenHeader } from "@/proto/ui";

const SIZE = 220;
const STROKE = 11;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

export default function S10b() {
  const m = useMotionTokens();
  const ms = useTiming();
  const progress = useMotionValue(0);
  const [pct, setPct] = useState(0);
  const done = pct >= 100;
  const dashOffset = useTransform(progress, (p) => CIRC * (1 - p));
  const barWidth = useTransform(progress, (p) => `${p * 100}%`);
  useMotionValueEvent(progress, "change", (p) => setPct(Math.round(p * 100)));

  useEffect(() => {
    const total = ms("update");
    let t: ReturnType<typeof setTimeout> | undefined;
    const controls = animate(progress, 1, {
      duration: total / 1000,
      ease: [0.3, 0, 0.6, 1],
      onComplete: () => {
        // Hold on the check for an eighth of the update time (scaled by Speed), then move on.
        t = setTimeout(() => go("11", { replace: true }), total / 8);
      },
    });
    return () => {
      controls.stop();
      if (t) clearTimeout(t);
    };
    // Runs once per mount; Speed changes mid-update don't restart it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const swap = m.reduced ? { opacity: 0 } : { opacity: 0, scale: 0.8 };

  return (
    <Screen header={<ScreenHeader steps={4} current={2} onBack={() => back("10")} />}>
      <h1 className="text-[34px] font-bold leading-[41px] tracking-[0.4px]">Updating Tara</h1>
      <p className="mt-[5px] text-[15px] leading-5 text-secondary">Keep Tara plugged in. This takes about 2 minutes.</p>

      <div
        className="relative mx-auto mt-[70px] flex items-center justify-center"
        style={{ width: SIZE, height: SIZE }}
        role="progressbar"
        aria-label="Update progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 -rotate-90" aria-hidden>
          <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="white" strokeOpacity={0.08} strokeWidth={STROKE} />
          <motion.circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="var(--cravv-progress-fill)"
            strokeWidth={STROKE}
            strokeDasharray={CIRC}
            style={{ strokeDashoffset: dashOffset }}
          />
        </svg>
        <AnimatePresence mode="popLayout" initial={false}>
          {done ? (
            <motion.div key="check" className="flex flex-col items-center" initial={swap} animate={{ opacity: 1, scale: 1 }} transition={m.spring}>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
                <motion.path
                  d="M16 33.5L27 44.5L48 21"
                  stroke="var(--cravv-progress-fill)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={m.reduced ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4 * m.scale, ease: "easeOut" }}
                />
              </svg>
              <p className="mt-1 text-[13px] text-secondary">Updated</p>
            </motion.div>
          ) : (
            <motion.div key="pct" className="flex w-40 flex-col items-center text-center" exit={swap} transition={m.spring}>
              <p className="text-[44px] font-bold leading-[52px] tabular-nums">{pct}%</p>
              <p className="text-[13px] text-secondary">Installing</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-[34px] rounded-[20px] bg-white/15 px-4 pb-5 pt-[13px]">
        <p className="text-[17px] leading-5 text-white">Tara restarts when it’s done</p>
        <div className="mt-[13px] h-1.5 overflow-hidden rounded-[3px] bg-white/12">
          <motion.div className="h-full rounded-[3px]" style={{ width: barWidth, background: "var(--cravv-progress-fill)" }} />
        </div>
      </div>
      <p className="mt-3 px-4 pb-6 text-[13px] leading-4 text-secondary">Updates keep Tara’s recipes and safety checks current.</p>
    </Screen>
  );
}
