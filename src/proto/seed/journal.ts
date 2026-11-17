/*
 * Journal persona data (TABS_HANDOFF §5): Favourites collections (read from frame J06) and
 * Grocery lists (read from frame J11: Black Bean Tacos and Paneer Butter Masala).
 * Owned by the Journal screens; fill these from the frames.
 */
export type Collection = { id: string; name: string; recipeIds: string[]; shared: boolean; cover?: string[] };
export type GroceryItem = { name: string; amount: string; have: boolean };
export type GroceryList = { dish: string; items: GroceryItem[] };

export const SEED_COLLECTIONS: Collection[] = [];
export const SEED_GROCERY: GroceryList[] = [];
