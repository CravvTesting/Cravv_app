"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState, type PointerEvent } from "react";
import { useMotionTokens } from "@/proto/motion";

type Origin = { x: number; y: number } | null;

/**
 * Remembers where the last press landed inside an element so a colour fill can bloom from it.
 * Spread `onPointerDown` on the pressable; pass `origin` to <BloomFill>.
 * Keyboard activation (no pointer) blooms from the centre.
 */
export function useBloomOrigin() {
  const [origin, setOrigin] = useState<Origin>(null);
  const onPointerDown = useCallback((e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin({ x: e.clientX - r.left, y: e.clientY - r.top });
  }, []);
  const onKeyDown = useCallback(() => setOrigin(null), []);
  return { origin, onPointerDown, onKeyDown };
}

/**
 * Solid fill layer that reveals as a circle growing from `origin` when `on` turns true,
 * and fades when it turns false. Reduced motion: plain crossfade.
 * Place as the first child of a `relative overflow-hidden` element.
 */
export function BloomFill({ on, color, origin }: { on: boolean; color: string; origin: Origin }) {
  const m = useMotionTokens();
  const at = origin ? `${origin.x}px ${origin.y}px` : "50% 50%";
  return (
    <AnimatePresence initial={false}>
      {on && (
        <motion.span
          key="fill"
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: color }}
          initial={m.reduced ? { opacity: 0 } : { clipPath: `circle(0% at ${at})` }}
          animate={m.reduced ? { opacity: 1 } : { clipPath: `circle(150% at ${at})`, opacity: 1 }}
          exit={{ opacity: 0, transition: m.fade }}
          transition={m.reduced ? m.fade : { ...m.spring, duration: m.spring.duration * 1.4 }}
        />
      )}
    </AnimatePresence>
  );
}

/** CSS colour transition that follows the slow-motion multiplier. */
export function useColorTransition() {
  const { scale, reduced } = useMotionTokens();
  return `color ${(reduced ? 0.2 : 0.3) * scale}s ease, opacity ${0.3 * scale}s ease`;
}
