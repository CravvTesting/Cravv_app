"use client";

import { PrimaryButton, SheetHeader, TextButton } from "@/components/cravv";
import { back, go } from "@/proto/nav";
import { Sheet } from "@/proto/ui";
import { Checklist, IMG } from "./connect/parts";

const ITEMS = [
  { icon: `${IMG}/check-plug.svg`, title: "The outlet works", hint: "Try a lamp in the same outlet" },
  { icon: `${IMG}/check-bolt.svg`, title: "Cable is pushed in", hint: "At the back of the display, until it clicks" },
  { icon: `${IMG}/check-clock.svg`, title: "Give it 30 seconds", hint: "The Cravv logo appears first" },
];

/** 07h · Blank screen sheet over 07 (Figma 2628:4892). Try Again → 08. Get Help just closes the sheet. */
export default function S07h() {
  return (
    <Sheet label="Blank screen?" onDismiss={() => back()}>
      <SheetHeader title="Blank screen?" subtitle="Check these, then try again." />
      <div className="px-4">
        <div className="mt-6">
          <Checklist items={ITEMS} variant="07h" />
        </div>
        <PrimaryButton className="mt-6" onClick={() => go("08", { replace: true })}>
          Try Again
        </PrimaryButton>
        <TextButton className="mt-1 font-semibold" style={{ color: "var(--cravv-text-accent)" }} onClick={() => back()}>
          Get Help
        </TextButton>
      </div>
    </Sheet>
  );
}
