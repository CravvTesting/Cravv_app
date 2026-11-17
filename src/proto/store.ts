"use client";

import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { SEED_MEALS, type Meal } from "./seed/meals";
import { SEED_COLLECTIONS, SEED_GROCERY, type Collection, type GroceryList } from "./seed/journal";

/** Every screen id in the handoff (section 3), plus "home". */
export const SCREEN_IDS = [
  "01", "02", "02x", "02b", "02c",
  "03", "04", "05", "06",
  "07a", "07b", "07c", "07", "07h", "08", "08x", "09", "09x",
  "10", "10x", "10b",
  "11", "12", "12h", "13", "13p", "13r", "13s", "13x", "13y", "13n",
  "14", "14b", "home",
  // Home filters (TABS_HANDOFF §11): sheet over Home
  "F01", "F02", "F03",
  // Nutrition: first-open setup, then Today/Week/Month and pushed screens
  "N01", "N02", "N02b", "N03", "N04", "N05", "N05b", "N06",
  "R01", "R02", "R03", "R04", "R05", "R06", "R07", "R08", "R09",
  // Journal
  "J01", "J02", "J03", "J04", "J05", "J06", "J07", "J08", "J09", "J10", "J11", "J12", "J13", "J14", "J15",
  // Profile (+ onboarding screens reused in edit mode)
  "P01", "P01b", "P01c", "P02", "P03", "P04", "P05",
  "e04", "e05", "e11",
  // Placeholder for anything out of scope (recipe page, live session)
  "placeholder",
] as const;
export type ScreenId = (typeof SCREEN_IDS)[number];
export const isScreenId = (v: string): v is ScreenId => (SCREEN_IDS as readonly string[]).includes(v);

export type StoveType = "gas" | "induction" | "electric-coil" | "infrared";
export type Burners = 1 | 2 | 3 | 4 | 5;

/** Prototype state from handoff section 6. */
export type Onboarding = {
  name: string;
  diet: string[];
  allergies: string[];
  cuisines: string[];
  cookingFor: number;
  units: "us" | "metric";
  skill: "new" | "comfortable" | "confident";
  stoveType: StoveType;
  burners: Burners;
  wifi: string;
  alerts: boolean;
  setupPending: boolean;
  step: ScreenId;
  done: boolean;
};

export type Nutrient = "fiber" | "sodium" | "added-sugar" | "saturated-fat" | "protein";

/** Tabs state (TABS_HANDOFF §6). Onboarding state above is the same store: read it, don't copy. */
export type Tabs = {
  nutritionSetup: boolean;
  body: { age: number; sex: "female" | "male" | "other"; heightIn: number; weightLb: number; pregnant: boolean };
  activity: "mostly-sitting" | "lightly-active" | "active" | "very-active";
  goal: "lose" | "maintain" | "gain" | "build-muscle";
  targets: { kcal: number; protein: number; carbs: number; fat: number; mode: "forYou" | "custom" };
  watching: Nutrient[];
  meals: Meal[];
  collections: Collection[];
  grocery: GroceryList[];
  tara: { status: "online" | "offline" | "not-set-up"; name: string };
  alertsCfg: { info: boolean; actNow: boolean; family: boolean };
  camera: { saveDishPhotos: boolean; paused: boolean };
  live: null | { mode: "cooking" | "watching"; title: string; detail: string; progress: number };
  homeFilters: { time: "any" | "15" | "30" | "60"; course: string[]; cuisine: string[]; more: string[] };
};

/** Debug menu settings (onboarding §5 + tabs §7, §11). */
export type Debug = {
  signIn: "succeeds" | "cancelled";
  bluetooth: "allow" | "deny";
  find: "found" | "cant-find" | "already-set-up";
  wifi: "joins" | "wrong-once";
  updatePending: boolean;
  calibration: "match" | "fewer" | "more";
  dropWifi: boolean;
  ending: "14" | "14b";
  speed: 0.5 | 1 | 2;
  slowAnimations: boolean;
  // tabs
  mealLog: "persona" | "empty";
  favourites: "persona" | "empty";
  groceryData: "persona" | "empty";
  instacart: "all-added" | "some-changed" | "some-unavailable";
  overLimit: "saturated-fat" | "none";
  timeOfDay: "auto" | "breakfast" | "lunch" | "dinner";
};

const initialOnboarding: Onboarding = {
  name: "Priya",
  diet: ["vegetarian"],
  allergies: ["peanuts"],
  cuisines: ["italian", "mexican", "indian"],
  cookingFor: 2,
  units: "us",
  skill: "comfortable",
  stoveType: "electric-coil",
  burners: 4,
  wifi: "Home WiFi",
  alerts: false,
  setupPending: false,
  step: "01",
  done: false,
};

export const initialTabs: Tabs = {
  nutritionSetup: false,
  body: { age: 34, sex: "female", heightIn: 64, weightLb: 138, pregnant: false },
  activity: "lightly-active",
  goal: "maintain",
  targets: { kcal: 1900, protein: 85, carbs: 250, fat: 63, mode: "forYou" },
  watching: ["fiber", "sodium"],
  meals: SEED_MEALS,
  collections: SEED_COLLECTIONS,
  grocery: SEED_GROCERY,
  tara: { status: "online", name: "Kitchen" },
  alertsCfg: { info: true, actNow: true, family: false },
  camera: { saveDishPhotos: true, paused: false },
  live: null,
  homeFilters: { time: "any", course: [], cuisine: [], more: [] },
};

const initialDebug: Debug = {
  signIn: "succeeds",
  bluetooth: "allow",
  find: "found",
  wifi: "joins",
  updatePending: false,
  calibration: "match",
  dropWifi: false,
  ending: "14",
  speed: 1,
  slowAnimations: false,
  mealLog: "persona",
  favourites: "persona",
  groceryData: "persona",
  instacart: "some-changed",
  overLimit: "saturated-fat",
  timeOfDay: "auto",
};

/** Runtime flags that reset every session (not persisted). */
type Session = {
  wrongPasswordShown: boolean; // "wrong password once"
  wifiDroppedThisRun: boolean; // 13p only once per calibration run
  calibrationProgress: number; // 0..1, so 13 resumes after 13r
};

type Store = Onboarding & Tabs & { debug: Debug } & Session & {
  set: (patch: Partial<Onboarding & Tabs & Session>) => void;
  setDebug: (patch: Partial<Debug>) => void;
  toggleIn: (key: "diet" | "allergies" | "cuisines", id: string) => void;
  reset: () => void;
};

// localStorage wrapped in try/catch (private mode, blocked storage, previews).
const safeStorage: StateStorage = {
  getItem: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  setItem: (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
  removeItem: (k) => { try { localStorage.removeItem(k); } catch { /* ignore */ } },
};

const initialSession: Session = { wrongPasswordShown: false, wifiDroppedThisRun: false, calibrationProgress: 0 };

export const useProto = create<Store>()(
  persist(
    (set) => ({
      ...initialOnboarding,
      ...initialTabs,
      debug: initialDebug,
      ...initialSession,
      set: (patch) => set(patch),
      setDebug: (patch) => set((s) => ({ debug: { ...s.debug, ...patch } })),
      toggleIn: (key, id) =>
        set((s) => {
          const list = s[key];
          return { [key]: list.includes(id) ? list.filter((v) => v !== id) : [...list, id] };
        }),
      reset: () => set({ ...initialOnboarding, ...initialTabs, debug: initialDebug, ...initialSession }),
    }),
    {
      name: "tara-proto",
      version: 3,
      storage: createJSONStorage(() => safeStorage),
      // v1 → v2: add tabs state and new debug keys, keep onboarding answers.
      migrate: (persisted, version) => {
        const p = (persisted ?? {}) as Partial<Store>;
        if (version < 2) return { ...initialTabs, ...p, debug: { ...initialDebug, ...(p.debug ?? {}) } } as Store;
        // v2 → v3: the meal diary was rebuilt (Nov 1–17, per-serving nutrients); reseed it.
        if (version < 3) return { ...p, meals: initialTabs.meals } as Store;
        return p as Store;
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Store>;
        return { ...current, ...p, debug: { ...current.debug, ...(p.debug ?? {}) } };
      },
      partialize: (s) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { wrongPasswordShown, wifiDroppedThisRun, calibrationProgress, set, setDebug, toggleIn, reset, ...rest } = s;
        return rest;
      },
    }
  )
);
