"use client";

import { motion } from "motion/react";
import { useMotionTokens } from "@/proto/motion";
import { cx } from "./utils";

export type CalibrationOutcome = "matched" | "fewer" | "more";

/** Derives the outcome from what Tara counted vs what the user picked. */
export const calibrationOutcome = (seen: number, picked: number): CalibrationOutcome =>
  seen === picked ? "matched" : seen < picked ? "fewer" : "more";

export type CalibrationResultProps = {
  /** Burners Tara counted. */
  seen: number;
  /** Burners the user picked on 11. */
  picked: number;
  className?: string;
};

/**
 * Result card after calibration (Figma Calibration result 2612:4077). Matched = green check row;
 * Fewer/More = two rows with Tara's count in amber. Counts only. Reveals with a small settle.
 */
export function CalibrationResult({ seen, picked, className }: CalibrationResultProps) {
  const m = useMotionTokens();
  const outcome = calibrationOutcome(seen, picked);
  return (
    <motion.div
      key={outcome}
      role="status"
      className={cx("overflow-hidden rounded-[20px] text-[17px] text-white", className)}
      style={{ background: "var(--cravv-surface-raised)" }}
      initial={m.reduced ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={m.reduced ? m.fade : { type: "spring", duration: 0.5 * m.scale, bounce: 0.25 }}
    >
      {outcome === "matched" ? (
        <div className="flex h-[60px] items-center gap-3 px-4">
          <motion.svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            aria-hidden
            className="shrink-0"
            initial={m.reduced ? false : { scale: 0.4 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.45 * m.scale, bounce: 0.4, delay: 0.08 * m.scale }}
          >
            <rect width="28" height="28" rx="14" fill="var(--cravv-status-success)" />
            <path d="M7 14L12 19L21 8" stroke="var(--cravv-black)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </motion.svg>
          <span className="flex-1 font-semibold">
            {seen} of {picked} burners
          </span>
          <span className="text-success">Matched</span>
        </div>
      ) : (
        <>
          <div className="relative flex h-[52px] items-center justify-between px-4">
            <span>Tara sees</span>
            <span className="font-semibold text-warning">{seen}</span>
            <span aria-hidden className="absolute bottom-0 left-4 right-0 h-px bg-[rgba(84,84,88,0.6)]" />
          </div>
          <div className="flex h-[52px] items-center justify-between px-4">
            <span>You picked</span>
            <span className="font-semibold">{picked}</span>
          </div>
        </>
      )}
    </motion.div>
  );
}

export type CalibrationProgressProps = {
  /** e.g. "Looking for 4 burners". */
  label: string;
  /** 0..1. Copper fill. */
  progress: number;
  className?: string;
};

/** Live progress card while Tara calibrates (Figma Calibration progress 2612:4084). */
export function CalibrationProgress({ label, progress, className }: CalibrationProgressProps) {
  const m = useMotionTokens();
  const p = Math.max(0, Math.min(1, progress));
  return (
    <div
      className={cx("flex h-[72px] flex-col justify-start overflow-hidden rounded-[20px] px-4 pt-[13px]", className)}
      style={{ background: "var(--cravv-surface-raised)" }}
    >
      <span aria-live="polite" className="text-[17px] leading-[20px] text-white">
        {label}
      </span>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(p * 100)}
        className="mt-[13px] h-1.5 overflow-hidden rounded-[3px] bg-white/12"
      >
        <motion.div
          className="h-full origin-left rounded-[3px]"
          style={{ background: "var(--cravv-progress-fill)" }}
          initial={false}
          animate={{ width: `${p * 100}%` }}
          transition={m.reduced ? { duration: 0 } : { type: "spring", duration: 0.5 * m.scale, bounce: 0 }}
        />
      </div>
    </div>
  );
}
