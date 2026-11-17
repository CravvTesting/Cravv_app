"use client";

import { motion } from "motion/react";
import { useMotionTokens } from "@/proto/motion";
import { cx } from "./utils";

export type StepProgressProps = {
  /** 3 (Personalise) or 4 (Connect). */
  steps: 3 | 4;
  /** 1-based current step. Done and current are copper; the rest 15% white. */
  current: number;
  /** Fill the current segment left→right on mount. Default true. */
  animate?: boolean;
  className?: string;
};

/** Onboarding step bar beside the back button (Figma Step progress 2611:4083). 4px tall, fills its width. */
export function StepProgress({ steps, current, animate = true, className }: StepProgressProps) {
  const m = useMotionTokens();
  return (
    <div
      role="progressbar"
      aria-label="Setup progress"
      aria-valuemin={1}
      aria-valuemax={steps}
      aria-valuenow={current}
      aria-valuetext={`Step ${current} of ${steps}`}
      className={cx("flex h-1 w-full gap-1.5", className)}
    >
      {Array.from({ length: steps }, (_, i) => {
        const n = i + 1;
        const isCurrent = n === current;
        return (
          <div key={n} className="relative h-full min-w-0 flex-1 overflow-hidden rounded-[2px] bg-white/15">
            {n <= current && (
              <motion.div
                key={isCurrent ? `cur-${current}` : "done"}
                className="absolute inset-0 origin-left rounded-[2px]"
                style={{ background: "var(--cravv-progress-fill)" }}
                initial={isCurrent && animate ? (m.reduced ? { opacity: 0 } : { scaleX: 0 }) : false}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={m.reduced ? m.fade : { type: "spring", duration: 0.6 * m.scale, bounce: 0, delay: 0.1 * m.scale }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
