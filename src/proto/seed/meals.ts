/*
 * Persona meal diary (TABS_HANDOFF §5). One persona; numbers must agree across tabs.
 * Today is Tue 17 Nov 2026. Day totals: Tue 1,070 · Mon 1,700 · Sun 1,820 · Sat 2,120.
 * Nutrition (R01/R02/R03) and Journal (J01) both read these via useProto().meals.
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
  photo?: string; // path under /public, filled by the screens that export food photos
  // optional per-meal nutrients, for nutrient rows / detail screens
  protein?: number; carbs?: number; fat?: number; fiber?: number; sodium?: number; satFat?: number;
};

export const TODAY = "2026-11-17";

export const SEED_MEALS: Meal[] = [
  // Tue 17: 320 + 540 + 210 = 1,070 (dinner not logged)
  { id: "m-tue-b", day: "2026-11-17", slot: "breakfast", name: "Greek yogurt bowl", kcal: 320, time: "8:10 AM", source: "logged", protein: 18, carbs: 38, fat: 9, fiber: 4, sodium: 110, satFat: 5 },
  { id: "m-tue-l", day: "2026-11-17", slot: "lunch", name: "Thai Green Curry", kcal: 540, time: "1:10 PM", source: "tara", rating: 4, protein: 18, carbs: 72, fat: 22, fiber: 7, sodium: 780, satFat: 14 },
  { id: "m-tue-s", day: "2026-11-17", slot: "snack", name: "Apple & cheddar", kcal: 210, time: "3:45 PM", source: "logged", protein: 8, carbs: 20, fat: 15, fiber: 4, sodium: 200, satFat: 7 },
  // Mon 16: 330 + 610 + 260 + 500 = 1,700
  { id: "m-mon-b", day: "2026-11-16", slot: "breakfast", name: "Overnight oats", kcal: 330, time: "7:50 AM", source: "logged" },
  { id: "m-mon-l", day: "2026-11-16", slot: "lunch", name: "Spaghetti Pomodoro", kcal: 610, time: "12:40 PM", source: "leftovers" },
  { id: "m-mon-s", day: "2026-11-16", slot: "snack", name: "Hummus & pita", kcal: 260, time: "4:15 PM", source: "logged" },
  { id: "m-mon-d", day: "2026-11-16", slot: "dinner", name: "Dal & rice", kcal: 500, time: "7:45 PM", source: "logged" },
  // Sun 15: 380 + 430 + 610 + 400 = 1,820
  { id: "m-sun-b", day: "2026-11-15", slot: "breakfast", name: "Avocado toast", kcal: 380, time: "9:30 AM", source: "logged" },
  { id: "m-sun-l", day: "2026-11-15", slot: "lunch", name: "Caprese salad", kcal: 430, time: "1:20 PM", source: "logged" },
  { id: "m-sun-d", day: "2026-11-15", slot: "dinner", name: "Spaghetti Pomodoro", kcal: 610, time: "7:30 PM", source: "tara", rating: 4 },
  { id: "m-sun-s", day: "2026-11-15", slot: "snack", name: "Dark chocolate & almonds", kcal: 400, time: "9:10 PM", source: "logged" },
  // Sat 14: 520 + 570 + 230 + 800 = 2,120
  { id: "m-sat-b", day: "2026-11-14", slot: "breakfast", name: "Pancakes", kcal: 520, time: "10:00 AM", source: "logged" },
  { id: "m-sat-l", day: "2026-11-14", slot: "lunch", name: "Cheese pizza", kcal: 570, time: "1:30 PM", source: "logged", note: "2 slices" },
  { id: "m-sat-s", day: "2026-11-14", slot: "snack", name: "Fruit & yogurt", kcal: 230, time: "4:00 PM", source: "logged" },
  { id: "m-sat-d", day: "2026-11-14", slot: "dinner", name: "Paneer tikka wrap", kcal: 800, time: "8:00 PM", source: "logged" },
];

export const dayTotal = (meals: Meal[], day: string) => meals.filter((m) => m.day === day).reduce((s, m) => s + m.kcal, 0);
