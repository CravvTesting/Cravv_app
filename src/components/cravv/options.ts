/*
 * Colour map from Figma (Components · Onboarding → Colour map, 2618:4049).
 * Each option names its icon and its option token. Token "diet-vegan" means
 *   base: var(--cravv-option-diet-vegan-base)  → icon, 14% tint, outline, check
 *   fill: var(--cravv-option-diet-vegan-fill)  → solid selected background (white text ≥ 4.6:1)
 * Grey (--cravv-option-icon-off) means not chosen. Copper is never an option colour.
 */
import type { IconName } from "./iconGlyphs";

export type OptionToken =
  | "diet-everything" | "diet-vegetarian" | "diet-vegan" | "diet-pescatarian" | "diet-gluten-free" | "diet-dairy-free"
  | "allergy-avoid"
  | "cuisine-american" | "cuisine-italian" | "cuisine-mexican" | "cuisine-chinese"
  | "cuisine-mediterranean" | "cuisine-japanese" | "cuisine-thai" | "cuisine-indian"
  | "skill-new" | "skill-comfortable" | "skill-confident"
  | "stove-gas" | "stove-induction" | "stove-electric-coil" | "stove-infrared"
  | "setup-power" | "setup-range-hood" | "setup-wifi"
  | "live-temperature" | "live-whistles" | "live-timer"
  | "feedback-tip";

export type Option<Id extends string = string> = {
  id: Id;
  label: string;
  icon: IconName;
  token: OptionToken;
  /** Secondary line (choice/info tiles). */
  hint?: string;
};

/** `var(--cravv-option-<token>-base)`: icon colour when chosen, tints, outlines, checks. */
export const optionBase = (token: OptionToken) => `var(--cravv-option-${token}-base)`;
/** `var(--cravv-option-<token>-fill)`: solid selected background. */
export const optionFill = (token: OptionToken) => `var(--cravv-option-${token}-fill)`;
/** Base colour at 14% for tinted backgrounds. */
export const optionTint = (token: OptionToken, pct = 14) =>
  `color-mix(in srgb, var(--cravv-option-${token}-base) ${pct}%, transparent)`;

/** 04 · Your kitchen: multi-select diet chips. */
export const DIETS = [
  { id: "everything", label: "Everything", icon: "utensils", token: "diet-everything" },
  { id: "vegetarian", label: "Vegetarian", icon: "leaf", token: "diet-vegetarian" },
  { id: "vegan", label: "Vegan", icon: "sprout", token: "diet-vegan" },
  { id: "pescatarian", label: "Pescatarian", icon: "fish", token: "diet-pescatarian" },
  { id: "gluten-free", label: "Gluten-free", icon: "wheat", token: "diet-gluten-free" },
  { id: "dairy-free", label: "Dairy-free", icon: "milk", token: "diet-dairy-free" },
] as const satisfies readonly Option[];

/** 04 · Your kitchen: allergy chips. All share `allergy-avoid`; picked chips use state="avoid" (struck icon). */
export const ALLERGIES = [
  { id: "peanuts", label: "Peanuts", icon: "peanut", token: "allergy-avoid" },
  { id: "tree-nuts", label: "Tree nuts", icon: "acorn", token: "allergy-avoid" },
  { id: "shellfish", label: "Shellfish", icon: "shrimp", token: "allergy-avoid" },
  { id: "wheat", label: "Wheat", icon: "wheat", token: "allergy-avoid" },
  { id: "eggs", label: "Eggs", icon: "egg", token: "allergy-avoid" },
  { id: "milk", label: "Milk", icon: "milk", token: "allergy-avoid" },
  { id: "soy", label: "Soy", icon: "soy", token: "allergy-avoid" },
  { id: "fish", label: "Fish", icon: "fish", token: "allergy-avoid" },
  { id: "sesame", label: "Sesame", icon: "sesame", token: "allergy-avoid" },
  { id: "other", label: "Other", icon: "plus", token: "allergy-avoid" },
] as const satisfies readonly Option[];

/** 04 · Your kitchen: cuisine chips. Eight distinct hues. */
export const CUISINES = [
  { id: "american", label: "American", icon: "burger", token: "cuisine-american" },
  { id: "italian", label: "Italian", icon: "pizza", token: "cuisine-italian" },
  { id: "mexican", label: "Mexican", icon: "taco", token: "cuisine-mexican" },
  { id: "chinese", label: "Chinese", icon: "noodles", token: "cuisine-chinese" },
  { id: "mediterranean", label: "Mediterranean", icon: "olive", token: "cuisine-mediterranean" },
  { id: "japanese", label: "Japanese", icon: "sushi", token: "cuisine-japanese" },
  { id: "thai", label: "Thai", icon: "chili", token: "cuisine-thai" },
  { id: "indian", label: "Indian", icon: "bowl", token: "cuisine-indian" },
] as const satisfies readonly Option[];

/** 05 · How you cook: single-choice tiles. Hints from frame 2525:2745. */
export const SKILLS = [
  { id: "new", label: "New", icon: "sprout", token: "skill-new", hint: "Every step explained" },
  { id: "comfortable", label: "Comfortable", icon: "chef", token: "skill-comfortable", hint: "Skips the basics" },
  { id: "confident", label: "Confident", icon: "flame", token: "skill-confident", hint: "Key moments only" },
] as const satisfies readonly Option[];

/** 11 · Your stove: list rows; the check takes the same colour. */
export const STOVE_TYPES = [
  { id: "gas", label: "Gas", icon: "flame", token: "stove-gas" },
  { id: "induction", label: "Induction", icon: "waves", token: "stove-induction" },
  { id: "electric-coil", label: "Electric coil", icon: "coil", token: "stove-electric-coil" },
  { id: "infrared", label: "Infrared", icon: "infrared", token: "stove-infrared" },
] as const satisfies readonly Option[];

/** Read-only info tiles ("what you need"): always in colour. Hints from the "Need ·" tiles in the screens. */
export const SETUP_NEEDS = [
  { id: "power", label: "Power", icon: "plug", token: "setup-power", hint: "Outlet nearby" },
  { id: "range-hood", label: "Range hood", icon: "hood", token: "setup-range-hood", hint: "Metal underside" },
  { id: "wifi", label: "Wi-Fi", icon: "wifi", token: "setup-wifi", hint: "Password handy" },
] as const satisfies readonly Option[];

export type DietId = (typeof DIETS)[number]["id"];
export type AllergyId = (typeof ALLERGIES)[number]["id"];
export type CuisineId = (typeof CUISINES)[number]["id"];
export type SkillId = (typeof SKILLS)[number]["id"];
export type StoveTypeId = (typeof STOVE_TYPES)[number]["id"];
export type SetupNeedId = (typeof SETUP_NEEDS)[number]["id"];
