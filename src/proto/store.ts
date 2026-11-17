"use client";

import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

/** Every screen id in the handoff (section 3), plus "home". */
export const SCREEN_IDS = [
  "01", "02", "02x", "02b", "02c",
  "03", "04", "05", "06",
  "07a", "07b", "07c", "07", "07h", "08", "08x", "09", "09x",
  "10", "10x", "10b",
  "11", "12", "12h", "13", "13p", "13r", "13s", "13x", "13y", "13n",
  "14", "14b", "home",
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

/** Debug menu settings (handoff section 5). */
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
};

/** Runtime flags that reset every session (not persisted). */
type Session = {
  wrongPasswordShown: boolean; // "wrong password once"
  wifiDroppedThisRun: boolean; // 13p only once per calibration run
  calibrationProgress: number; // 0..1, so 13 resumes after 13r
};

type Store = Onboarding & { debug: Debug } & Session & {
  set: (patch: Partial<Onboarding & Session>) => void;
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
      debug: initialDebug,
      ...initialSession,
      set: (patch) => set(patch),
      setDebug: (patch) => set((s) => ({ debug: { ...s.debug, ...patch } })),
      toggleIn: (key, id) =>
        set((s) => {
          const list = s[key];
          return { [key]: list.includes(id) ? list.filter((v) => v !== id) : [...list, id] };
        }),
      reset: () => set({ ...initialOnboarding, debug: initialDebug, ...initialSession }),
    }),
    {
      name: "tara-proto",
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { wrongPasswordShown, wifiDroppedThisRun, calibrationProgress, set, setDebug, toggleIn, reset, ...rest } = s;
        return rest;
      },
    }
  )
);
