/* Home tab content (Figma "Home v2 · full scroll", 2568:3979). Static rails; the filterable catalogue is in recipes.ts. */

export type Recipe = { id: string; title: string; meta: string; img: string; tag?: string };

/** Family recipes first, then saved ones. */
export const YOUR_RECIPES: Recipe[] = [
  { id: "moms-pad-thai", title: "Mom’s Tofu Pad Thai", meta: "Family · 6 steps", img: "/img/home/tofu-pad-thai.webp", tag: "Family" },
  { id: "nanis-stew", title: "Nani’s Fish Stew", meta: "Family · 8 steps", img: "/img/home/fish-stew.webp", tag: "Family" },
  { id: "kung-pao", title: "Kung Pao Chicken", meta: "Saved", img: "/img/home/kung-pao.webp" },
  { id: "shoyu-ramen", title: "Shoyu Ramen", meta: "Saved", img: "/img/home/shoyu-ramen.webp" },
];

export const COLLECTIONS: { id: string; title: string; count: number; img: string }[] = [
  { id: "takeout", title: "Takeout favourites", count: 12, img: "/img/home/takeout.webp" },
  { id: "one-pot", title: "One-pot dinners", count: 9, img: "/img/home/one-pot.webp" },
  { id: "weeknight-thai", title: "Weeknight Thai", count: 8, img: "/img/home/weeknight-thai.webp" },
  { id: "slow-cooks", title: "Sunday slow cooks", count: 6, img: "/img/home/slow-cooks.webp" },
];

export const QUICK: Recipe[] = [
  { id: "q-pad-thai", title: "Tofu Pad Thai", meta: "20 min · Thai", img: "/img/home/tofu-pad-thai.webp" },
  { id: "q-fish", title: "Simmered Fish", meta: "25 min · Japanese", img: "/img/home/fish-stew.webp" },
  { id: "q-kung-pao", title: "Kung Pao Tofu", meta: "25 min · Chinese", img: "/img/home/kung-pao.webp" },
  { id: "q-ramen", title: "Quick Shoyu Ramen", meta: "30 min · Japanese", img: "/img/home/shoyu-ramen.webp" },
];

export function greetingFor(hour: number) {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  return "Good evening";
}
