"use client";

/*
 * N05 · Your targets (2604:3943). Mifflin–St Jeor × activity + goal (see setup/calc.ts; the
 * persona lands on exactly 1,900 kcal, 85/250/63 g). Start Tracking writes the targets
 * (mode "forYou") and goes to N06. "How we worked this out" → N05b (sheet over this view).
 */
import { go } from "@/proto/nav";
import { TargetsView } from "./setup/TargetsView";

export default function N05() {
  // Cross-fade: N05b repeats this view under its sheet, so only the sheet appears to move.
  return <TargetsView onHow={() => go("N05b", { dir: "none" })} />;
}
