"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionTokens } from "@/proto/motion";

/**
 * Returns a number that eases from its previous value to `value` (requestAnimationFrame, text
 * only). The first render shows `value` unless `from` is given. Reduced motion: jumps.
 */
export function useCountUp(value: number, { duration = 0.6, from }: { duration?: number; from?: number } = {}) {
  const m = useMotionTokens();
  const [shown, setShown] = useState(from ?? value);
  const current = useRef(from ?? value);

  useEffect(() => {
    const start = current.current;
    if (start === value) return;
    if (m.reduced) {
      current.current = value;
      setShown(value);
      return;
    }
    const ms = duration * 1000 * m.scale;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      const e = 1 - Math.pow(1 - k, 3); // ease-out cubic
      const v = start + (value - start) * e;
      current.current = v;
      setShown(v);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, m.reduced, m.scale]);

  return Math.round(shown);
}

/** 1070 → "1,070". */
export const formatNumber = (n: number) => Math.round(n).toLocaleString("en-US");
