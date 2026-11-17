/*
 * Persona meal diary (TABS_HANDOFF §5). One persona; numbers must agree across tabs.
 * Today is Tue 17 Nov 2026. Nutrition (R01/R02/R03/R09) and Journal (J01) both read these
 * via useProto().meals.
 *
 * Day totals (kcal): Tue 17 1,070 · Mon 1,700 · Sun 1,820 · Sat 2,120 · Fri 1,650 · Thu 1,940 ·
 * Wed 1,780 (R02: average of the 6 full days = 1,835). Nov 1–10 fill the R03 month.
 * Today: protein 44 / carbs 120 / fat 46 g, fiber 15 g, sodium 1,090 mg, saturated fat 26 g.
 * Last 6 full days: fiber avg 24 g (short on 4), protein avg 78 g, sodium avg 2,480 mg
 * (over on 4). Nov 1–16: 11 days within 10% of 1,900 kcal, 9 cooks with Tara, sodium avg 2,410.
 *
 * Nutrient fields are per serving; `kcal` is what was eaten (kcal per serving × servings).
 */
export type MealSlot = "breakfast" | "lunch" | "snack" | "dinner";
export type MealSource = "tara" | "logged" | "photo" | "leftovers";
export type Meal = {
  id: string;
  day: string; // ISO date
  slot: MealSlot;
  name: string;
  kcal: number;
  time?: string; // "8:10 AM"
  source: MealSource;
  rating?: 0 | 1 | 2 | 3 | 4 | 5;
  note?: string;
  photo?: string; // path under /public
  /** Servings eaten (default 1). Nutrients below are per serving. */
  servings?: number;
  /** Tara cooks: servings the recipe made (leftovers = made − eaten − later leftover meals). */
  made?: number;
  // per-serving nutrients, for nutrient rows / detail screens
  protein?: number; carbs?: number; fat?: number; fiber?: number; sodium?: number; satFat?: number; sugar?: number;
};

export const TODAY = "2026-11-17";

/** Dish photos exported from the Nutrition frames (public/img/nutrition). */
export const MEAL_PHOTOS: Record<string, string> = {
  "Thai Green Curry": "/img/nutrition/thai-green-curry.webp",
  "Spaghetti Pomodoro": "/img/nutrition/spaghetti-pomodoro.webp",
  "Rajma Chawal": "/img/nutrition/rajma-chawal.webp",
  "Black Bean Tacos": "/img/nutrition/black-bean-tacos.webp",
  "Mapo Tofu": "/img/nutrition/mapo-tofu.webp",
};
const ph = (name: string) => MEAL_PHOTOS[name];

/** Nov 1–10: compact rows [slot, name, kcal, time, source, sodium, protein, fiber]. */
type Row = [MealSlot, string, number, string, MealSource, number, number, number];
const EARLY: Record<number, Row[]> = {
  1: [["breakfast", "Masala oats", 380, "8:20 AM", "logged", 520, 14, 6], ["lunch", "Chickpea salad", 560, "1:00 PM", "logged", 780, 22, 11], ["dinner", "Veggie lasagna", 940, "7:40 PM", "logged", 1000, 34, 8]],
  2: [["breakfast", "Greek yogurt bowl", 320, "8:10 AM", "logged", 90, 18, 5], ["lunch", "Hummus wrap", 560, "12:50 PM", "logged", 860, 18, 9], ["dinner", "Thai Green Curry", 1070, "7:15 PM", "tara", 1550, 36, 12]],
  3: [["breakfast", "Avocado toast", 360, "8:30 AM", "logged", 500, 12, 8], ["lunch", "Minestrone & bread", 520, "1:10 PM", "logged", 900, 18, 10], ["dinner", "Paneer tikka wrap", 940, "8:00 PM", "logged", 800, 36, 9]],
  4: [["breakfast", "Pancakes", 520, "9:30 AM", "logged", 600, 12, 2], ["lunch", "Cheese quesadilla", 640, "1:30 PM", "logged", 980, 26, 4], ["dinner", "Mapo Tofu", 1020, "7:30 PM", "tara", 1120, 32, 6]],
  5: [["breakfast", "Overnight oats", 330, "7:50 AM", "logged", 180, 16, 4], ["lunch", "Dal & rice", 620, "12:40 PM", "logged", 900, 24, 9], ["dinner", "Veggie stir-fry", 810, "7:20 PM", "logged", 1170, 22, 8]],
  6: [["breakfast", "Tofu scramble", 380, "8:40 AM", "logged", 640, 26, 8], ["lunch", "Caprese sandwich", 520, "1:00 PM", "logged", 660, 22, 4], ["dinner", "Rajma Chawal", 1090, "7:10 PM", "tara", 1100, 40, 18]],
  7: [["breakfast", "Masala oats", 380, "9:00 AM", "logged", 520, 14, 6], ["lunch", "Burrito bowl", 620, "1:20 PM", "logged", 670, 26, 11], ["dinner", "Black Bean Tacos", 1040, "7:30 PM", "tara", 1160, 36, 22]],
  8: [["breakfast", "Greek yogurt bowl", 320, "10:00 AM", "logged", 90, 18, 5], ["lunch", "Lentil soup & bread", 520, "1:30 PM", "logged", 600, 24, 12], ["dinner", "Veggie fried rice", 740, "8:10 PM", "logged", 1410, 18, 4]],
  9: [["breakfast", "Avocado toast", 360, "8:15 AM", "logged", 500, 12, 8], ["lunch", "Caprese salad", 430, "12:45 PM", "logged", 650, 24, 4], ["dinner", "Spaghetti Pomodoro", 1080, "7:20 PM", "tara", 1330, 38, 11]],
  10: [["breakfast", "Overnight oats", 330, "7:45 AM", "logged", 180, 16, 4], ["lunch", "Chickpea salad", 560, "1:00 PM", "logged", 780, 22, 11], ["dinner", "Dal & rice", 910, "7:50 PM", "logged", 1440, 32, 12]],
};
const early: Meal[] = Object.entries(EARLY).flatMap(([d, rows]) =>
  rows.map(([slot, name, kcal, time, source, sodium, protein, fiber], i) => ({
    id: `m-nov${d}-${i}`,
    day: `2026-11-${String(d).padStart(2, "0")}`,
    slot, name, kcal, time, source, sodium, protein, fiber,
    ...(source === "tara" ? { rating: 4 as const, photo: ph(name), made: 2 } : {}),
  }))
);

export const SEED_MEALS: Meal[] = [
  // Tue 17: 320 + 540 + 210 = 1,070 (dinner not logged)
  { id: "m-tue-b", day: "2026-11-17", slot: "breakfast", name: "Greek yogurt bowl", kcal: 320, time: "8:10 AM", source: "logged", protein: 18, carbs: 44, fat: 8, fiber: 5, sodium: 90, satFat: 4, sugar: 9, note: "1 bowl" },
  { id: "m-tue-l", day: "2026-11-17", slot: "lunch", name: "Thai Green Curry", kcal: 540, time: "1:10 PM", source: "tara", rating: 4, photo: ph("Thai Green Curry"), servings: 1, made: 2, protein: 18, carbs: 56, fat: 27, fiber: 6, sodium: 820, satFat: 16, sugar: 4 },
  { id: "m-tue-s", day: "2026-11-17", slot: "snack", name: "Apple & cheddar", kcal: 210, time: "3:45 PM", source: "logged", protein: 8, carbs: 20, fat: 11, fiber: 4, sodium: 180, satFat: 6, sugar: 0 },
  // Mon 16: 330 + 610 + 260 + 400 + 100 = 1,700 · fiber 20 · protein 76 · sodium 2,480
  { id: "m-mon-b", day: "2026-11-16", slot: "breakfast", name: "Overnight oats", kcal: 330, time: "7:50 AM", source: "logged", protein: 16, fiber: 4, sodium: 300 },
  { id: "m-mon-l", day: "2026-11-16", slot: "lunch", name: "Spaghetti Pomodoro", kcal: 610, time: "12:40 PM", source: "leftovers", photo: ph("Spaghetti Pomodoro"), protein: 22, fiber: 6, sodium: 670 },
  { id: "m-mon-s", day: "2026-11-16", slot: "snack", name: "Hummus & pita", kcal: 260, time: "4:15 PM", source: "logged", protein: 10, fiber: 4, sodium: 560 },
  { id: "m-mon-d", day: "2026-11-16", slot: "dinner", name: "Dal & rice", kcal: 400, time: "7:45 PM", source: "logged", protein: 24, fiber: 5, sodium: 670 },
  { id: "m-mon-d2", day: "2026-11-16", slot: "dinner", name: "Papad & pickle", kcal: 100, time: "7:45 PM", source: "logged", protein: 4, fiber: 1, sodium: 280 },
  // Sun 15: 380 + 430 + 610 + 400 = 1,820 · fiber 25 · protein 84 · sodium 2,450
  { id: "m-sun-b", day: "2026-11-15", slot: "breakfast", name: "Tofu scramble", kcal: 380, time: "9:30 AM", source: "logged", protein: 26, fiber: 8, sodium: 640 },
  { id: "m-sun-l", day: "2026-11-15", slot: "lunch", name: "Caprese salad", kcal: 430, time: "1:20 PM", source: "logged", protein: 24, fiber: 4, sodium: 660 },
  { id: "m-sun-d", day: "2026-11-15", slot: "dinner", name: "Spaghetti Pomodoro", kcal: 610, time: "7:30 PM", source: "tara", rating: 4, photo: ph("Spaghetti Pomodoro"), made: 3, protein: 22, fiber: 6, sodium: 670 },
  { id: "m-sun-s", day: "2026-11-15", slot: "snack", name: "Dark chocolate & almonds", kcal: 400, time: "9:10 PM", source: "logged", protein: 12, fiber: 7, sodium: 480 },
  // Sat 14: 520 + 570 + 230 + 800 = 2,120 · fiber 18 · protein 76 · sodium 2,900
  { id: "m-sat-b", day: "2026-11-14", slot: "breakfast", name: "Pancakes", kcal: 520, time: "10:00 AM", source: "logged", protein: 12, fiber: 2, sodium: 560 },
  { id: "m-sat-l", day: "2026-11-14", slot: "lunch", name: "Cheese pizza", kcal: 570, time: "1:30 PM", source: "logged", note: "2 slices", servings: 2, protein: 12, carbs: 36, fat: 10, fiber: 2, sodium: 620, satFat: 4.5, sugar: 2 },
  { id: "m-sat-s", day: "2026-11-14", slot: "snack", name: "Cheese & crackers", kcal: 230, time: "4:00 PM", source: "logged", protein: 10, fiber: 1, sodium: 450 },
  { id: "m-sat-d", day: "2026-11-14", slot: "dinner", name: "Paneer tikka wrap", kcal: 800, time: "8:00 PM", source: "logged", protein: 30, fiber: 11, sodium: 650 },
  // Fri 13: 360 + 520 + 590 + 180 = 1,650 · fiber 29 · protein 70 · sodium 2,300
  { id: "m-fri-b", day: "2026-11-13", slot: "breakfast", name: "Avocado toast", kcal: 360, time: "8:30 AM", source: "logged", protein: 12, fiber: 8, sodium: 500 },
  { id: "m-fri-l", day: "2026-11-13", slot: "lunch", name: "Caprese sandwich", kcal: 520, time: "12:45 PM", source: "logged", protein: 22, fiber: 4, sodium: 660 },
  { id: "m-fri-s", day: "2026-11-13", slot: "snack", name: "Protein shake", kcal: 180, time: "4:30 PM", source: "logged", protein: 16, fiber: 3, sodium: 460 },
  { id: "m-fri-d", day: "2026-11-13", slot: "dinner", name: "Black Bean Tacos", kcal: 590, time: "7:10 PM", source: "tara", rating: 4, photo: ph("Black Bean Tacos"), made: 2, protein: 20, fiber: 14, sodium: 680 },
  // Thu 12: 420 + 620 + 220 + 120 + 560 = 1,940 · fiber 22 · protein 80 · sodium 2,650
  { id: "m-thu-b", day: "2026-11-12", slot: "breakfast", name: "Veggie omelette & toast", kcal: 420, time: "8:15 AM", source: "logged", protein: 24, fiber: 3, sodium: 640 },
  { id: "m-thu-l", day: "2026-11-12", slot: "lunch", name: "Burrito bowl", kcal: 620, time: "1:00 PM", source: "logged", protein: 26, fiber: 11, sodium: 670 },
  { id: "m-thu-s", day: "2026-11-12", slot: "snack", name: "Pretzels", kcal: 220, time: "3:30 PM", source: "logged", protein: 6, fiber: 1, sodium: 450 },
  { id: "m-thu-s2", day: "2026-11-12", slot: "snack", name: "Popcorn", kcal: 120, time: "9:00 PM", source: "logged", protein: 4, fiber: 2, sodium: 230 },
  { id: "m-thu-d", day: "2026-11-12", slot: "dinner", name: "Vegetable lo mein", kcal: 560, time: "8:00 PM", source: "logged", protein: 20, fiber: 5, sodium: 660 },
  // Wed 11: 380 + 520 + 240 + 640 = 1,780 · fiber 30 · protein 82 · sodium 2,100
  { id: "m-wed-b", day: "2026-11-11", slot: "breakfast", name: "Masala oats", kcal: 380, time: "8:00 AM", source: "logged", protein: 14, fiber: 6, sodium: 320 },
  { id: "m-wed-l", day: "2026-11-11", slot: "lunch", name: "Lentil soup & bread", kcal: 520, time: "12:30 PM", source: "logged", protein: 24, fiber: 12, sodium: 600 },
  { id: "m-wed-s", day: "2026-11-11", slot: "snack", name: "Greek yogurt", kcal: 240, time: "4:00 PM", source: "logged", protein: 18, fiber: 2, sodium: 300 },
  { id: "m-wed-d", day: "2026-11-11", slot: "dinner", name: "Rajma Chawal", kcal: 640, time: "7:20 PM", source: "tara", rating: 5, photo: ph("Rajma Chawal"), made: 2, protein: 26, fiber: 10, sodium: 880 },
  // Nov 1–10
  ...early,
];

export const dayTotal = (meals: Meal[], day: string) => meals.filter((m) => m.day === day).reduce((s, m) => s + m.kcal, 0);
