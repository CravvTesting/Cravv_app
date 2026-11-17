"use client";

/*
 * P02 · Stove and camera (2673:6061). Type and Burners open onboarding 11 in edit mode (e11; its
 * Save runs calibration again). Recalibrate → 13, "How to attach the camera" → 12.
 * Remove Tara → action sheet → Tara not set up (P01b).
 */
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { ActionSheet, SettingsGroup, SettingsRow, STOVE_TYPES } from "@/components/cravv";
import { go } from "@/proto/nav";
import { useProto } from "@/proto/store";
import { LargeTitleScreen } from "@/proto/ui";
import { useTaraView } from "./Root";
import { GROUP_GAP, Row } from "./rows";

const STATUS = {
  online: { label: "Online", color: "var(--cravv-status-success)" },
  offline: { label: "Offline", color: "var(--cravv-status-warning)" },
  "not-set-up": { label: "Not set up", color: "var(--cravv-text-secondary)" },
} as const;

export default function P02() {
  const taraName = useProto((s) => s.tara.name);
  const wifi = useProto((s) => s.wifi);
  const stoveType = useProto((s) => s.stoveType);
  const burners = useProto((s) => s.burners);
  const status = STATUS[useTaraView()];
  const [confirm, setConfirm] = useState(false);
  const typeLabel = STOVE_TYPES.find((t) => t.id === stoveType)?.label ?? "Electric coil";

  const remove = () => {
    const s = useProto.getState();
    s.set({ setupPending: true, tara: { ...s.tara, status: "not-set-up" } });
    setConfirm(false);
    go("P01b", { dir: "pop" });
  };

  return (
    <>
      <LargeTitleScreen title="Stove and camera" back subtitle="Your Tara, your stove and the camera above it.">
        <SettingsGroup header="Tara" className="pt-[9px]">
          <Row label="Name" value={taraName} chevron onPress={() => go("placeholder")} />
          <Row label="Wi-Fi" value={wifi} chevron onPress={() => go("10")} />
          <Row label="Status" value={status.label} valueColor={status.color} />
        </SettingsGroup>

        <SettingsGroup header="Stove" className={GROUP_GAP} footer="Changing the stove or burner count asks Tara to recalibrate.">
          <Row label="Type" value={typeLabel} chevron onPress={() => go("e11")} />
          <Row label="Burners" value={String(burners)} chevron onPress={() => go("e11")} />
        </SettingsGroup>

        <SettingsGroup header="Camera" className={GROUP_GAP}>
          <Row label="Calibration" subtitle={`Sees ${burners} of ${burners} burners · matched`} />
          <Row label="Recalibrate" labelColor="var(--cravv-text-accent)" onPress={() => go("13")} />
          <Row label="How to attach the camera" chevron onPress={() => go("12")} />
        </SettingsGroup>

        <SettingsGroup className="mt-6">
          <SettingsRow type="destructive" label="Remove Tara" onPress={() => setConfirm(true)} />
        </SettingsGroup>
      </LargeTitleScreen>

      <AnimatePresence>
        {confirm && (
          <ActionSheet
            title="Remove Tara?"
            message={`Tara · ${taraName} will be disconnected from this phone. You can set it up again any time.`}
            actions={[{ label: "Remove Tara", destructive: true, onPress: remove }]}
            onCancel={() => setConfirm(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
