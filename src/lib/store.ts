"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Provider = "apple" | "google";
export type Units = "us" | "metric";
export type Skill = "new" | "comfortable" | "confident";
export type StoveType = "gas" | "induction" | "electric-coil" | "infrared";

export type OnboardingState = {
  // Account (mocked sign-in for now)
  account: { provider: Provider; name: string; email: string } | null;
  returning: boolean;

  // Personalise
  name: string;
  pronunciation: string;
  diet: string;
  allergies: string[];
  cuisines: string[];
  servings: number;
  units: Units;
  skill: Skill;

  // Device (simulated for now)
  device: {
    paired: boolean;
    code: string;
    wifi: string | null;
    stoveType: StoveType;
    burners: number;
    calibrated: boolean;
  };

  savedRecipes: number;
  onboarded: boolean;
  skippedDevice: boolean;
};

type Actions = {
  set: (patch: Partial<OnboardingState>) => void;
  setDevice: (patch: Partial<OnboardingState["device"]>) => void;
  toggle: (key: "allergies" | "cuisines", value: string) => void;
  reset: () => void;
};

const initial: OnboardingState = {
  account: null,
  returning: false,
  name: "",
  pronunciation: "",
  diet: "Everything",
  allergies: [],
  cuisines: [],
  servings: 2,
  units: "us",
  skill: "comfortable",
  device: { paired: false, code: "4F2", wifi: null, stoveType: "electric-coil", burners: 4, calibrated: false },
  savedRecipes: 0,
  onboarded: false,
  skippedDevice: false,
};

export const useOnboarding = create<OnboardingState & Actions>()(
  persist(
    (set) => ({
      ...initial,
      set: (patch) => set(patch),
      setDevice: (patch) => set((s) => ({ device: { ...s.device, ...patch } })),
      toggle: (key, value) =>
        set((s) => ({
          [key]: s[key].includes(value) ? s[key].filter((v) => v !== value) : [...s[key], value],
        })),
      reset: () => set(initial),
    }),
    { name: "tara-onboarding" }
  )
);

/** Mock sign-in. Swap for a real provider (Supabase, etc.) later. */
export async function mockSignIn(provider: Provider, mode: "create" | "signin") {
  await new Promise((r) => setTimeout(r, 600));
  const store = useOnboarding.getState();
  if (mode === "signin") {
    // A returning user whose setup already exists on Tara.
    store.set({
      account: { provider, name: "Priya", email: "priya@example.com" },
      returning: true,
      name: "Priya",
      pronunciation: "PREE · yah",
      diet: "Vegetarian",
      savedRecipes: 23,
      device: { ...store.device, paired: true, wifi: "Home WiFi", stoveType: "electric-coil", burners: 4, calibrated: true },
    });
  } else {
    store.set({
      account: { provider, name: "Priya", email: "priya@example.com" },
      returning: false,
      name: "Priya",
      pronunciation: "PREE · yah",
    });
  }
}

/** Avoids hydration mismatches: true once persisted state has loaded on the client. */
export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => {
    const unsub = useOnboarding.persist.onFinishHydration(() => setH(true));
    if (useOnboarding.persist.hasHydrated()) setH(true);
    return unsub;
  }, []);
  return h;
}

