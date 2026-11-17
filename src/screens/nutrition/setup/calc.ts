/*
 * Nutrition targets for N05 / N05b (handoff §3 Nutrition, §5).
 *
 * Calories: Mifflin–St Jeor resting energy × activity factor + goal adjustment, rounded to the
 * nearest 50 kcal. Macros: protein by g/kg (goal-dependent), fat at 30% of kcal, carbs the rest.
 *
 * CALIBRATION (prototype only): the frames were drawn for 5 ft 6 in / 150 lb (resting 1,395 kcal
 * → 1,900). The persona in the store is 64 in / 138 lb, which plain Mifflin–St Jeor puts at
 * 1,311 kcal resting → 1,800 kcal. The handoff requires 1,900 for the persona, so resting energy
 * is scaled by RESTING_CAL (1.054 → 1,382 kcal × 1.375 = 1,900). Protein uses 1.35 g/kg
 * (not the frame's 1.25) so the persona lands on 85 g. Remove both when real numbers arrive.
 */
import type { Tabs } from "@/proto/store";

export const RESTING_CAL = 1.054;

export const ACTIVITY_FACTOR: Record<Tabs["activity"], number> = {
  "mostly-sitting": 1.2,
  "lightly-active": 1.375,
  active: 1.55,
  "very-active": 1.725,
};

export const ACTIVITY_LABEL: Record<Tabs["activity"], string> = {
  "mostly-sitting": "Mostly sitting",
  "lightly-active": "Lightly active",
  active: "Active",
  "very-active": "Very active",
};

export const GOAL_KCAL: Record<Tabs["goal"], number> = { lose: -500, maintain: 0, gain: 300, "build-muscle": 250 };
export const GOAL_LABEL: Record<Tabs["goal"], string> = {
  lose: "Lose weight",
  maintain: "Maintain weight",
  gain: "Gain weight",
  "build-muscle": "Build muscle",
};
/** Protein g per kg of body weight, by goal. */
export const PROTEIN_G_PER_KG: Record<Tabs["goal"], number> = { lose: 1.6, maintain: 1.35, gain: 1.35, "build-muscle": 1.8 };

/** Extra energy and protein while pregnant or breastfeeding [assumed: 2nd-trimester figures]. */
export const PREGNANCY_KCAL = 340;
export const PREGNANCY_PROTEIN = 25;

export const FAT_SHARE = 0.3;
export const FIBER_PER_1000 = 14;
export const SODIUM_LIMIT = 2300;
export const ADDED_SUGAR_PER_MEAL = 10;
export const SAT_FAT_SHARE = 0.1;

const LB_TO_KG = 0.45359237;
const IN_TO_CM = 2.54;
const round = (v: number, step: number) => Math.round(v / step) * step;

export type Plan = {
  resting: number; // kcal, rounded
  factor: number;
  goalKcal: number;
  pregnancyKcal: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  pct: { protein: number; carbs: number; fat: number };
  fiber: number;
  sodium: number;
  addedSugar: number;
  saturatedFat: number;
  proteinPerKg: number;
};

export function computePlan(body: Tabs["body"], activity: Tabs["activity"], goal: Tabs["goal"]): Plan {
  const kg = body.weightLb * LB_TO_KG;
  const cm = body.heightIn * IN_TO_CM;
  // Mifflin–St Jeor: +5 for male, −161 for female; "other" uses the midpoint.
  const sexK = body.sex === "male" ? 5 : body.sex === "female" ? -161 : -78;
  const msj = 10 * kg + 6.25 * cm - 5 * body.age + sexK;
  const resting = Math.round(msj * RESTING_CAL);
  const factor = ACTIVITY_FACTOR[activity];
  const goalKcal = GOAL_KCAL[goal];
  const pregnant = body.sex === "female" && body.pregnant;
  const pregnancyKcal = pregnant ? PREGNANCY_KCAL : 0;
  const kcal = Math.max(1200, round(resting * factor + goalKcal + pregnancyKcal, 50));

  const proteinPerKg = PROTEIN_G_PER_KG[goal];
  const protein = round(kg * proteinPerKg + (pregnant ? PREGNANCY_PROTEIN : 0), 5);
  const fat = Math.round((kcal * FAT_SHARE) / 9);
  const carbs = round((kcal - protein * 4 - fat * 9) / 4, 5);
  const pP = Math.round(((protein * 4) / kcal) * 100);
  const pF = Math.round(FAT_SHARE * 100);

  return {
    resting,
    factor,
    goalKcal,
    pregnancyKcal,
    kcal,
    protein,
    carbs,
    fat,
    pct: { protein: pP, fat: pF, carbs: 100 - pP - pF },
    fiber: Math.round((kcal / 1000) * FIBER_PER_1000),
    sodium: SODIUM_LIMIT,
    addedSugar: ADDED_SUGAR_PER_MEAL,
    saturatedFat: Math.round((kcal * SAT_FAT_SHARE) / 9),
    proteinPerKg,
  };
}

/** Standard targets for Skip on N01: 2,000 kcal (75 g protein, 275 g carbs, 67 g fat ≈ 2,003 kcal). */
export const STANDARD_TARGETS = { kcal: 2000, protein: 75, carbs: 275, fat: 67 } as const;

/* Display helpers (store keeps US units: heightIn, weightLb). */
export const formatHeight = (inches: number, units: "us" | "metric") =>
  units === "metric" ? `${Math.round(inches * IN_TO_CM)} cm` : `${Math.floor(inches / 12)} ft ${inches % 12} in`;
export const formatWeight = (lb: number, units: "us" | "metric") =>
  units === "metric" ? `${Math.round(lb * LB_TO_KG)} kg` : `${lb} lb`;
export const cmToIn = (cm: number) => Math.round(cm / IN_TO_CM);
export const inToCm = (inches: number) => Math.round(inches * IN_TO_CM);
export const kgToLb = (kg: number) => Math.round(kg / LB_TO_KG);
export const lbToKg = (lb: number) => Math.round(lb * LB_TO_KG);
