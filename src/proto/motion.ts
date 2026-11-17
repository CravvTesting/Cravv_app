"use client";

/*
 * Motion tokens. Placeholders for Ajay's motion design: change values here and every
 * screen follows. "Slow animations ×5" in the debug menu multiplies every duration.
 */
import { useReducedMotion, type Transition } from "motion/react";
import { useProto } from "./store";

export const MOTION = {
  /** iOS-like spring, about 0.35 s, no visible overshoot. */
  spring: { type: "spring", duration: 0.35, bounce: 0 } as const,
  /** Push/pop between screens. */
  page: { type: "spring", duration: 0.5, bounce: 0 } as const,
  /** Push/pop duration (ms) and curve. Runs on the compositor via the Web Animations API. */
  pageMs: 500,
  /** iOS-like ease-out: fast start, long soft settle, no overshoot. */
  easeCss: "cubic-bezier(0.32, 0.72, 0, 1)",
  /** Outgoing screen parallax on push (fraction of width). */
  parallax: 0.3,
  /** Sheet rise. */
  sheet: { type: "spring", duration: 0.45, bounce: 0 } as const,
  /** Dim behind sheets and alerts. */
  dimOpacity: 0.5,
  fade: { duration: 0.2 } as const,
};

/** 1 normally, 5 when "Slow animations ×5" is on. */
export function useMotionScale() {
  return useProto((s) => (s.debug.slowAnimations ? 5 : 1));
}

/** Scales a transition's duration by the motion scale. */
export function scaled<T extends Transition>(t: T, scale: number): T {
  const out = { ...t } as Record<string, unknown>;
  if (typeof out.duration === "number") out.duration = (out.duration as number) * scale;
  if (typeof out.delay === "number") out.delay = (out.delay as number) * scale;
  return out as T;
}

/** Convenience: scaled tokens + reduced-motion flag for components. */
export function useMotionTokens() {
  const scale = useMotionScale();
  const reduced = useReducedMotion() ?? false;
  return {
    scale,
    reduced,
    spring: scaled(MOTION.spring, scale),
    page: scaled(MOTION.page, scale),
    sheet: scaled(MOTION.sheet, scale),
    fade: scaled(MOTION.fade, scale),
  };
}
