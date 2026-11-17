"use client";

/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";
import { Actions, PrimaryButton, Screen, TextButton, TopBar } from "@/components/ui";
import { Glyph26, IMG, PSectionTitle, ScrollBody } from "@/components/personalise";
import { useOnboarding } from "@/lib/store";

const NEEDS = [
  { title: "Power", desc: "Outlet nearby", icon: "icon-plug" },
  { title: "Range hood", desc: "Metal underside", icon: "icon-hood" },
  { title: "Wi-Fi", desc: "Password handy", icon: "icon-wifi" },
];

/** 06 · Is Tara with you? */
export default function SetupIntroPage() {
  const router = useRouter();
  const set = useOnboarding((s) => s.set);

  const explore = () => {
    set({ skippedDevice: true, onboarded: true });
    router.push("/home");
  };

  return (
    <Screen className="h-dvh">
      <div className="absolute inset-x-5 top-0 z-10">
        <TopBar />
      </div>
      <ScrollBody>
        {/* Side view of Tara. In Figma the drawing is mirrored horizontally. */}
        <div className="-mx-5 flex shrink-0 justify-center overflow-hidden pt-[calc(max(env(safe-area-inset-top),12px)+14px)]">
          <img
            alt="Tara, side view"
            width={414}
            height={306}
            src={`${IMG}/tara-side-view.svg`}
            className="block h-[min(306px,36dvh)] w-auto max-w-none"
            style={{ transform: "scaleX(-1)" }}
          />
        </div>

        <h1 className="mt-[26px] text-center text-[34px] font-bold leading-[41px] tracking-[0.4px] text-white">Is Tara with you?</h1>
        <p className="mx-auto mt-[7px] max-w-[300px] text-center text-[17px] leading-[22px] tracking-[-0.43px] text-label-2">
          Setup takes about 3 minutes, standing at your stove.
        </p>

        <PSectionTitle className="mt-5">You&apos;ll need</PSectionTitle>
        <div className="grid shrink-0 grid-cols-3 gap-[7px]">
          {NEEDS.map((n) => (
            <div key={n.title} className="flex h-[120px] flex-col rounded-[20px] bg-surface px-3 pt-[17px]">
              <Glyph26 src={`${IMG}/${n.icon}.svg`} />
              <span className="mt-[19px] whitespace-nowrap text-[15px] font-semibold leading-[18px] text-white">{n.title}</span>
              <span className="mt-1 whitespace-nowrap text-[12px] leading-[14px] text-label-2">{n.desc}</span>
            </div>
          ))}
        </div>
      </ScrollBody>
      <Actions>
        <PrimaryButton href="/setup/plug-in">Set Up Tara</PrimaryButton>
        <TextButton onClick={explore}>Not Yet, Explore Recipes</TextButton>
      </Actions>
    </Screen>
  );
}
