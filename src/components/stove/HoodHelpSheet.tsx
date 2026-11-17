"use client";

import { PrimaryButton } from "@/components/ui";
import { Sheet } from "./parts";

const STEPS = [
  { n: "01", title: "Clean the spot", body: "Wipe the underside of the hood over the middle of the burners. Let it dry." },
  { n: "02", title: "Stick on the plate", body: "Peel the adhesive plate from the box and press it firmly for 30 seconds." },
  { n: "03", title: "Attach the camera", body: "The magnet holds the camera to the plate, magnet side up." },
];

/**
 * Note 12: "My Hood Isn't Metal" leads to adhesive-plate steps (still to design).
 * Placeholder sheet until that design exists.
 */
export function HoodHelpSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} label="Use the adhesive plate">
      <h2 className="text-[22px] font-bold leading-[28px] tracking-[-0.26px] text-white">Use the Adhesive Plate</h2>
      <p className="mt-1.5 text-[15px] leading-[20px] text-label-2">
        If the magnet won&apos;t hold, stick the metal plate from the box under your hood first.
      </p>
      <ol className="mt-5 flex flex-col gap-4">
        {STEPS.map((s) => (
          <li key={s.n} className="flex gap-3">
            <span className="w-6 shrink-0 pt-px text-[13px] font-semibold text-accent">{s.n}</span>
            <div>
              <p className="text-[17px] font-semibold leading-[22px] tracking-[-0.43px] text-white">{s.title}</p>
              <p className="mt-0.5 text-[15px] leading-[20px] text-label-2">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <PrimaryButton className="mt-7" onClick={onClose}>Got It</PrimaryButton>
    </Sheet>
  );
}
