"use client";

import { PrimaryButton, TextButton } from "@/components/cravv";
import { back, go } from "@/proto/nav";
import { useProto } from "@/proto/store";
import { Screen, ScreenHeader } from "@/proto/ui";
import { IMG, PermissionHero, TitleBlock } from "./connect/parts";

/**
 * 07a · Allow Bluetooth (Figma 2626:4577). Pre-permission.
 * Continue → 07b (the iOS prompt). With the debug "Bluetooth: deny" setting, the permission counts as
 * already denied (iOS never re-asks), so Continue goes straight to 07c. Not Now → 06.
 */
export default function S07a() {
  const bluetooth = useProto((s) => s.debug.bluetooth);
  return (
    <Screen
      header={<ScreenHeader />}
      footer={
        <div className="flex flex-col gap-1.5">
          <PrimaryButton onClick={() => (bluetooth === "deny" ? go("07c") : go("07b"))}>Continue</PrimaryButton>
          <TextButton onClick={() => back()}>Not Now</TextButton>
        </div>
      }
    >
      <div className="pt-[82px]">
        <PermissionHero tint="var(--cravv-blue-500)" src={`${IMG}/bt-on.svg`} />
        <TitleBlock
          className="mt-8"
          title="Find Tara by Bluetooth"
          body="Your iPhone uses it to find Tara and pass on your Wi-Fi. Only during setup."
        />
      </div>
    </Screen>
  );
}
