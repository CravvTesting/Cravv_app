"use client";

import { useLayoutEffect, type RefObject } from "react";

/*
 * Scroll memory per screen: each tab keeps its stack AND each screen its scroll position, so
 * switching tabs (which remounts screens) or popping back restores where you were.
 */
const positions = new Map<string, number>();

export function useScrollMemory(ref: RefObject<HTMLElement | null>, key: string) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const saved = positions.get(key);
    if (saved) el.scrollTop = saved;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => positions.set(key, el.scrollTop));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); positions.set(key, el.scrollTop); cancelAnimationFrame(raf); };
  }, [ref, key]);
}

/** Forget a screen's position (e.g. after its content changes completely). */
export function forgetScroll(key: string) { positions.delete(key); }
