import { go } from "@/proto/nav";
import { useProto } from "@/proto/store";

/** Ends onboarding from 14 / 14b: mark done and go Home. */
export function finishOnboarding() {
  useProto.getState().set({ done: true });
  go("home");
}
