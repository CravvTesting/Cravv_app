"use client";

/*
 * 13 · Calibrating group: 13 (live), 13p (Tara offline), 13r (back online),
 * 13s (matched), 13x (sees fewer), 13y (sees more). One component; the id changes in place
 * (no page slide) and every change animates here.
 * Frames 2537:2804, 2628:4717, 2628:4770, 2537:2904, 2537:3002, 2541:2813.
 */
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { CalibrationProgress, CalibrationResult, PrimaryButton, StatusPill, TextButton } from "@/components/cravv";
import { useMotionTokens } from "@/proto/motion";
import { back, go, useNavState } from "@/proto/nav";
import { useProto, type Burners, type ScreenId } from "@/proto/store";
import { useAfter, useTiming } from "@/proto/timing";
import { Screen, ScreenHeader } from "@/proto/ui";
import type { ScreenProps } from "./registry";
import { Dot, FeedPill, LiveView, type LiveTone } from "./calib/LiveView";

const RESULT_ID = { match: "13s", fewer: "13x", more: "13y" } as const;

/** Change the visible state without a page transition or a new history entry. */
const swap = (id: ScreenId) => go(id, { dir: "none", replace: true });
/** True while the router is still on `id` (guards timers during the exit animation). */
const stillOn = (id: ScreenId) => useNavState.getState().id === id;

const plural = (n: number) => `${n} burner${n === 1 ? "" : "s"}`;

/** Burners Tara ends up counting for each outcome. */
function seenFor(outcome: "match" | "fewer" | "more", burners: number) {
  return outcome === "fewer" ? Math.max(0, burners - 1) : outcome === "more" ? burners + 1 : burners;
}

/** Fades/slides text when its key changes. */
function Swap({ k, children, className }: { k: string; children: React.ReactNode; className?: string }) {
  const m = useMotionTokens();
  return (
    <AnimatePresence initial={false} mode="popLayout">
      <motion.div
        key={k}
        className={className}
        initial={{ opacity: 0, y: m.reduced ? 0 : 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: m.reduced ? 0 : -6 }}
        transition={m.reduced ? m.fade : m.spring}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/** Number that ticks up with a small vertical roll. */
function Tick({ n }: { n: number }) {
  const m = useMotionTokens();
  return (
    <span className="relative inline-flex overflow-hidden tabular-nums">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={n}
          initial={m.reduced ? { opacity: 0 } : { y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={m.reduced ? { opacity: 0 } : { y: "-100%", opacity: 0 }}
          transition={m.reduced ? m.fade : m.spring}
        >
          {n}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function S13({ id }: ScreenProps) {
  const m = useMotionTokens();
  const ms = useTiming();
  const burners = useProto((s) => s.burners);
  const wifi = useProto((s) => s.wifi);
  const outcome = useProto((s) => s.debug.calibration);
  const set = useProto((s) => s.set);

  // Entering the group on "13" starts a new run; a deep link to 13p/13r keeps the saved progress.
  const [progress, setProgress] = useState(() => (id === "13" ? 0 : useProto.getState().calibrationProgress));
  const entered = useRef(false);
  useEffect(() => {
    if (entered.current) return;
    entered.current = true;
    if (id === "13") useProto.getState().set({ calibrationProgress: 0, wifiDroppedThisRun: false });
  }, [id]);

  const calibrating = id === "13";
  const paused = id === "13p" || id === "13r";
  const isResult = id === "13s" || id === "13x" || id === "13y";
  const total = ms("calibration");

  // Calibration clock: fills over TIMING.calibration from the saved progress.
  useEffect(() => {
    if (!calibrating) return;
    const from = useProto.getState().calibrationProgress;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      if (!stillOn("13")) return;
      const p = Math.min(1, from + (now - start) / total);
      const s = useProto.getState();
      if (s.debug.dropWifi && !s.wifiDroppedThisRun && p >= 0.5) {
        s.set({ wifiDroppedThisRun: true, calibrationProgress: p });
        setProgress(p);
        swap("13p");
        return;
      }
      setProgress(p);
      if (p >= 1) {
        s.set({ calibrationProgress: 0 });
        swap(RESULT_ID[s.debug.calibration]);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [calibrating, total]);

  // 13p → 13r after TIMING.offlineToBackOnline; 13r → 13 (resume) after the pill fades.
  useAfter("offlineToBackOnline", () => stillOn("13p") && swap("13r"), id === "13p");
  useAfter("backOnlinePillFade", () => stillOn("13r") && swap("13"), id === "13r");

  // What Tara is counting toward.
  const target = isResult
    ? seenFor(id === "13s" ? "match" : id === "13x" ? "fewer" : "more", burners)
    : seenFor(outcome, burners);
  const counted = Math.max(1, Math.min(target, Math.ceil(progress * target)));

  const tone: LiveTone = id === "13s" ? "success" : id === "13x" || id === "13y" ? "warning" : "copper";
  const dot = tone === "success" ? "var(--cravv-status-success)" : tone === "warning" ? "var(--cravv-status-warning)" : "var(--cravv-copper-500)";

  const chip =
    id === "13p" ? null : (
      <FeedPill className="h-7">
        <Dot color={dot} />
        <span className="text-[13px] font-semibold">
          Tara sees {isResult ? target : <Tick n={counted} />} {(isResult ? target : counted) === 1 ? "burner" : "burners"}
          {isResult ? "" : "…"}
        </span>
      </FeedPill>
    );

  const title = id === "13s" ? (burners === 1 ? "Tara sees your burner" : `Tara sees all ${plural(burners)}`) : isResult ? `Tara sees ${plural(target)}` : "Calibrating";
  const subtitle =
    id === "13s"
      ? "That matches your stove. Calibration is done."
      : isResult
        ? `You picked ${burners}.`
        : "Tara is counting your burners. Keep the stove clear for a moment.";

  const cancel = () => {
    set({ calibrationProgress: 0, wifiDroppedThisRun: false });
    back(); // onboarding → 12; from Profile (Recalibrate) → back to where it started
  };
  const retry = () => {
    set({ calibrationProgress: 0, wifiDroppedThisRun: false });
    setProgress(0);
    swap("13");
  };
  const changeCount = () => {
    if (id === "13y") set({ burners: Math.min(5, target) as Burners });
    set({ calibrationProgress: 0, wifiDroppedThisRun: false });
    go("11", { dir: "pop" });
  };

  const footerKey = id === "13s" ? "continue" : isResult ? "retry" : "cancel";

  return (
    <Screen
      header={<ScreenHeader steps={4} current={4} onBack={cancel} />}
      footer={
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={footerKey}
            className="flex flex-col gap-1"
            initial={{ opacity: 0, y: m.reduced ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={m.reduced ? m.fade : m.spring}
          >
            {footerKey === "cancel" && <TextButton onClick={cancel}>Cancel</TextButton>}
            {footerKey === "continue" && <PrimaryButton onClick={() => go("13n")}>Continue</PrimaryButton>}
            {footerKey === "retry" && (
              <>
                <PrimaryButton onClick={retry}>Retry</PrimaryButton>
                <TextButton onClick={changeCount}>Change Burner Count</TextButton>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      }
    >
      <Swap k={title} className="mt-1.5">
        <h1 className="text-[34px] font-bold leading-[41px] tracking-[0.4px]">{title}</h1>
      </Swap>

      {/* Subtitle slot; 13p/13r swap in the connection pill. */}
      <div className="relative mt-[5px] min-h-[40px]">
        <AnimatePresence initial={false} mode="popLayout">
          {paused ? (
            <motion.div
              key="pill"
              className="pt-1.5"
              initial={m.reduced ? { opacity: 0 } : { opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.4 * m.scale } }}
              transition={m.reduced ? m.fade : { type: "spring", duration: 0.45 * m.scale, bounce: 0.2 }}
            >
              <StatusPill tone={id === "13p" ? "warning" : "success"} className="transition-[background-color,color] duration-300">
                {id === "13p" ? "Tara lost Wi-Fi · reconnecting" : `Back online · ${wifi}`}
              </StatusPill>
            </motion.div>
          ) : (
            <motion.p
              key={subtitle}
              className="text-[15px] leading-5 text-secondary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={m.fade}
            >
              {subtitle}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-2.5">
        <LiveView tone={tone} breathe={calibrating} chip={chip} offline={id === "13p"} />
      </div>

      <div className="mt-4 pb-4">
        <AnimatePresence initial={false} mode="wait">
          {isResult ? (
            <motion.div key="result" exit={{ opacity: 0 }}>
              <CalibrationResult seen={target} picked={burners} />
              {id !== "13s" && (
                <motion.p
                  className="mt-2.5 px-4 text-[13px] font-semibold leading-[18px] text-warning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ ...m.fade, delay: 0.15 * m.scale }}
                >
                  Retry calibration, or change the number of burners.
                </motion.p>
              )}
            </motion.div>
          ) : (
            <motion.div key="progress" exit={{ opacity: 0, transition: m.fade }}>
              <CalibrationProgress
                label={paused && id === "13p" ? `Paused at ${counted} of ${plural(burners)}` : `Looking for ${plural(burners)}`}
                progress={progress}
                className={`[&_[role=progressbar]>div]:transition-[filter] [&_[role=progressbar]>div]:duration-300 ${id === "13p" ? "[&_[role=progressbar]>div]:grayscale" : ""}`}
              />
              <p className="mt-2.5 px-4 text-[13px] leading-[18px] text-secondary">You only see this live view during setup. It isn’t saved.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Screen>
  );
}
