/* eslint-disable @next/next/no-img-element */
"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Actions, PrimaryButton, Screen, TextButton, Title, TopBar } from "@/components/ui";
import { LiveView } from "@/components/stove/LiveView";
import { StickyActions } from "@/components/stove/parts";
import { useHydrated, useOnboarding } from "@/lib/store";
import { BURNER_OPTIONS, ROUTE_AFTER_CALIBRATION, burnersLabel, parseScenario, runCalibration, simulatedCount, type Scenario } from "@/lib/sim/stove";

type Phase = { kind: "running"; progress: number } | { kind: "done"; seen: number };

/** 13 · Calibrating, 13s · Calibrated, 13x · Count mismatch (fewer), 13y · Sees more than picked */
export default function CalibratePage() {
  return (
    <Suspense fallback={<Screen><TopBar step={4} total={4} /></Screen>}>
      <Calibrate />
    </Suspense>
  );
}

function Calibrate() {
  const router = useRouter();
  const params = useSearchParams();
  const hydrated = useHydrated();
  const expected = useOnboarding((s) => s.device.burners);
  const setDevice = useOnboarding((s) => s.setDevice);

  const [scenario, setScenario] = useState<Scenario>(() => parseScenario(params.get("scenario")));
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState<Phase>({ kind: "running", progress: 0 });

  // Note 13: starts on its own after Attach.
  useEffect(() => {
    if (!hydrated) return;
    setPhase({ kind: "running", progress: 0 });
    return runCalibration({
      expected,
      scenario,
      onProgress: (p) => setPhase({ kind: "running", progress: p }),
      onDone: (seen) => setPhase({ kind: "done", seen }),
    });
  }, [hydrated, expected, scenario, run]);

  const retry = useCallback(() => {
    // Simulated device: a retry always succeeds.
    setScenario("match");
    setRun((r) => r + 1);
  }, []);

  if (!hydrated) {
    return (
      <Screen>
        <TopBar step={4} total={4} />
      </Screen>
    );
  }

  if (phase.kind === "running") {
    const target = simulatedCount(expected, scenario);
    const count = Math.max(1, Math.round(phase.progress * target));
    return (
      <Screen>
        <TopBar step={4} total={4} />
        <Title className="mt-1">Calibrating</Title>
        <p className="mt-[5px] min-h-10 text-[15px] leading-[20px] text-label-2">
          Tara is counting your burners. Keep the stove clear for a moment.
        </p>
        <div className="mt-2.5">
          <LiveView tone="accent" status={`Tara sees ${burnersLabel(count)}…`} />
        </div>
        <div className="mt-4 h-[72px] rounded-[20px] bg-surface px-4 pt-[13px]">
          <p className="text-[17px] leading-[20px] text-white">Looking for {burnersLabel(expected)}</p>
          <div
            className="mt-[13px] h-1.5 overflow-hidden rounded-[3px] bg-white/[0.12]"
            role="progressbar"
            aria-label="Calibration progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(phase.progress * 100)}
          >
            <div className="h-full rounded-[3px] bg-accent" style={{ width: `${phase.progress * 100}%` }} />
          </div>
        </div>
        <p className="mt-2.5 px-4 text-[13px] leading-[18px] text-label-2">You only see this live view during setup. It isn’t saved.</p>
        <StickyActions>
          <Actions>
            <TextButton onClick={() => router.back()}>Cancel</TextButton>
            </Actions>
        </StickyActions>
      </Screen>
    );
  }

  const { seen } = phase;

  if (seen === expected) {
    return (
      <Screen>
        <TopBar step={4} total={4} />
        <Title className="mt-1">Tara sees all {burnersLabel(seen)}</Title>
        <p className="mt-[5px] min-h-10 text-[15px] leading-[20px] text-label-2">That matches your stove. Calibration is done.</p>
        <div className="mt-2.5">
          <LiveView tone="success" status={`Tara sees ${burnersLabel(seen)}`} />
        </div>
        <div className="mt-4 flex h-[60px] items-center gap-3 rounded-[20px] bg-surface px-4">
          <img src="/img/stove/check-success.svg" alt="" width={28} height={28} />
          <p className="flex-1 text-[17px] font-semibold text-white">
            {seen} of {burnersLabel(expected)}
          </p>
          <p className="text-[17px] text-success">Matched</p>
        </div>
        <StickyActions>
          <Actions>
            <PrimaryButton
              onClick={() => {
                setDevice({ calibrated: true });
                router.push(ROUTE_AFTER_CALIBRATION);
              }}
            >
              Continue
            </PrimaryButton>
            </Actions>
        </StickyActions>
      </Screen>
    );
  }

  // Mismatch (13x sees fewer / 13y sees more): same pattern, only the two numbers.
  const changeCount = () => {
    // Note 13y: when Tara sees more, open 11 with her count already selected (the user most likely miscounted).
    if (seen > expected && (BURNER_OPTIONS as readonly number[]).includes(seen)) {
      setDevice({ burners: seen, calibrated: false });
    }
    router.push("/setup/stove");
  };

  return (
    <Screen>
      <TopBar step={4} total={4} />
      <Title className="mt-1">Tara sees {burnersLabel(seen)}</Title>
      <p className="mt-[5px] text-[15px] leading-[18px] text-label-2">You picked {expected}.</p>
      <div className="mt-[22px]">
        <LiveView tone="warning" status={`Tara sees ${burnersLabel(seen)}`} />
      </div>
      <div className="mt-4 overflow-hidden rounded-[20px] bg-surface">
        <div className="flex h-[52px] items-center justify-between px-4 text-[17px]">
          <span className="text-white">Tara sees</span>
          <span className="font-semibold text-warning">{seen}</span>
        </div>
        <div className="ml-4 h-px bg-[rgba(84,84,88,0.6)]" />
        <div className="flex h-[51px] items-center justify-between px-4 text-[17px]">
          <span className="text-white">You picked</span>
          <span className="font-semibold text-white">{expected}</span>
        </div>
      </div>
      <p className="mt-2.5 px-4 text-[13px] font-semibold leading-[18px] text-warning">Retry calibration, or change the number of burners.</p>
      <StickyActions>
        <Actions>
          <PrimaryButton onClick={retry}>Retry</PrimaryButton>
          <TextButton onClick={changeCount}>Change Burner Count</TextButton>
          </Actions>
      </StickyActions>
    </Screen>
  );
}
