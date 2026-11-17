"use client";

/* eslint-disable @next/next/no-img-element */
import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Actions, PrimaryButton, Screen, TextButton, TopBar } from "@/components/ui";
import { SearchIllustration } from "@/components/connect/parts";
import { Checklist, Sheet } from "@/components/connect/Sheet";
import { GetHelpSheet } from "@/components/connect/HelpSheets";
import { scenarioFrom, startSearch, type SearchScenario } from "@/lib/sim/connect";

type Phase = "searching" | "found" | "notfound";

const TILES = [
  { icon: "/img/connect/icon-phone.svg", title: "Stay close", detail: "Within 10 feet of the display" },
  { icon: "/img/connect/icon-bt.svg", title: "Bluetooth", detail: "Only used during setup" },
];

/** 08 · Looking for Tara, with the 08x "Can't find Tara" sheet. */
function Search() {
  const router = useRouter();
  const params = useSearchParams();
  // ?scenario=notfound shows the 08x failure state (review aid). Try Again always succeeds.
  const [scenario, setScenario] = useState<SearchScenario>(() => scenarioFrom(params.get("scenario")));
  const [phase, setPhase] = useState<Phase>("searching");
  const [attempt, setAttempt] = useState(0);
  const [help, setHelp] = useState(false);

  useEffect(() => {
    setPhase("searching");
    let go: ReturnType<typeof setTimeout> | undefined;
    const cancel = startSearch(scenario, {
      onFound: () => {
        setPhase("found");
        go = setTimeout(() => router.replace("/setup/pair"), 450);
      },
      onTimeout: () => setPhase("notfound"),
    });
    return () => {
      cancel();
      clearTimeout(go);
    };
  }, [scenario, attempt, router]);

  const tryAgain = useCallback(() => {
    setScenario("found");
    setAttempt((a) => a + 1);
  }, []);

  return (
    <Screen>
      <TopBar step={1} total={4} />

      <div className="relative">
        <p className="absolute -top-0.5 right-1 text-[9px] font-medium uppercase tracking-[0.54px] text-white/45" aria-live="polite">
          Bluetooth · {phase === "found" ? "Found" : "Searching"}
        </p>
        <div className="pt-[3px]">
          <SearchIllustration searching={phase === "searching"} />
        </div>
      </div>

      <h1 className="mt-[21px] text-center text-[34px] font-bold leading-[41px] tracking-[0.4px] text-white">Looking for Tara</h1>
      <p className="mx-auto mt-[7px] max-w-[300px] text-center text-[17px] leading-[22px] text-label-2">
        Keep your phone close to the display. This takes a few seconds.
      </p>

      <div className="mt-[26px] grid grid-cols-2 gap-3">
        {TILES.map((t) => (
          <div key={t.title} className="h-[112px] rounded-[20px] bg-surface p-3">
            <img src={t.icon} alt="" width={22} height={22} />
            <p className="mt-[22px] text-[15px] font-semibold leading-[18px] text-white">{t.title}</p>
            <p className="mt-1 text-[12px] leading-[15px] text-label-2">{t.detail}</p>
          </div>
        ))}
      </div>

      <Actions>
        <TextButton onClick={() => router.back()}>Cancel</TextButton>
      </Actions>

      <Sheet open={phase === "notfound" && !help} title="Can’t find Tara" subtitle="Check these, then try again.">
        <Checklist
          className="mt-[23px]"
          items={[
            { icon: "/img/connect/icon-display.svg", title: "Tara says Hello", detail: "If not, unplug it for 10 seconds" },
            { icon: "/img/connect/icon-bt.svg", title: "Bluetooth is on", detail: "Check in Settings on this iPhone" },
            { icon: "/img/connect/icon-phone-sheet.svg", title: "Phone within 10 feet", detail: "Walls can block the signal" },
          ]}
        />
        <div className="mt-5 flex flex-col gap-1.5 px-2">
          <PrimaryButton onClick={tryAgain}>Try Again</PrimaryButton>
          <TextButton className="font-semibold !text-accent" onClick={() => setHelp(true)}>
            Get Help
          </TextButton>
        </div>
      </Sheet>
      <GetHelpSheet open={help} onClose={() => setHelp(false)} />
    </Screen>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <Search />
    </Suspense>
  );
}
