"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton, Screen } from "@/components/ui";
import { CloseButton, TaraDrawing } from "@/components/connect/parts";
import { useHydrated, useOnboarding } from "@/lib/store";
import { pairDevice } from "@/lib/sim/connect";

/** 09 · Pair Tara — found-device card over the kitchen photo. */
export default function Pair() {
  const router = useRouter();
  const hydrated = useHydrated();
  const code = useOnboarding((s) => s.device.code);
  const setDevice = useOnboarding((s) => s.setDevice);
  const [busy, setBusy] = useState(false);

  async function connect() {
    setBusy(true);
    await pairDevice(code);
    setDevice({ paired: true });
    router.push("/setup/wifi");
  }

  return (
    <Screen padded={false} className="!pb-0">
      {/* Kitchen photo: 600 tall in the design, card overlaps its lower 164px. */}
      <div className="absolute inset-x-0 top-0 h-[max(320px,calc(100dvh-274px))] overflow-hidden" aria-hidden>
        <img src="/img/connect/kitchen-base.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <img src="/img/connect/kitchen.png" alt="" className="absolute left-[-5.69%] top-[0.06%] h-[93.2%] w-[111.28%] max-w-none object-cover" />
        <div className="absolute inset-x-0 top-0 h-[120px] bg-gradient-to-b from-black/55 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-[rgba(28,28,31,0)] to-[#121214] to-[93.833%]" />
      </div>
      <div className="absolute inset-0 bg-black/30" aria-hidden />

      <section
        aria-label="Tara found"
        className="animate-sheet-up relative mx-2 mb-2 mt-auto rounded-sheet bg-[#26262a] px-5 pb-[22px] pt-10 text-center"
      >
        <CloseButton onClick={() => router.replace("/setup/search")} className="absolute right-4 top-[18px]" />
        <TaraDrawing className="mx-auto" />
        <p className="mt-2 whitespace-pre text-[10px] font-semibold uppercase leading-[14px] tracking-[0.4px] text-accent">
          {"Found nearby  ·  2 parts"}
        </p>
        <h1 className="mt-1.5 text-[28px] font-bold leading-[34px] tracking-[0.38px] text-white">Tara</h1>
        <p className="mt-1 text-[15px] leading-[20px] tracking-[-0.23px] text-label-2">Kitchen display and camera module</p>
        <p className="mx-auto mt-[18px] max-w-[290px] text-[13px] leading-[18px] tracking-[-0.08px] text-label-2">
          Tara’s screen shows{" "}
          <span className="font-semibold text-accent">{hydrated ? code : "   "}</span>. Check it matches, then connect.
        </p>
        <PrimaryButton className="mt-[26px]" onClick={connect} loading={busy} disabled={!hydrated}>
          Connect
        </PrimaryButton>
      </section>
    </Screen>
  );
}
