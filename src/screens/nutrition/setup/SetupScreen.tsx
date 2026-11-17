"use client";

import type { ReactNode } from "react";
import { PrimaryButton } from "@/components/cravv";
import { Screen, ScreenHeader } from "@/proto/ui";

/**
 * Frame for N02–N05: glass back button + 3-step bar (as in the frames), 34pt title and a
 * 15pt subtitle, content, pinned white button. Mirrors the onboarding step screens.
 */
export function SetupScreen({
  step,
  title,
  subtitle,
  button,
  onButton,
  children,
}: {
  /** 1–3 shows the step bar; omit for N05. */
  step?: 1 | 2 | 3;
  title: string;
  subtitle?: ReactNode;
  button: string;
  onButton: () => void;
  children: ReactNode;
}) {
  return (
    <Screen
      header={<ScreenHeader steps={step ? 3 : undefined} current={step} />}
      footer={<PrimaryButton onClick={onButton}>{button}</PrimaryButton>}
      contentClassName="pb-6"
    >
      <h1 className="mt-[5px] text-[34px] font-bold leading-[41px] tracking-[0.4px] text-white">{title}</h1>
      {subtitle && <div className="mt-[5px] text-[15px] leading-5 text-secondary">{subtitle}</div>}
      {children}
    </Screen>
  );
}
