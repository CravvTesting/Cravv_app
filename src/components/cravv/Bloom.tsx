"use client";

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
 *
 * Uses a scaled circle with CSS transitions on transform/opacity only, so it runs on the
 * compositor (smooth on iPhone even while the screen re-renders). clip-path animations
 * repaint every frame on the main thread and stutter.
 */
const R = 220; // circle radius in px: covers a chip or tile from any corner

export function BloomFill({ on, color, origin }: { on: boolean; color: string; origin: Origin }) {
  const m = useMotionTokens();
  const ox = origin ? origin.x : "50%";
  const oy = origin ? origin.y : "50%";
  const grow = `transform ${0.5 * m.scale}s var(--ease-ios), opacity ${0.12 * m.scale}s linear`;
  const fade = `opacity ${0.2 * m.scale}s ease, transform 0s linear ${0.2 * m.scale}s`;
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute"
      style={{
        left: typeof ox === "number" ? ox - R : `calc(${ox} - ${R}px)`,
        top: typeof oy === "number" ? oy - R : `calc(${oy} - ${R}px)`,
        width: R * 2,
        height: R * 2,
        borderRadius: "50%",
        background: color,
        transform: m.reduced ? "none" : on ? "scale(1)" : "scale(0)",
        opacity: on ? 1 : 0,
        transition: on ? grow : fade,
        willChange: "transform, opacity",
      }}
    />
  );
}

/** CSS colour transition that follows the slow-motion multiplier. */
export function useColorTransition() {
  const { scale, reduced } = useMotionTokens();
  return `color ${(reduced ? 0.2 : 0.3) * scale}s ease, opacity ${0.3 * scale}s ease`;
}
