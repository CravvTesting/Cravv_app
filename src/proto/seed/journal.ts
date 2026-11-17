/*
 * Journal persona data (TABS_HANDOFF §5): Favourites collections (read from frame J06) and
 * Grocery lists (read from frame J11: Black Bean Tacos and Paneer Butter Masala).
 * Owned by the Journal screens.
 *
 * Collection id "all" is "All favourites" (26 recipes): it is not drawn in the J06 grid, it is
 * the row above it. Recipe ids refer to RECIPES in src/screens/journal/data.ts.
 */
export type Collection = { id: string; name: string; recipeIds: string[]; shared: boolean; cover?: string[] };
export type GroceryItem = { name: string; amount: string; have: boolean };
export type GroceryList = {
  dish: string;
  items: GroceryItem[];
  /** Ticked to send to Instacart (J11 list checkbox). Defaults to true. */
  selected?: boolean;
  /** Second line under the dish ("Thu dinner"). */
  source?: string;
  /** Recipe id, for the thumbnail and suggested ingredients (J12). */
  recipeId?: string;
};

export const SEED_COLLECTIONS: Collection[] = [
  {
    id: "all",
    name: "All favourites",
    shared: false,
    recipeIds: [
      "tacos", "thai-green-curry", "spaghetti-pomodoro", "paneer-butter-masala", "chili-paneer", "pad-thai",
      "paneer-tikka", "veg-fried-rice", "bourguignon", "rajma-chawal", "nimono", "biryani", "dal-makhani",
      "miso-ramen", "veg-manchurian", "hakka-noodles", "palak-paneer", "chana-masala", "margherita",
      "mushroom-risotto", "caprese-pasta", "veg-enchiladas", "shakshuka", "aloo-gobi", "pesto-gnocchi", "minestrone",
    ],
  },
  { id: "weeknight", name: "Weeknight, under 30", shared: false, recipeIds: ["tacos", "thai-green-curry", "spaghetti-pomodoro", "paneer-butter-masala", "chili-paneer", "pad-thai", "paneer-tikka", "veg-fried-rice"] },
  { id: "sunday", name: "Sunday slow cooks", shared: false, recipeIds: ["bourguignon", "rajma-chawal", "nimono", "biryani", "dal-makhani"] },
  { id: "moms", name: "Mom’s favourites", shared: true, recipeIds: ["pad-thai", "nimono", "paneer-tikka", "thai-green-curry"] },
  { id: "takeout", name: "Takeout at home", shared: false, recipeIds: ["chili-paneer", "pad-thai", "miso-ramen", "paneer-tikka", "veg-manchurian", "hakka-noodles"] },
];

export const SEED_GROCERY: GroceryList[] = [
  {
    dish: "Black Bean Tacos",
    recipeId: "tacos",
    source: "Thu dinner",
    selected: true,
    items: [
      { name: "Black beans", amount: "2 cans", have: false },
      { name: "Corn tortillas", amount: "12", have: false },
      { name: "Avocados", amount: "2", have: false },
    ],
  },
  {
    dish: "Paneer Butter Masala",
    recipeId: "paneer-butter-masala",
    source: "From “What can I make?”",
    selected: true,
    items: [
      { name: "Heavy cream", amount: "½ cup", have: false },
      { name: "Cashews", amount: "15", have: false },
    ],
  },
  {
    dish: "Other",
    source: "Added by you",
    selected: false,
    items: [{ name: "Milk", amount: "1 gal", have: false }],
  },
];
