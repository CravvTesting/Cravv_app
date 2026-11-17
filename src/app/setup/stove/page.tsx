/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter } from "next/navigation";
import { Actions, PrimaryButton, Screen, Title, TopBar, cx } from "@/components/ui";
import { StovePlan } from "@/components/stove/StovePlan";
import { Checkmark, ListHeader, Segmented, StatusPill, StickyActions } from "@/components/stove/parts";
import { useHydrated, useOnboarding } from "@/lib/store";
import { BURNER_OPTIONS, STOVE_TYPES, burnersLabel, stoveLabel } from "@/lib/sim/stove";

/** 11 · Your stove */
export default function YourStove() {
  const router = useRouter();
  const hydrated = useHydrated();
  const device = useOnboarding((s) => s.device);
  const setDevice = useOnboarding((s) => s.setDevice);

  return (
    <Screen>
      <TopBar step={3} total={4} />
      <Title className="mt-1">Your Stove</Title>

      {hydrated && (
        <div className="animate-fade-up flex flex-col">
          <StatusPill className="mt-[7px]">Tara is online{device.wifi ? ` · ${device.wifi}` : ""}</StatusPill>

          <div className="mt-3.5 flex h-[150px] items-center gap-5 rounded-[20px] border border-white/[0.06] bg-[#1a1a1d] pl-[10px]" aria-live="polite">
            <StovePlan type={device.stoveType} burners={device.burners} />
            <div className="min-w-0 pb-1">
              <p className="text-[24px] font-semibold leading-[29px] text-white">{stoveLabel(device.stoveType)}</p>
              <p className="mt-[5px] text-[17px] leading-[20px] text-label-2">{burnersLabel(device.burners)}</p>
            </div>
          </div>

          <ListHeader className="mt-[15px]">Stove type</ListHeader>
          <div role="radiogroup" aria-label="Stove type" className="overflow-hidden rounded-card bg-surface">
            {STOVE_TYPES.map((t, i) => {
              const on = device.stoveType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setDevice({ stoveType: t.id, calibrated: false })}
                  className="relative flex h-12 w-full items-center gap-3 px-4 text-left transition-colors active:bg-white/5"
                >
                  <img src={on ? t.iconActive : t.icon} alt="" width={22} height={22} className="shrink-0" />
                  <span className="flex-1 text-[17px] leading-[22px] tracking-[-0.43px] text-white">{t.label}</span>
                  {on && <Checkmark />}
                  {i < STOVE_TYPES.length - 1 && <span className="absolute bottom-0 left-4 right-0 h-[0.5px] bg-[rgba(84,84,88,0.6)]" />}
                </button>
              );
            })}
          </div>

          <ListHeader className="mt-[9px]">Burners</ListHeader>
          <div className={cx("rounded-card bg-surface px-3 py-2.5")}>
            <Segmented
              label="Number of burners"
              options={BURNER_OPTIONS}
              value={device.burners as (typeof BURNER_OPTIONS)[number]}
              onChange={(n) => setDevice({ burners: n, calibrated: false })}
            />
          </div>
        </div>
      )}

      <StickyActions>
        <Actions>
          <PrimaryButton onClick={() => router.push("/setup/camera")}>Continue</PrimaryButton>
        </Actions>
      </StickyActions>
    </Screen>
  );
}
