"use client";

import { useRouter } from "next/navigation";
import { useOnboarding } from "@/lib/store";

/** Ends onboarding and lands on Home. Used by every terminal action on 14 / 14b. */
export function useFinishOnboarding() {
  const router = useRouter();
  const set = useOnboarding((s) => s.set);
  return () => {
    set({ onboarded: true });
    router.replace("/home");
  };
}
