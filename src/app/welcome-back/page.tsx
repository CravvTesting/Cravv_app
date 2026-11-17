"use client";

import { useRouter } from "next/navigation";
import { Card, Footnote, PrimaryButton, Screen, TextButton } from "@/components/ui";
import { useHydrated, useOnboarding, type StoveType } from "@/lib/store";

/*
 * 02c · Welcome back (4:1322).
 * Returning user with a linked Tara goes straight home. No Tara linked: jumps to 06.
 */
const STOVE_LABEL: Record<StoveType, string> = {
  gas: "Gas",
  induction: "Induction",
  "electric-coil": "Electric coil",
  infrared: "Infrared",
};

function Row({ icon, label, value, last, dot }: { icon: string; label: string; value: string; last?: boolean; dot?: boolean }) {
  return (
    <div className="flex h-[52px] items-center pl-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={icon} alt="" width={22} height={22} className="shrink-0" />
      <div className={`ml-[14px] flex h-full flex-1 items-center justify-between pr-4 ${last ? "" : "border-b border-[rgba(84,84,88,0.6)]"}`}>
        <span className="text-[17px]">{label}</span>
        <span className="flex items-center gap-1.5 text-[17px] text-label-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {dot && <img src="/img/dot-online.svg" alt="" width={8} height={8} />}
          {value}
        </span>
      </div>
    </div>
  );
}

export default function WelcomeBack() {
  const router = useRouter();
  const hydrated = useHydrated();
  const s = useOnboarding();
  if (!hydrated) return <Screen>{null}</Screen>;

  const linked = s.device.paired;
  const name = s.name || s.account?.name || "there";

  function goHome() {
    if (linked) {
      s.set({ onboarded: true });
      router.replace("/home");
    } else {
      router.push("/setup");
    }
  }

  return (
    <Screen>
      <div className="flex flex-col items-center pt-[calc(max(env(safe-area-inset-top),0px)+56px)] text-center">
        <div className="relative flex h-[76px] w-[76px] items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/avatar.svg" alt="" width={76} height={76} className="absolute inset-0" />
          <span className="relative text-[32px] font-semibold">{name.charAt(0).toUpperCase()}</span>
        </div>
        <h1 className="mt-[22px] text-[34px] font-bold leading-[41px] tracking-[0.4px]">Welcome back, {name}</h1>
        <p className="mt-[5px] text-[17px] text-label-2">Everything is where you left it.</p>
      </div>

      <Card className="mt-[34px] overflow-hidden">
        <Row icon="/img/icon-display.svg" label="Tara" value={linked ? "Kitchen · Online" : "Not linked"} dot={linked} />
        <Row icon="/img/icon-stove.svg" label="Stove" value={STOVE_LABEL[s.device.stoveType]} />
        <Row icon="/img/icon-sliders.svg" label="Diet" value={s.diet} />
        <Row icon="/img/icon-bookmark.svg" label="Saved recipes" value={String(s.savedRecipes)} last />
      </Card>
      <Footnote className="mt-2">Signing in on a new phone changes nothing on Tara. Your stove and burners stay set up.</Footnote>

      <div className="mt-auto flex flex-col gap-1.5 pt-8">
        <PrimaryButton onClick={goHome}>Go to Home</PrimaryButton>
        <TextButton onClick={() => router.push("/setup")}>Set Up Another Tara</TextButton>
      </div>
    </Screen>
  );
}
