"use client";

import { PrimaryButton, Screen, TextButton } from "@/components/ui";
import { useOnboarding } from "@/lib/store";
import { useRouter } from "next/navigation";

/** Placeholder until the Home design is built. */
export default function Home() {
  const name = useOnboarding((s) => s.name);
  const reset = useOnboarding((s) => s.reset);
  const router = useRouter();
  return (
    <Screen className="justify-center text-center">
      <h1 className="text-[34px] font-bold">Home</h1>
      <p className="mt-2 text-label-2">Hi {name || "there"}. The home screen comes next.</p>
      <div className="mt-10 flex flex-col gap-2">
        <PrimaryButton href="/setup">Set up Tara</PrimaryButton>
        <TextButton onClick={() => { reset(); router.replace("/welcome"); }}>Restart onboarding</TextButton>
      </div>
    </Screen>
  );
}
