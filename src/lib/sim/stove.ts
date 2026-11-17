/**
 * Simulated stove + camera module for onboarding (screens 11–14b).
 * Swap these functions for real device calls once the hardware API exists.
 */
import type { StoveType } from "@/lib/store";

export const STOVE_TYPES: { id: StoveType; label: string; icon: string; iconActive: string }[] = [
  { id: "gas", label: "Gas", icon: "/img/stove/icon-flame.svg", iconActive: "/img/stove/icon-flame-active.svg" },
  { id: "induction", label: "Induction", icon: "/img/stove/icon-waves.svg", iconActive: "/img/stove/icon-waves-active.svg" },
  { id: "electric-coil", label: "Electric coil", icon: "/img/stove/icon-coil-inactive.svg", iconActive: "/img/stove/icon-coil.svg" },
  { id: "infrared", label: "Infrared", icon: "/img/stove/icon-infrared.svg", iconActive: "/img/stove/icon-infrared-active.svg" },
];

export const BURNER_OPTIONS = [2, 4, 5, 6] as const;

export const stoveLabel = (t: StoveType) => STOVE_TYPES.find((s) => s.id === t)?.label ?? "Stove";

export const burnersLabel = (n: number) => `${n} burner${n === 1 ? "" : "s"}`;

/** Per note 14b ("Proposed"): All set becomes the start of the first cook. */
export const ROUTE_AFTER_CALIBRATION = "/setup/first-cook";

export type Scenario = "match" | "fewer" | "more";

export const CALIBRATION_MS = 3000;

export function parseScenario(v: string | null): Scenario {
  return v === "fewer" || v === "more" ? v : "match";
}

/** How many burners the (fake) camera reports. ?scenario=fewer → 3, ?scenario=more → 5. */
export function simulatedCount(expected: number, scenario: Scenario) {
  if (scenario === "fewer") return expected === 3 ? 2 : 3;
  if (scenario === "more") return expected === 5 ? 6 : 5;
  return expected;
}

/**
 * Runs a fake calibration: reports progress 0→1 over CALIBRATION_MS, then
 * resolves with the burner count Tara "sees". Returns a cancel function.
 */
export function runCalibration(opts: {
  expected: number;
  scenario: Scenario;
  onProgress: (p: number) => void;
  onDone: (seen: number) => void;
}) {
  const start = performance.now();
  let raf = 0;
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / CALIBRATION_MS);
    opts.onProgress(p);
    if (p < 1) raf = requestAnimationFrame(tick);
    else opts.onDone(simulatedCount(opts.expected, opts.scenario));
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

/** "Tonight's pick follows the food answers from 04" (note 14). */
export function pickFirstRecipe(diet: string) {
  const veg = /veg/i.test(diet);
  return veg
    ? { name: "Black Bean Tacos", time: "30 min", handsOn: "10 min hands-on", cuisine: "Mexican", image: "/img/stove/dish-tacos.png" }
    : { name: "Chicken Tacos", time: "25 min", handsOn: "10 min hands-on", cuisine: "Mexican", image: "/img/stove/dish-tacos.png" };
}

/** "vegetarian, no peanuts, serves 2" */
export function pickedForYou(diet: string, allergies: string[], servings: number) {
  const parts: string[] = [];
  if (diet && !/^(everything|none|no preference)$/i.test(diet)) parts.push(diet.toLowerCase());
  for (const a of allergies) parts.push(`no ${a.toLowerCase()}`);
  parts.push(`serves ${servings}`);
  return parts.join(", ");
}
