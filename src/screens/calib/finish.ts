import { finishFlow } from "@/proto/nav";
import { useProto } from "@/proto/store";

/**
 * Ends the setup flow from 14 / 14b. Tara is now set up. During onboarding this goes Home;
 * when the flow was started from a tab (Set Up Tara on Home/Profile, Recalibrate in P02)
 * it returns to the screen it started from.
 */
export function finishOnboarding() {
  const s = useProto.getState();
  s.set({ done: true, setupPending: false, tara: { ...s.tara, status: "online" } });
  finishFlow();
}
