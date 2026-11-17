"use client";

/*
 * Simulation timings from handoff section 4 (ms at 1× speed).
 * The debug menu's Speed setting divides all of them.
 */
import { useEffect, useRef } from "react";
import { useProto } from "./store";

export const TIMING = {
  fakeSignInSheet: 1200,
  searchFound: 3000,
  searchTimeout: 8000,
  wifiJoin: 1500,
  update: 8000,
  calibration: 6000,
  offlineToBackOnline: 3000,
  backOnlinePillFade: 2000,
  openSettingsRoundTrip: 1000,
} as const;
export type TimingKey = keyof typeof TIMING;

export function useSpeed() {
  return useProto((s) => s.debug.speed);
}

/** Returns a function giving the scaled duration for a timing key. */
export function useTiming() {
  const speed = useSpeed();
  return (key: TimingKey) => TIMING[key] / speed;
}

/** Run `fn` once after a scaled delay; cleared on unmount. Pass enabled=false to hold. */
export function useAfter(key: TimingKey, fn: () => void, enabled = true) {
  const speed = useSpeed();
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (!enabled) return;
    const t = setTimeout(() => ref.current(), TIMING[key] / speed);
    return () => clearTimeout(t);
  }, [key, speed, enabled]);
}

/** Promise-based scaled wait, for button handlers: `await wait(ms("wifiJoin"))`. */
export const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
