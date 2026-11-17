"use client";

import { PrimaryButton, SheetHeader, TextButton } from "@/components/cravv";
import { go } from "@/proto/nav";
import { Sheet } from "@/proto/ui";

const toPlugIn = () => go("07", { dir: "pop" });

/**
 * 09x · Already set up, sheet over 08 (Figma 2626:4870).
 * How to Reset Tara closes the sheet (→ 07, since the search is over). Set Up a Different Tara → 07.
 */
export default function S09x() {
  return (
    <Sheet label="Already set up" onDismiss={toPlugIn}>
      <SheetHeader title="Already set up" />
      {/* Own subtitle: the frame wraps it at 338px (SheetHeader caps subtitles at 300). -14px undoes the header's bottom padding. */}
      <p className="mx-auto -mt-[14px] w-[calc(100%-48px)] max-w-[338px] text-center text-[15px] leading-[18px] text-secondary">
        This Tara is on another account. Ask its owner to remove it in their Cravv app, or reset Tara to start fresh.
      </p>
      <div className="px-6">
        <PrimaryButton className="mt-8" onClick={toPlugIn}>
          How to Reset Tara
        </PrimaryButton>
        <TextButton className="mt-1.5 font-semibold" style={{ color: "var(--cravv-text-accent)" }} onClick={toPlugIn}>
          Set Up a Different Tara
        </TextButton>
      </div>
    </Sheet>
  );
}
