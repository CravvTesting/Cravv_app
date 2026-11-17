/*
 * Home recipe catalogue for the meal filter and the filter sheet (handoff §11). 48 fake recipes,
 * all vegetarian and peanut-free for the persona (Priya: vegetarian, avoids peanuts), so diet from
 * Profile always applies without removing anything. Photos are reused across recipes.
 *
 * Fixed examples the frames depend on (checked by hand against `countMatches`):
 * - F02: Under 1 hr + Mains + Thai + Hands-off → 6 recipes (all of them dinner, so F04 also reads 6).
 * - F03 / debug "no matches": 15 min + Mains + Japanese + One pot → 0; removing One pot → 3 (the most),
 *   so the note reads "Remove One pot (3 recipes)" as in the frame. (The F03 frame itself picks Desserts +
 *   Hands-off + One pot; with OR inside the More group that can't be 0 and still give 3 without One pot.)
 */
import { COURSES, CUISINES, MORE, type CourseId, type CuisineId, type MealId, type MoreId } from "@/components/cravv";

export type TimeLimit = "any" | "15" | "30" | "60";
export type HomeFilters = { time: TimeLimit; course: string[]; cuisine: string[]; more: string[] };
type Diet = "vegetarian" | "vegan" | "dairy-free" | "gluten-free";

export type HomeRecipe = {
  id: string;
  title: string;
  minutes: number;
  meals: MealId[];
  course: CourseId;
  cuisine: CuisineId;
  more: MoreId[];
  diets: Diet[];
  img: string;
  /** Extra line in the card meta, e.g. "fits your week". */
  note?: string;
};

const P = (n: string) => `/img/home/${n}.webp`;
const V: Diet[] = ["vegetarian"];
const VG: Diet[] = ["vegetarian", "vegan", "dairy-free"];
const VGF: Diet[] = ["vegetarian", "vegan", "dairy-free", "gluten-free"];
const L_D: MealId[] = ["lunch", "dinner"];
const D: MealId[] = ["dinner"];

export const RECIPES: HomeRecipe[] = [
  // Thai
  { id: "green-curry", title: "Thai Green Curry", minutes: 35, meals: L_D, course: "mains", cuisine: "thai", more: ["hands-off", "easy"], diets: VGF, img: P("green-curry"), note: "fits your week" },
  { id: "pad-thai", title: "Pad Thai", minutes: 25, meals: L_D, course: "mains", cuisine: "thai", more: ["can-make-now"], diets: V, img: P("pad-thai") },
  { id: "massaman", title: "Massaman Curry", minutes: 55, meals: D, course: "mains", cuisine: "thai", more: ["hands-off", "one-pot"], diets: VGF, img: P("slow-cooks") },
  { id: "panang", title: "Panang Tofu Curry", minutes: 40, meals: D, course: "mains", cuisine: "thai", more: ["hands-off", "one-pot"], diets: VG, img: P("green-curry") },
  { id: "red-curry", title: "Thai Red Curry", minutes: 35, meals: L_D, course: "mains", cuisine: "thai", more: ["hands-off", "easy"], diets: VGF, img: P("green-curry") },
  { id: "khao-soi", title: "Khao Soi", minutes: 50, meals: D, course: "mains", cuisine: "thai", more: ["hands-off"], diets: V, img: P("shoyu-ramen") },
  { id: "yellow-curry", title: "Yellow Potato Curry", minutes: 45, meals: D, course: "mains", cuisine: "thai", more: ["hands-off", "one-pot", "easy"], diets: VGF, img: P("slow-cooks") },
  { id: "jackfruit", title: "Slow-braised Jackfruit Curry", minutes: 90, meals: D, course: "mains", cuisine: "thai", more: ["hands-off", "one-pot"], diets: VGF, img: P("slow-cooks") },
  { id: "tom-kha", title: "Tom Kha Soup", minutes: 30, meals: L_D, course: "soups", cuisine: "thai", more: ["hands-off", "one-pot"], diets: VGF, img: P("fish-stew") },
  { id: "mango-sticky-rice", title: "Mango Sticky Rice", minutes: 40, meals: D, course: "desserts", cuisine: "thai", more: ["hands-off"], diets: VGF, img: P("takeout") },
  { id: "drunken-noodles", title: "Drunken Noodles", minutes: 20, meals: L_D, course: "mains", cuisine: "thai", more: ["easy"], diets: VG, img: P("tofu-pad-thai") },
  // Japanese
  { id: "shoyu-ramen", title: "Shoyu Ramen", minutes: 30, meals: L_D, course: "mains", cuisine: "japanese", more: ["one-pot"], diets: V, img: P("shoyu-ramen") },
  { id: "miso-soup", title: "Vegetable Miso Soup", minutes: 15, meals: ["breakfast", "lunch", "dinner"], course: "soups", cuisine: "japanese", more: ["one-pot", "easy", "can-make-now"], diets: VGF, img: P("fish-stew") },
  { id: "yasai-udon", title: "Yasai Udon", minutes: 15, meals: L_D, course: "mains", cuisine: "japanese", more: ["easy"], diets: VG, img: P("shoyu-ramen") },
  { id: "mushroom-curry", title: "Japanese Mushroom Curry", minutes: 40, meals: D, course: "mains", cuisine: "japanese", more: ["one-pot", "hands-off"], diets: V, img: P("slow-cooks") },
  { id: "agedashi", title: "Agedashi Tofu", minutes: 25, meals: D, course: "sides", cuisine: "japanese", more: [], diets: VG, img: P("kung-pao") },
  { id: "matcha-mochi", title: "Matcha Mochi", minutes: 15, meals: L_D, course: "desserts", cuisine: "japanese", more: ["hands-off"], diets: VGF, img: P("takeout") },
  { id: "sesame-pudding", title: "Black Sesame Pudding", minutes: 10, meals: D, course: "desserts", cuisine: "japanese", more: ["hands-off", "easy"], diets: V, img: P("takeout") },
  { id: "coffee-jelly", title: "Coffee Jelly", minutes: 10, meals: L_D, course: "desserts", cuisine: "japanese", more: ["hands-off", "easy", "can-make-now"], diets: VGF, img: P("takeout") },
  { id: "tamago-bowl", title: "Tamago Rice Bowl", minutes: 10, meals: ["breakfast", "lunch"], course: "mains", cuisine: "japanese", more: ["easy", "can-make-now"], diets: V, img: P("tofu-pad-thai") },
  { id: "cold-soba", title: "Cold Soba Noodles", minutes: 15, meals: L_D, course: "mains", cuisine: "japanese", more: ["easy"], diets: VG, img: P("shoyu-ramen") },
  // Chinese
  { id: "kung-pao", title: "Cashew Kung Pao Tofu", minutes: 25, meals: L_D, course: "mains", cuisine: "chinese", more: [], diets: VG, img: P("kung-pao") },
  { id: "mapo-tofu", title: "Mushroom Mapo Tofu", minutes: 25, meals: D, course: "mains", cuisine: "chinese", more: ["one-pot"], diets: VG, img: P("kung-pao") },
  { id: "fried-rice", title: "Veggie Fried Rice", minutes: 15, meals: L_D, course: "mains", cuisine: "chinese", more: ["one-pot", "easy", "can-make-now"], diets: V, img: P("takeout") },
  { id: "hot-sour", title: "Hot and Sour Soup", minutes: 25, meals: L_D, course: "soups", cuisine: "chinese", more: ["one-pot"], diets: VG, img: P("fish-stew") },
  { id: "bok-choy", title: "Garlic Bok Choy", minutes: 10, meals: L_D, course: "sides", cuisine: "chinese", more: ["easy", "can-make-now"], diets: VGF, img: P("kung-pao") },
  { id: "scallion-pancakes", title: "Scallion Pancakes", minutes: 30, meals: ["breakfast", "lunch"], course: "snacks", cuisine: "chinese", more: [], diets: VG, img: P("takeout") },
  // Indian
  { id: "dal", title: "Dal Tadka", minutes: 35, meals: L_D, course: "mains", cuisine: "indian", more: ["one-pot", "hands-off", "easy", "can-make-now"], diets: VGF, img: P("slow-cooks") },
  { id: "paneer", title: "Paneer Butter Masala", minutes: 40, meals: D, course: "mains", cuisine: "indian", more: [], diets: ["vegetarian", "gluten-free"], img: P("green-curry") },
  { id: "chana", title: "Chana Masala", minutes: 45, meals: L_D, course: "mains", cuisine: "indian", more: ["one-pot", "hands-off"], diets: VGF, img: P("slow-cooks") },
  { id: "rajma", title: "Rajma Chawal", minutes: 60, meals: D, course: "mains", cuisine: "indian", more: ["hands-off", "one-pot"], diets: VGF, img: P("one-pot") },
  { id: "poha", title: "Kanda Poha", minutes: 20, meals: ["breakfast"], course: "mains", cuisine: "indian", more: ["easy", "can-make-now"], diets: VGF, img: P("tofu-pad-thai") },
  { id: "kheer", title: "Rice Kheer", minutes: 50, meals: D, course: "desserts", cuisine: "indian", more: ["hands-off", "one-pot"], diets: ["vegetarian", "gluten-free"], img: P("takeout") },
  { id: "aloo-tikki", title: "Aloo Tikki", minutes: 30, meals: ["lunch"], course: "snacks", cuisine: "indian", more: [], diets: VG, img: P("takeout") },
  // Italian
  { id: "pomodoro", title: "Spaghetti Pomodoro", minutes: 25, meals: L_D, course: "mains", cuisine: "italian", more: ["easy", "can-make-now"], diets: VG, img: P("one-pot") },
  { id: "lemon-orzo", title: "One-pot Lemon Orzo", minutes: 20, meals: L_D, course: "mains", cuisine: "italian", more: ["one-pot", "easy"], diets: V, img: P("one-pot") },
  { id: "minestrone", title: "Minestrone", minutes: 45, meals: L_D, course: "soups", cuisine: "italian", more: ["one-pot", "hands-off"], diets: VG, img: P("fish-stew") },
  { id: "risotto", title: "Mushroom Risotto", minutes: 40, meals: D, course: "mains", cuisine: "italian", more: ["one-pot"], diets: ["vegetarian", "gluten-free"], img: P("one-pot") },
  { id: "caprese", title: "Caprese Salad", minutes: 10, meals: ["lunch"], course: "sides", cuisine: "italian", more: ["easy", "can-make-now"], diets: ["vegetarian", "gluten-free"], img: P("weeknight-thai") },
  { id: "tiramisu", title: "Tiramisu", minutes: 30, meals: D, course: "desserts", cuisine: "italian", more: ["hands-off", "easy"], diets: V, img: P("takeout") },
  // Mexican
  { id: "tacos", title: "Black Bean Tacos", minutes: 20, meals: L_D, course: "mains", cuisine: "mexican", more: ["easy", "can-make-now"], diets: VGF, img: P("takeout") },
  { id: "enchiladas", title: "Veggie Enchiladas", minutes: 50, meals: D, course: "mains", cuisine: "mexican", more: ["hands-off"], diets: ["vegetarian", "gluten-free"], img: P("slow-cooks") },
  { id: "chilaquiles", title: "Chilaquiles", minutes: 20, meals: ["breakfast"], course: "mains", cuisine: "mexican", more: ["one-pot"], diets: V, img: P("takeout") },
  { id: "elote", title: "Elote", minutes: 15, meals: L_D, course: "sides", cuisine: "mexican", more: ["easy"], diets: ["vegetarian", "gluten-free"], img: P("takeout") },
  // American
  { id: "mac-cheese", title: "Baked Mac and Cheese", minutes: 45, meals: D, course: "mains", cuisine: "american", more: ["hands-off", "easy"], diets: V, img: P("takeout") },
  { id: "pancakes", title: "Buttermilk Pancakes", minutes: 20, meals: ["breakfast"], course: "mains", cuisine: "american", more: ["easy", "can-make-now"], diets: V, img: P("takeout") },
  // Mediterranean
  { id: "shakshuka", title: "Shakshuka", minutes: 25, meals: ["breakfast", "lunch"], course: "mains", cuisine: "mediterranean", more: ["one-pot", "easy"], diets: ["vegetarian", "gluten-free"], img: P("slow-cooks") },
  { id: "falafel", title: "Falafel Wraps", minutes: 35, meals: ["lunch"], course: "mains", cuisine: "mediterranean", more: [], diets: VG, img: P("tofu-pad-thai") },
];

export const NO_FILTERS: HomeFilters = { time: "any", course: [], cuisine: [], more: [] };
/** Debug presets (DebugMenu "Home · filters"). */
export const SOME_FILTERS: HomeFilters = { time: "60", course: ["mains"], cuisine: ["thai"], more: ["hands-off"] };
export const NO_MATCH_FILTERS: HomeFilters = { time: "15", course: ["mains"], cuisine: ["japanese"], more: ["one-pot"] };

export const TIME_OPTIONS: { value: TimeLimit; label: string }[] = [
  { value: "any", label: "Any" },
  { value: "15", label: "15 min" },
  { value: "30", label: "30 min" },
  { value: "60", label: "1 hr" },
];

/** Active filters for the badge. Diet from Profile always applies and isn't counted. */
export const filterCount = (f: HomeFilters) => (f.time !== "any" ? 1 : 0) + f.course.length + f.cuisine.length + f.more.length;

/** Diets we can check against recipe tags; anything else ("everything", "pescatarian") is already satisfied. */
const CHECKED_DIETS: readonly string[] = ["vegetarian", "vegan", "dairy-free", "gluten-free"];

/** Inside a group: OR. Across groups: AND. Profile diet always applies. `meal` null = every meal. */
export function matches(r: HomeRecipe, f: HomeFilters, diet: readonly string[], meal: MealId | null = null) {
  if (meal && !r.meals.includes(meal)) return false;
  if (f.time !== "any" && r.minutes > Number(f.time)) return false;
  if (f.course.length && !f.course.includes(r.course)) return false;
  if (f.cuisine.length && !f.cuisine.includes(r.cuisine)) return false;
  if (f.more.length && !f.more.some((m) => (r.more as string[]).includes(m))) return false;
  return diet.every((d) => !CHECKED_DIETS.includes(d) || (r.diets as string[]).includes(d));
}

export const filterRecipes = (f: HomeFilters, diet: readonly string[], meal: MealId | null = null) =>
  RECIPES.filter((r) => matches(r, f, diet, meal));

/** The one filter whose removal brings back the most recipes (F03). null when nothing helps. */
export function bestRemoval(f: HomeFilters, diet: readonly string[]): { label: string; count: number; next: HomeFilters } | null {
  const options: { label: string; next: HomeFilters }[] = [];
  if (f.time !== "any") options.push({ label: `the ${TIME_OPTIONS.find((t) => t.value === f.time)!.label} limit`, next: { ...f, time: "any" } });
  for (const c of f.course) options.push({ label: COURSES.find((x) => x.id === c)?.label ?? c, next: { ...f, course: f.course.filter((x) => x !== c) } });
  for (const c of f.cuisine) options.push({ label: CUISINES.find((x) => x.id === c)?.label ?? c, next: { ...f, cuisine: f.cuisine.filter((x) => x !== c) } });
  for (const m of f.more) options.push({ label: MORE.find((x) => x.id === m)?.label ?? m, next: { ...f, more: f.more.filter((x) => x !== m) } });
  let best: { label: string; count: number; next: HomeFilters } | null = null;
  for (const o of options) {
    const count = filterRecipes(o.next, diet).length;
    if (count > 0 && (!best || count > best.count)) best = { ...o, count };
  }
  return best;
}

export const cuisineLabel = (id: CuisineId) => CUISINES.find((c) => c.id === id)?.label ?? id;
export const recipeMeta = (r: HomeRecipe) => [`${r.minutes} min`, cuisineLabel(r.cuisine), r.note].filter(Boolean).join(" · ");
