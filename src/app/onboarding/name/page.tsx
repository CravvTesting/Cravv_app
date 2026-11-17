"use client";

/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";
import { PrimaryButton, Screen, Subtitle, Title, TopBar, Actions, Footnote } from "@/components/ui";
import { IMG, ScrollBody } from "@/components/personalise";
import { VoiceCard } from "@/components/personalise/VoiceCard";
import { useHydrated, useOnboarding } from "@/lib/store";

/** 03 · Name */
export default function NamePage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const name = useOnboarding((s) => s.name);
  const pronunciation = useOnboarding((s) => s.pronunciation);
  const account = useOnboarding((s) => s.account);
  const set = useOnboarding((s) => s.set);

  const value = hydrated ? name : "";
  const fromApple = hydrated && account?.provider === "apple" && name.trim() !== "" && name === account.name;

  return (
    <Screen className="h-dvh">
      <TopBar step={1} />
      <ScrollBody>
        <Title className="mt-1">What should Tara call you?</Title>
        <Subtitle>She says it out loud while you cook.</Subtitle>

        <label className="mt-6 flex h-[56px] shrink-0 items-center gap-3 rounded-card bg-surface pl-4 pr-4">
          <img alt="" width={22} height={22} className="block size-[22px] shrink-0" src={`${IMG}/icon-user.svg`} />
          <input
            value={value}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="Your name"
            autoComplete="given-name"
            enterKeyHint="next"
            aria-label="Your name"
            onKeyDown={(e) => e.key === "Enter" && value.trim() && router.push("/onboarding/kitchen")}
            className="min-w-0 flex-1 bg-transparent text-[17px] text-white caret-accent outline-none placeholder:text-label-3"
            style={{ caretColor: "var(--color-accent)" }}
          />
          {fromApple && <span className="shrink-0 text-[13px] text-label-2">From Apple ID</span>}
        </label>

        <div className="mt-4 shrink-0">
          {hydrated && (
            <VoiceCard name={name} pronunciation={pronunciation} onPronunciationChange={(v) => set({ pronunciation: v })} />
          )}
          {!hydrated && <div className="h-[164px] rounded-card bg-surface" />}
        </div>

        <Footnote className="mt-2">Change your name or how Tara says it anytime in Settings.</Footnote>
      </ScrollBody>
      <Actions>
        <PrimaryButton disabled={!value.trim()} onClick={() => router.push("/onboarding/kitchen")}>
          Continue
        </PrimaryButton>
      </Actions>
    </Screen>
  );
}
