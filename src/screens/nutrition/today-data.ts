/*
 * Nutrition Today/Week/Month: derivations from the store (meals, targets, watching).
 * Nothing here holds numbers of its own except the fake food database (R06) and the
 * nutrient limits that aren't in store.targets (fiber, sodium, saturated fat, added sugar).
 */
import type { IconName, NutrientId } from "@/components/cravv";
import { MEAL_PHOTOS, TODAY, type Meal, type MealSlot } from "@/proto/seed/meals";
import type { Tabs } from "@/proto/store";

export { TODAY };
export type { Meal, MealSlot };

/** Limits and minimums from N05 (not editable in store.targets). Added sugar is per meal. */
export const LIMITS = { fiber: 27, sodium: 2300, "saturated-fat": 21, "added-sugar": 10 } as const;

export type Totals = {
  kcal: number; protein: number; carbs: number; fat: number;
  fiber: number; sodium: number; satFat: number; sugar: number;
  /** Highest added sugar in one meal (the limit is per meal). */
  sugarMaxMeal: number;
};

const n = (v: number | undefined) => v ?? 0;
export const servingsOf = (m: Meal) => m.servings ?? 1;

export function totalsOf(meals: Meal[]): Totals {
  const t: Totals = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, satFat: 0, sugar: 0, sugarMaxMeal: 0 };
  for (const m of meals) {
    const s = servingsOf(m);
    t.kcal += m.kcal;
    t.protein += n(m.protein) * s;
    t.carbs += n(m.carbs) * s;
    t.fat += n(m.fat) * s;
    t.fiber += n(m.fiber) * s;
    t.sodium += n(m.sodium) * s;
    t.satFat += n(m.satFat) * s;
    t.sugar += n(m.sugar) * s;
    t.sugarMaxMeal = Math.max(t.sugarMaxMeal, n(m.sugar) * s);
  }
  for (const k of Object.keys(t) as (keyof Totals)[]) t[k] = Math.round(t[k]);
  return t;
}

export const mealsOn = (meals: Meal[], day: string) => meals.filter((m) => m.day === day);

/**
 * Today's totals. Debug "Over a limit: nothing over" eases saturated fat under its limit
 * (as if the curry had used light coconut milk), so the amber state can be switched off.
 */
export function todayTotals(meals: Meal[], overLimit: "saturated-fat" | "none"): Totals {
  const t = totalsOf(mealsOn(meals, TODAY));
  if (overLimit === "none" && t.satFat > LIMITS["saturated-fat"]) t.satFat = Math.round(LIMITS["saturated-fat"] * 0.8);
  return t;
}

export function valueOf(t: Totals, id: NutrientId): number {
  switch (id) {
    case "protein": return t.protein;
    case "carbs": return t.carbs;
    case "fat": return t.fat;
    case "fiber": return t.fiber;
    case "sodium": return t.sodium;
    case "saturated-fat": return t.satFat;
    case "added-sugar": return t.sugarMaxMeal;
  }
}

export function targetOf(id: NutrientId, targets: Tabs["targets"]): number {
  switch (id) {
    case "protein": return targets.protein;
    case "carbs": return targets.carbs;
    case "fat": return targets.fat;
    default: return LIMITS[id];
  }
}

/* ── Dates ─────────────────────────────────────────────────────────────── */

const parse = (iso: string) => new Date(`${iso}T12:00:00`);
export const addDays = (iso: string, d: number) => {
  const x = parse(iso);
  x.setDate(x.getDate() + d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};
export const longDate = (iso: string) => parse(iso).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
export const weekdayName = (iso: string) => parse(iso).toLocaleDateString("en-US", { weekday: "long" });
export const weekdayLetter = (iso: string) => parse(iso).toLocaleDateString("en-US", { weekday: "narrow" });
export const monthName = (iso: string) => parse(iso).toLocaleDateString("en-US", { month: "long" });
export const monthYear = (iso: string) => parse(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });
export const dayOfWeek = (iso: string) => parse(iso).getDay();
export const dayOfMonth = (iso: string) => parse(iso).getDate();
export const daysInMonth = (iso: string) => { const x = parse(iso); return new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate(); };
/** "Today", "Yesterday" or the weekday. */
export const relDay = (iso: string) => (iso === TODAY ? "Today" : iso === addDays(TODAY, -1) ? "Yesterday" : weekdayName(iso));

/** The last `count` days ending today, oldest first. */
export const lastDays = (count: number) => Array.from({ length: count }, (_, i) => addDays(TODAY, i - count + 1));

/* ── Meals ─────────────────────────────────────────────────────────────── */

export const SLOTS: { id: MealSlot; label: string }[] = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "snack", label: "Snack" },
  { id: "dinner", label: "Dinner" },
];
export const slotLabel = (s: MealSlot) => SLOTS.find((x) => x.id === s)!.label;

export const photoOf = (m: Pick<Meal, "photo" | "name">) => m.photo ?? MEAL_PHOTOS[m.name];
export const isCook = (m: Meal) => m.source === "tara";

const minutes = (t?: string) => {
  const r = t?.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!r) return 0;
  return ((+r[1] % 12) + (r[3].toUpperCase() === "PM" ? 12 : 0)) * 60 + +r[2];
};
export const byTime = (a: Meal, b: Meal) => minutes(a.time) - minutes(b.time);

export function mealDetail(m: Meal) {
  if (m.source === "tara") return `Cooked with Tara · ${m.time ?? ""}`.trim();
  if (m.source === "leftovers") return `${m.time ?? "Today"} · leftovers`;
  if (m.source === "photo") return `${m.time ?? "Today"} · photo`;
  return `${m.time ?? "Today"} · logged`;
}

/** "1", "1½", "2". */
export const fmtServings = (s: number) => {
  const whole = Math.floor(s);
  const half = s - whole >= 0.5;
  return whole === 0 ? (half ? "½" : "0") : `${whole}${half ? "½" : ""}`;
};

/** Servings of a Tara cook not yet eaten (made − eaten − leftover meals logged since). */
export function leftoverServings(meals: Meal[], cook: Meal) {
  if (!cook.made) return 0;
  const later = meals.filter((m) => m.source === "leftovers" && m.name === cook.name && m.day >= cook.day && m.id !== cook.id);
  return Math.max(0, cook.made - servingsOf(cook) - later.reduce((s, m) => s + servingsOf(m), 0));
}

/** Tara cooks from the last 3 days with servings left, newest first (R05). */
export function leftovers(meals: Meal[]) {
  const since = addDays(TODAY, -3);
  return meals
    .filter((m) => m.source === "tara" && m.day >= since && m.day <= TODAY)
    .map((m) => ({ cook: m, left: leftoverServings(meals, m) }))
    .filter((x) => x.left > 0)
    .sort((a, b) => (a.cook.day < b.cook.day ? 1 : -1));
}

/* ── Fake food database (R06/R07), per unit ─────────────────────────────── */

export type Food = {
  id: string; name: string; unit: string; units: string; icon: IconName;
  kcal: number; protein: number; carbs: number; fat: number;
  fiber: number; sodium: number; satFat: number; sugar: number;
  /** Starting portion in R07. */
  portion?: number;
};

export const FOODS: Food[] = [
  { id: "cheese-pizza", name: "Cheese pizza", unit: "slice", units: "slices", icon: "pizza", kcal: 285, protein: 12, carbs: 36, fat: 10, fiber: 2, sodium: 620, satFat: 4.5, sugar: 2, portion: 2 },
  { id: "veggie-pizza", name: "Veggie pizza", unit: "slice", units: "slices", icon: "pizza", kcal: 235, protein: 10, carbs: 30, fat: 8, fiber: 3, sodium: 520, satFat: 3.5, sugar: 2, portion: 2 },
  { id: "margherita-pizza", name: "Margherita pizza", unit: "slice", units: "slices", icon: "pizza", kcal: 250, protein: 11, carbs: 31, fat: 9, fiber: 2, sodium: 560, satFat: 4, sugar: 2, portion: 2 },
  { id: "thin-crust-pizza", name: "Thin crust cheese pizza", unit: "slice", units: "slices", icon: "pizza", kcal: 230, protein: 10, carbs: 25, fat: 10, fiber: 1, sodium: 500, satFat: 4.5, sugar: 1, portion: 2 },
  { id: "greek-yogurt-bowl", name: "Greek yogurt bowl", unit: "bowl", units: "bowls", icon: "bowl", kcal: 320, protein: 18, carbs: 44, fat: 8, fiber: 5, sodium: 90, satFat: 4, sugar: 9 },
  { id: "veggie-burrito", name: "Veggie burrito", unit: "burrito", units: "burritos", icon: "taco", kcal: 620, protein: 22, carbs: 88, fat: 18, fiber: 12, sodium: 1150, satFat: 7, sugar: 3 },
  { id: "bean-tacos", name: "Bean tacos", unit: "taco", units: "tacos", icon: "taco", kcal: 170, protein: 7, carbs: 22, fat: 6, fiber: 5, sodium: 280, satFat: 2, sugar: 1, portion: 2 },
  { id: "dal-rice", name: "Dal & rice", unit: "plate", units: "plates", icon: "bowl", kcal: 500, protein: 20, carbs: 84, fat: 9, fiber: 10, sodium: 640, satFat: 2, sugar: 2 },
  { id: "palak-paneer", name: "Palak paneer", unit: "cup", units: "cups", icon: "bowl", kcal: 340, protein: 16, carbs: 12, fat: 26, fiber: 4, sodium: 620, satFat: 12, sugar: 3 },
  { id: "veg-sushi", name: "Vegetable sushi roll", unit: "roll", units: "rolls", icon: "sushi", kcal: 280, protein: 6, carbs: 54, fat: 4, fiber: 4, sodium: 520, satFat: 0.5, sugar: 8 },
  { id: "vegetable-ramen", name: "Vegetable ramen", unit: "bowl", units: "bowls", icon: "noodles", kcal: 480, protein: 14, carbs: 70, fat: 16, fiber: 5, sodium: 1600, satFat: 5, sugar: 4 },
  { id: "pad-thai-tofu", name: "Tofu pad thai", unit: "plate", units: "plates", icon: "noodles", kcal: 620, protein: 22, carbs: 80, fat: 24, fiber: 4, sodium: 1300, satFat: 4, sugar: 14 },
  { id: "caesar-salad", name: "Caesar salad", unit: "bowl", units: "bowls", icon: "leaf", kcal: 330, protein: 9, carbs: 14, fat: 27, fiber: 3, sodium: 640, satFat: 6, sugar: 2 },
  { id: "veggie-burger", name: "Veggie burger", unit: "burger", units: "burgers", icon: "burger", kcal: 410, protein: 18, carbs: 46, fat: 16, fiber: 7, sodium: 760, satFat: 4, sugar: 7 },
  { id: "mac-cheese", name: "Mac and cheese", unit: "cup", units: "cups", icon: "bowl", kcal: 380, protein: 15, carbs: 44, fat: 16, fiber: 2, sodium: 720, satFat: 9, sugar: 5 },
  { id: "minestrone", name: "Minestrone soup", unit: "bowl", units: "bowls", icon: "bowl", kcal: 190, protein: 7, carbs: 30, fat: 4, fiber: 6, sodium: 780, satFat: 1, sugar: 5 },
  { id: "egg-fried-rice", name: "Egg fried rice", unit: "cup", units: "cups", icon: "egg", kcal: 330, protein: 10, carbs: 48, fat: 11, fiber: 2, sodium: 680, satFat: 2, sugar: 2 },
  { id: "banana", name: "Banana", unit: "medium", units: "medium", icon: "leaf", kcal: 105, protein: 1, carbs: 27, fat: 0, fiber: 3, sodium: 1, satFat: 0, sugar: 0 },
  { id: "dark-chocolate", name: "Dark chocolate", unit: "square", units: "squares", icon: "cake", kcal: 60, protein: 1, carbs: 5, fat: 4, fiber: 1, sodium: 2, satFat: 2.5, sugar: 4, portion: 2 },
  { id: "garlic-bread", name: "Garlic bread", unit: "slice", units: "slices", icon: "bread", kcal: 190, protein: 4, carbs: 20, fat: 10, fiber: 1, sodium: 300, satFat: 3, sugar: 1, portion: 2 },
];

export const foodById = (id: string | null) => FOODS.find((f) => f.id === id) ?? FOODS[0];
export const foodByName = (name: string) => FOODS.find((f) => f.name === name);
export const portionLabel = (f: Food, p: number) => `${fmtServings(p)} ${p === 1 ? f.unit : f.units}`;

export function searchFoods(q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return FOODS;
  return FOODS.filter((f) => f.name.toLowerCase().includes(s));
}

/** Recently logged foods (newest first, distinct), with the portion last eaten (R05). */
export function recentFoods(meals: Meal[], count = 2) {
  const seen = new Set<string>();
  const out: { food: Food; portion: number }[] = [];
  for (const m of [...meals].filter((m) => m.source === "logged" && !!m.note && m.day <= TODAY).sort((a, b) => (a.day < b.day ? 1 : a.day > b.day ? -1 : byTime(b, a)))) {
    const f = foodByName(m.name);
    if (!f || seen.has(f.id)) continue;
    seen.add(f.id);
    out.push({ food: f, portion: servingsOf(m) });
    if (out.length === count) break;
  }
  return out;
}

const nowTime = () => new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
const newId = () => `m-add-${Date.now().toString(36)}`;

export function mealFromFood(f: Food, portion: number, slot: MealSlot): Meal {
  return {
    id: newId(), day: TODAY, slot, name: f.name, kcal: Math.round(f.kcal * portion), time: nowTime(),
    source: "logged", servings: portion, note: portionLabel(f, portion),
    protein: f.protein, carbs: f.carbs, fat: f.fat, fiber: f.fiber, sodium: f.sodium, satFat: f.satFat, sugar: f.sugar,
  };
}

export function mealFromLeftover(cook: Meal, slot: MealSlot): Meal {
  const per = Math.round(cook.kcal / servingsOf(cook));
  return {
    id: newId(), day: TODAY, slot, name: cook.name, kcal: per, time: nowTime(), source: "leftovers", servings: 1,
    photo: photoOf(cook), protein: cook.protein, carbs: cook.carbs, fat: cook.fat, fiber: cook.fiber, sodium: cook.sodium, satFat: cook.satFat, sugar: cook.sugar,
  };
}

export function mealQuickAdd(kcal: number, slot: MealSlot): Meal {
  return { id: newId(), day: TODAY, slot, name: "Quick add", kcal: Math.round(kcal), time: nowTime(), source: "logged" };
}
