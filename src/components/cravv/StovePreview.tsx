"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMotionTokens } from "@/proto/motion";
import { cx } from "./utils";

/** Coil spiral from the Figma plan drawings (one shape, scaled per burner). viewBox 46 × 47.3. */
const SPIRAL = "M24.30 23.05L24.41 23.57L24.41 24.14L24.30 24.72L24.09 25.29L23.73 25.81L23.21 26.28L22.64 26.69L21.96 26.95L21.18 27.11L20.40 27.06L19.57 26.90L18.79 26.59L18.06 26.07L17.43 25.39L16.91 24.61L16.55 23.73L16.34 22.74L16.34 21.65L16.55 20.61L16.96 19.62L17.59 18.63L18.37 17.80L19.36 17.12L20.45 16.65L21.70 16.34L23.00 16.34L24.30 16.55L25.55 16.96L26.75 17.69L27.79 18.63L28.62 19.77L29.30 21.13L29.66 22.53L29.82 24.09L29.61 25.60L29.14 27.16L28.36 28.57L27.32 29.87L26.02 30.91L24.51 31.74L22.84 32.26L21.13 32.52L19.31 32.37L17.54 31.90L15.82 31.12L14.31 29.97L13.01 28.57L11.97 26.90L11.29 25.03L10.93 23.05L10.93 21.02L11.40 18.94L12.18 17.02L13.37 15.25L14.88 13.69L16.70 12.44L18.73 11.50L20.92 10.98L23.26 10.88L25.55 11.24L27.74 12.02L29.82 13.22L31.64 14.83L33.15 16.76L34.29 18.94L34.97 21.39L35.23 23.88L34.97 26.49L34.24 28.98L33.04 31.33L31.43 33.41L29.40 35.18L27.06 36.58L24.46 37.52L21.70 37.93L18.89 37.83L16.13 37.15L13.48 36.01L11.08 34.34L9.00 32.26L7.34 29.82L6.19 27.06L5.57 24.09L5.46 21.02L5.98 17.95L7.08 15.04L8.74 12.33L10.88 9.94L13.43 8.01L16.34 6.56L19.51 5.72L22.79 5.46L26.12 5.78L29.35 6.76L32.37 8.38L35.02 10.51L37.31 13.17L39.03 16.18L40.17 19.51L40.64 23.05L40.48 26.64L39.65 30.13L38.14 33.46L36.01 36.48L33.30 39.03L30.18 41.11L26.69 42.51L22.95 43.29L19.15 43.29L15.35 42.62L11.71 41.26L8.38 39.18L5.46 36.48L3.07 33.30L1.35 29.66L0.31 25.76L0.00 21.70L0.47 17.59L1.72 13.63L3.69 9.99L6.35 6.71L9.63 4.01L13.32 1.93L17.43 0.57L21.70 0.00L26.07 0.26L30.29 1.30L34.29 3.17L37.93 5.78L41.00 9.00L43.45 12.80L45.12 17.02L46.00 21.54L46.00 26.12L45.17 30.70L43.45 35.02L40.95 38.98L37.73 42.46L33.93 45.27L29.56 47.30";

type Box = readonly [x: number, y: number, w: number, h: number];
const L = 46, LH = 47.3, M = 36, MH = 37.02, S = 30;

/** Burner boxes on the 126px plan, read from Figma Stove preview Burners=1…5 (2610:4068). */
export const STOVE_LAYOUTS: Record<1 | 2 | 3 | 4 | 5, readonly Box[]> = {
  1: [[40, 40, L, LH]],
  2: [[14, 40, L, LH], [66, 40, L, LH]],
  3: [[40, 12, L, LH], [19, 72, M, MH], [71, 72, M, MH]],
  4: [[14, 13.35, L, LH], [71, 18.49, M, MH], [19, 70.49, M, MH], [66, 65.35, L, LH]],
  5: [[10, 10, S, S], [86, 10, S, S], [10, 86, S, S], [86, 86, S, S], [45, 45, M, MH]],
};

const pct = (v: number) => `${(v / 126) * 100}%`;

/** The 126px plan drawing on its own. Burners glide and rescale between layouts. */
export function StovePlan({ burners, size = 126, className }: { burners: 1 | 2 | 3 | 4 | 5; size?: number; className?: string }) {
  const m = useMotionTokens();
  const boxes = STOVE_LAYOUTS[burners];
  const t = m.reduced ? m.fade : { type: "spring" as const, duration: 0.5 * m.scale, bounce: 0.12 };
  return (
    <div
      aria-hidden
      className={cx("relative shrink-0 overflow-hidden rounded-[20px]", className)}
      style={{
        width: size,
        height: size,
        background: "var(--cravv-surface-raised)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
      }}
    >
      <AnimatePresence initial={false}>
        {boxes.map(([x, y, w, h], i) => (
          <motion.svg
            key={i}
            viewBox={`0 0 ${L} ${LH}`}
            preserveAspectRatio="none"
            fill="none"
            className="absolute"
            initial={m.reduced ? { opacity: 0 } : { opacity: 0, scale: 0.3, left: pct(x), top: pct(y), width: pct(w), height: pct(h) }}
            animate={{ opacity: 1, scale: 1, left: pct(x), top: pct(y), width: pct(w), height: pct(h) }}
            exit={m.reduced ? { opacity: 0 } : { opacity: 0, scale: 0.3 }}
            transition={t}
            style={m.reduced ? { left: pct(x), top: pct(y), width: pct(w), height: pct(h) } : undefined}
          >
            <path d={SPIRAL} stroke="var(--cravv-copper-500)" strokeOpacity={0.9} strokeWidth={0.572} strokeLinecap="round" />
          </motion.svg>
        ))}
      </AnimatePresence>
    </div>
  );
}

export type StovePreviewProps = {
  /** 1–5. Plan drawing and count line follow it. */
  burners: 1 | 2 | 3 | 4 | 5;
  /** Stove type label, e.g. "Electric coil". */
  type: string;
  className?: string;
};

/** Card on 11 · Your stove showing the plan for the picked burner count (Figma Stove preview 2610:4068). */
export function StovePreview({ burners, type, className }: StovePreviewProps) {
  return (
    <div
      className={cx("flex h-[150px] w-full items-center gap-5 rounded-[20px] border border-white/[0.06] p-[10px]", className)}
      style={{ background: "#1a1a1d" /* card fill from Figma; no token exists */ }}
      role="img"
      aria-label={`${type}, ${burners} burner${burners === 1 ? "" : "s"}`}
    >
      <StovePlan burners={burners} />
      <div className="min-w-0 pb-[3px]">
        <p className="truncate text-[24px] font-semibold leading-[29px] text-white">{type}</p>
        <p className="mt-[5px] text-[17px] leading-5 text-secondary">
          {burners} burner{burners === 1 ? "" : "s"}
        </p>
      </div>
    </div>
  );
}
