"use client";

/*
 * Journal data and screen-local state.
 * - RECIPES: the favourites catalogue behind J06/J07/J08 (photos exported from the frames).
 * - MEAL_PHOTOS: photo paths for meals in seed/meals.ts (mapped here so meals.ts stays the
 *   Nutrition agent's file).
 * - useJournalUi: which meal / collection / recipe / grocery list the pushed screens and
 *   sheets are about (the hash router has no params), plus the "just added" meal for J01.
 */
import { create } from "zustand";
import { TODAY, type Meal, type MealSlot } from "@/proto/seed/meals";
import type { GroceryItem, GroceryList } from "@/proto/seed/journal";

const IMG = "/img/journal";

export type Recipe = { id: string; name: string; minutes: number; cuisine: string; photo?: string; ingredients?: Omit<GroceryItem, "have">[] };

const r = (id: string, name: string, minutes: number, cuisine: string, photo?: string, ingredients?: Recipe["ingredients"]): Recipe => ({
  id, name, minutes, cuisine, photo: photo ? `${IMG}/${photo}.webp` : undefined, ingredients,
});
const ing = (name: string, amount: string) => ({ name, amount });

export const RECIPES: Record<string, Recipe> = Object.fromEntries(
  [
    r("tacos", "Black Bean Tacos", 25, "Mexican", "tacos", [ing("Black beans", "2 cans"), ing("Corn tortillas", "12"), ing("Avocados", "2"), ing("Red onion", "1"), ing("Lime", "2"), ing("Cilantro", "1 bunch"), ing("Cumin", "1 tsp"), ing("Sour cream", "½ cup")]),
    r("thai-green-curry", "Thai Green Curry", 35, "Thai", "thai-green-curry", [ing("Coconut milk", "1 can"), ing("Green curry paste", "1 jar"), ing("Tofu", "14 oz"), ing("Thai basil", "1 bunch"), ing("Baby corn", "1 can")]),
    r("spaghetti-pomodoro", "Spaghetti Pomodoro", 30, "Italian", "spaghetti-pomodoro", [ing("Spaghetti", "1 lb"), ing("San Marzano tomatoes", "1 can"), ing("Basil", "1 bunch"), ing("Parmesan", "3 oz")]),
    r("paneer-butter-masala", "Paneer Butter Masala", 40, "imported", "paneer-butter-masala", [ing("Heavy cream", "½ cup"), ing("Cashews", "15"), ing("Paneer", "14 oz"), ing("Kasuri methi", "1 tbsp"), ing("Butter", "2 tbsp")]),
    r("chili-paneer", "Chili Paneer", 25, "Indo-Chinese", "chili-paneer", [ing("Paneer", "14 oz"), ing("Bell peppers", "2"), ing("Soy sauce", "1 bottle"), ing("Spring onions", "1 bunch")]),
    r("pad-thai", "Pad Thai", 30, "Thai", "pad-thai", [ing("Rice noodles", "8 oz"), ing("Tofu", "14 oz"), ing("Bean sprouts", "8 oz"), ing("Tamarind paste", "1 jar")]),
    r("paneer-tikka", "Paneer tikka", 30, "Indian", "paneer-tikka", [ing("Paneer", "14 oz"), ing("Greek yogurt", "1 cup"), ing("Bell peppers", "2")]),
    r("veg-fried-rice", "Veggie fried rice", 20, "Chinese", undefined, [ing("Jasmine rice", "2 cups"), ing("Frozen peas", "1 bag"), ing("Eggs", "4")]),
    r("bourguignon", "Mushroom bourguignon", 120, "French", "bourguignon", [ing("Cremini mushrooms", "1 lb"), ing("Pearl onions", "10 oz"), ing("Red wine", "1 bottle")]),
    r("rajma-chawal", "Rajma Chawal", 75, "Indian", "rajma-chawal", [ing("Kidney beans", "2 cans"), ing("Basmati rice", "2 cups"), ing("Tomatoes", "4")]),
    r("nimono", "Vegetable nimono", 45, "Japanese", "nimono", [ing("Daikon", "1"), ing("Shiitake", "6"), ing("Carrots", "2"), ing("Mirin", "1 bottle")]),
    r("biryani", "Vegetable biryani", 60, "Indian", "biryani", [ing("Basmati rice", "2 cups"), ing("Saffron", "1 pinch"), ing("Mixed vegetables", "1 lb")]),
    r("dal-makhani", "Dal makhani", 90, "Indian", undefined, [ing("Black urad dal", "1 cup"), ing("Heavy cream", "¼ cup")]),
    r("miso-ramen", "Miso ramen", 40, "Japanese", "miso-ramen", [ing("Ramen noodles", "2 packs"), ing("White miso", "1 tub"), ing("Nori", "1 pack")]),
    r("veg-manchurian", "Veg manchurian", 35, "Indo-Chinese"),
    r("hakka-noodles", "Hakka noodles", 20, "Indo-Chinese"),
    r("palak-paneer", "Palak paneer", 35, "Indian"),
    r("chana-masala", "Chana masala", 40, "Indian"),
    r("margherita", "Margherita pizza", 30, "Italian"),
    r("mushroom-risotto", "Mushroom risotto", 45, "Italian"),
    r("caprese-pasta", "Caprese pasta", 20, "Italian"),
    r("veg-enchiladas", "Veggie enchiladas", 50, "Mexican"),
    r("shakshuka", "Shakshuka", 30, "Mediterranean"),
    r("aloo-gobi", "Aloo gobi", 35, "Indian"),
    r("pesto-gnocchi", "Pesto gnocchi", 20, "Italian"),
    r("minestrone", "Minestrone", 45, "Italian"),
  ].map((x) => [x.id, x])
);

export const recipe = (id: string): Recipe => RECIPES[id] ?? { id, name: id, minutes: 30, cuisine: "" };

/** Photos for persona meals (seed/meals.ts), by dish name. */
export const MEAL_PHOTOS: Record<string, string> = {
  "Thai Green Curry": `${IMG}/thai-green-curry.webp`,
  "Spaghetti Pomodoro": `${IMG}/spaghetti-pomodoro.webp`,
  "Paneer tikka": `${IMG}/paneer-tikka.webp`,
};
export const mealPhoto = (m: Meal) => m.photo ?? MEAL_PHOTOS[m.name];

/** Recipe behind a Tara cook (for J02's minutes and Cook Again). */
export const MEAL_RECIPE: Record<string, string> = { "Thai Green Curry": "thai-green-curry", "Spaghetti Pomodoro": "spaghetti-pomodoro" };
/** Cook times from the Tara sessions (J02 subtitle). */
export const COOK_MINUTES: Record<string, number> = { "Thai Green Curry": 32, "Spaghetti Pomodoro": 28 };
/** Notes written after a cook (J02), until the user edits them (then meal.note wins). */
export const DEFAULT_NOTES: Record<string, { note: string; tara: string }> = {
  "m-tue-l": { note: "A bit too spicy. Use 1 chili next time.", tara: "Tara will use 1 chili next time" },
  "m-sun-d": { note: "Less garlic.", tara: "Tara will use less garlic next time" },
};

export const SLOT_LABEL: Record<MealSlot, string> = { breakfast: "Breakfast", lunch: "Lunch", snack: "Snack", dinner: "Dinner" };
const SOURCE_LABEL: Record<Meal["source"], string> = { tara: "cooked with Tara", logged: "logged", leftovers: "leftovers", photo: "from a photo" };

/** "Lunch · cooked with Tara", "Dinner · logged · 2 slices". */
export function mealDetail(m: Meal) {
  const parts = [SLOT_LABEL[m.slot], SOURCE_LABEL[m.source]];
  if ((m.source === "logged" || m.source === "photo") && m.note) parts.push(m.note);
  return parts.join(" · ");
}

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export function dayLabel(iso: string) {
  const d = new Date(`${iso}T12:00:00Z`);
  const s = `${DOW[d.getUTCDay()]} ${d.getUTCDate()}`;
  return iso === TODAY ? `Today · ${s}` : s;
}

const minutesOf = (t?: string) => {
  const m = t?.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return 0;
  return ((+m[1] % 12) + (m[3].toUpperCase() === "PM" ? 12 : 0)) * 60 + +m[2];
};

/** Diary: days newest first; inside a day, rows with a photo (Tara cooks, leftovers, photo logs) first, then by time. */
export function diary(meals: Meal[]) {
  const days = [...new Set(meals.map((m) => m.day))].sort().reverse();
  return days.map((day) => {
    const list = meals.filter((m) => m.day === day);
    const rank = (m: Meal) => (m.source === "logged" ? 1 : 0);
    list.sort((a, b) => rank(a) - rank(b) || minutesOf(a.time) - minutesOf(b.time));
    return { day, meals: list, total: list.reduce((s, m) => s + m.kcal, 0) };
  });
}

/** The next slot to log today (J03's "Log dinner", J04's "Add to Dinner"). */
export function nextSlot(meals: Meal[]): MealSlot {
  const today = new Set(meals.filter((m) => m.day === TODAY).map((m) => m.slot));
  return (["breakfast", "lunch", "dinner"] as MealSlot[]).find((s) => !today.has(s)) ?? "snack";
}

export function nowTime() {
  const d = new Date();
  const h = d.getHours();
  return `${h % 12 || 12}:${String(d.getMinutes()).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

// ----- amounts ("2 cans", "½ cup", "12") -----
const FRACS: [string, number][] = [["¼", 0.25], ["½", 0.5], ["¾", 0.75]];
export function parseAmount(a: string): { n: number; unit: string } {
  const m = a.trim().match(/^(\d+)?\s*([¼½¾])?\s*(.*)$/);
  if (!m || (!m[1] && !m[2])) return { n: 1, unit: a.trim() };
  const n = (m[1] ? +m[1] : 0) + (FRACS.find(([c]) => c === m[2])?.[1] ?? 0);
  return { n, unit: m[3] };
}
export function formatAmount(n: number, unit: string) {
  const whole = Math.floor(n);
  const frac = FRACS.find(([, v]) => Math.abs(v - (n - whole)) < 0.01)?.[0] ?? "";
  const num = `${whole || !frac ? whole : ""}${frac}`;
  return unit ? `${num} ${unit}` : num;
}
export function stepAmount(a: string, dir: 1 | -1) {
  const { n, unit } = parseAmount(a);
  const step = n < 1 || (n <= 1 && dir < 0) ? 0.25 : n % 1 ? 0.5 : 1;
  const next = Math.max(0.25, Math.round((n + dir * step) * 4) / 4);
  return formatAmount(next, unit);
}

export const groceryCount = (lists: GroceryList[]) => {
  const sel = lists.filter((l) => (l.selected ?? true) && l.items.some((i) => !i.have));
  return { lists: sel.length, items: sel.reduce((s, l) => s + l.items.filter((i) => !i.have).length, 0) };
};

// ----- screen-local UI state (not persisted) -----
type JournalUi = {
  mealId: string; // J02
  collectionId: string; // J07
  recipeId: string; // J08
  dish: string; // J12 target list
  justAdded: string | null; // J01 row that expands in place
  set: (p: Partial<Omit<JournalUi, "set">>) => void;
};
export const useJournalUi = create<JournalUi>((set) => ({
  mealId: "m-tue-l",
  collectionId: "weeknight",
  recipeId: "rajma-chawal",
  dish: "Black Bean Tacos",
  justAdded: null,
  set: (p) => set(p),
}));
