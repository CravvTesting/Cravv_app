"use client";

import { PrimaryButton, SheetHeader, TextButton } from "@/components/cravv";
import { back, go } from "@/proto/nav";
import { Sheet } from "@/proto/ui";
import { Checklist, IMG } from "./connect/parts";

const ITEMS = [
  { icon: `${IMG}/icon-display.svg`, title: "Tara says Hello", hint: "If not, unplug it for 10 seconds" },
  { icon: `${IMG}/icon-bt.svg`, title: "Bluetooth is on", hint: "Check in Settings on this iPhone" },
  { icon: `${IMG}/icon-phone-list.svg`, title: "Phone within 10 feet", hint: "Walls can block the signal" },
];

/**
 * 08x · Can't find Tara, sheet over 08 (Figma 2532:2985).
 * Try Again → 08 (replaces 08x without a slide, so 08 re-runs the search).
 * Get Help (no destination in the handoff) and dismissing go back to 07.
 */
export default function S08x() {
  return (
    <Sheet label="Can’t find Tara" onDismiss={() => back()}>
      <SheetHeader title="Can’t find Tara" subtitle="Check these, then try again." />
      <div className="px-4">
        <Checklist items={ITEMS} variant="08x" />
      </div>
      <div className="px-6">
        <PrimaryButton className="mt-5" onClick={() => go("08", { replace: true, dir: "none" })}>
          Try Again
        </PrimaryButton>
        <TextButton className="mt-1.5 font-semibold" style={{ color: "var(--cravv-text-accent)" }} onClick={() => back()}>
          Get Help
        </TextButton>
      </div>
    </Sheet>
  );
}
