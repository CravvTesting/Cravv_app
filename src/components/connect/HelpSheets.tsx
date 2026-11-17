"use client";

/* eslint-disable @next/next/no-img-element */
import { PrimaryButton, TextButton } from "@/components/ui";
import { Checklist, Sheet } from "./Sheet";

type SheetProps = { open: boolean; onClose: () => void };

/** 07 · "Nothing on the Screen?" — power troubleshooting. */
export function PowerHelpSheet({ open, onClose }: SheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title="Nothing on the screen?" subtitle="Try these, one at a time.">
      <Checklist
        className="mt-[23px]"
        items={[
          { icon: "/img/connect/icon-display.svg", title: "Cable pushed all the way in", detail: "Check both ends, at Tara and the plug" },
          { title: "Try another outlet", detail: "Some outlets are switched at the wall" },
          { title: "Unplug for 10 seconds", detail: "Then plug in and wait for “Hello”" },
        ]}
      />
      <div className="mt-5 flex flex-col gap-1.5 px-2">
        <PrimaryButton onClick={onClose}>Got It</PrimaryButton>
      </div>
    </Sheet>
  );
}

/** 08 / 08x · "Get Help". */
export function GetHelpSheet({ open, onClose }: SheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title="Get help" subtitle="Still stuck? These fix most setups.">
      <Checklist
        className="mt-[23px]"
        items={[
          { icon: "/img/connect/icon-display.svg", title: "Restart Tara", detail: "Unplug for 10 seconds, then plug it in" },
          { icon: "/img/connect/icon-bt.svg", title: "Turn Bluetooth off and on", detail: "In Settings on this iPhone" },
          { icon: "/img/connect/icon-phone-sheet.svg", title: "Stand next to the display", detail: "Then tap Try Again" },
        ]}
      />
      <div className="mt-5 flex flex-col gap-1.5 px-2">
        <PrimaryButton onClick={onClose}>Done</PrimaryButton>
      </div>
    </Sheet>
  );
}

/** 07 · "Setup video · 1 min" — placeholder until the video exists. */
export function SetupVideoSheet({ open, onClose }: SheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title="Setup video" subtitle="Coming soon. The steps on screen are all you need.">
      <div className="mt-[23px] flex aspect-video items-center justify-center rounded-[20px] bg-elevated">
        <img src="/img/icon-play.svg" alt="" width={44} height={44} className="opacity-40" />
      </div>
      <div className="mt-5 flex flex-col gap-1.5 px-2">
        <PrimaryButton onClick={onClose}>Close</PrimaryButton>
      </div>
    </Sheet>
  );
}

/** 10 · "Other Network…" — type a hidden network's name. */
export function OtherNetworkSheet({ open, onClose, onChoose }: SheetProps & { onChoose: (ssid: string) => void }) {
  return (
    <Sheet open={open} onClose={onClose} title="Other network" subtitle="Type the network’s name exactly.">
      <form
        className="mt-[23px] flex flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          const ssid = String(new FormData(e.currentTarget).get("ssid") ?? "").trim();
          if (ssid) onChoose(ssid);
        }}
      >
        <input
          name="ssid"
          autoFocus
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Network name"
          aria-label="Network name"
          className="h-[52px] rounded-[26px] bg-elevated px-4 text-[17px] text-white placeholder:text-label-3"
        />
        <div className="mt-5 flex flex-col gap-1.5 px-2">
          <PrimaryButton type="submit">Choose Network</PrimaryButton>
          <TextButton onClick={onClose}>Cancel</TextButton>
        </div>
      </form>
    </Sheet>
  );
}
