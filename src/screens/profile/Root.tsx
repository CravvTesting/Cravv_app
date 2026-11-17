"use client";

/*
 * P01 · Profile (2670:5951) and its Tara states: P01b not set up (2671:5966), P01c offline (2671:6159).
 * One component: the state comes from the store (setupPending / tara.status); a deep link to
 * P01b or P01c forces that state. Rows open P02–P04, onboarding 04/05 in edit mode (e04/e05),
 * R08, placeholders for Notifications and Help, and P05 (sign out).
 */
import { AccountCard, ALLERGIES, DIETS, formatNumber, SettingsGroup, SettingsRow, SKILLS, STOVE_TYPES, TaraCard } from "@/components/cravv";
import { go } from "@/proto/nav";
import { useProto } from "@/proto/store";
import { LargeTitleScreen } from "@/proto/ui";
import type { ScreenProps } from "../registry";
import { GROUP_GAP } from "./rows";

export type TaraView = "online" | "offline" | "not-set-up";

/** Tara's state as Profile shows it. */
export function useTaraView(): TaraView {
  const setupPending = useProto((s) => s.setupPending);
  const status = useProto((s) => s.tara.status);
  return setupPending || status === "not-set-up" ? "not-set-up" : status;
}

/** "Priya Shah" for the persona; any other name as typed on 03. */
export function displayName(name: string) {
  const n = name.trim() || "Priya";
  return n === "Priya" ? "Priya Shah" : n;
}

export default function ProfileRoot({ id }: ScreenProps) {
  const name = useProto((s) => s.name);
  const taraName = useProto((s) => s.tara.name);
  const wifi = useProto((s) => s.wifi);
  const stoveType = useProto((s) => s.stoveType);
  const burners = useProto((s) => s.burners);
  const diet = useProto((s) => s.diet);
  const allergies = useProto((s) => s.allergies);
  const cookingFor = useProto((s) => s.cookingFor);
  const units = useProto((s) => s.units);
  const skill = useProto((s) => s.skill);
  const kcal = useProto((s) => s.targets.kcal);
  const stored = useTaraView();
  const view: TaraView = id === "P01b" ? "not-set-up" : id === "P01c" ? "offline" : stored;

  const stoveLabel = STOVE_TYPES.find((t) => t.id === stoveType)?.label ?? "Electric coil";
  const dietLabel = diet.length ? diet.map((d) => DIETS.find((o) => o.id === d)?.label ?? d).join(", ") : "Everything";
  const allergyLabel = allergies.length
    ? `avoids ${allergies.map((a) => (ALLERGIES.find((o) => o.id === a)?.label ?? a).toLowerCase()).join(", ")}`
    : "no allergies";
  const skillLabel = SKILLS.find((s) => s.id === skill)?.label ?? "Comfortable";

  return (
    <LargeTitleScreen title="Profile" tabRoot>
      <AccountCard className="-mt-1.5" name={displayName(name)} onPress={() => go("placeholder")} />

      <SettingsGroup header="Tara" className={GROUP_GAP}>
        <TaraCard
          state={view}
          name={view === "not-set-up" ? undefined : `Tara · ${taraName}`}
          lastSeen="6:40 PM"
          onPress={() => go("P02")}
          onSetUp={() => go("07a")}
        />
        {view !== "not-set-up" && (
          <>
            {view === "offline" ? (
              <SettingsRow type="two-line" icon="display" label="Reconnect Wi-Fi" subtitle={`Tara is looking for ${wifi}`} onPress={() => go("10")} />
            ) : (
              <SettingsRow
                type="two-line"
                icon="display"
                label="Stove and camera"
                subtitle={`${stoveLabel} · ${burners} burner${burners === 1 ? "" : "s"} · calibrated`}
                onPress={() => go("P02")}
              />
            )}
            <SettingsRow type="two-line" icon="shield" label="Safety and alerts" subtitle="Tara first, then your phone" onPress={() => go("P03")} />
            <SettingsRow type="two-line" icon="eye" label="Camera and privacy" subtitle="What Tara sees and what it keeps" onPress={() => go("P04")} />
          </>
        )}
      </SettingsGroup>

      <SettingsGroup header="You" className={GROUP_GAP}>
        <SettingsRow type="two-line" icon="sliders" label="Food preferences" subtitle={`${dietLabel} · ${allergyLabel}`} onPress={() => go("e04")} />
        <SettingsRow
          type="two-line"
          icon="chef"
          label="How you cook"
          subtitle={`Cooking for ${cookingFor} · ${units === "us" ? "US" : "Metric"} units · ${skillLabel}`}
          onPress={() => go("e05")}
        />
        <SettingsRow type="two-line" icon="target" label="Nutrition targets" subtitle={`${formatNumber(kcal)} kcal a day · US guidelines`} onPress={() => go("R08")} />
      </SettingsGroup>

      <SettingsGroup header="App" className={GROUP_GAP}>
        <SettingsRow icon="bell" label="Notifications" onPress={() => go("placeholder")} />
        <SettingsRow icon="help" label="Help and feedback" onPress={() => go("placeholder")} />
      </SettingsGroup>

      <SettingsGroup className="mt-3">
        <SettingsRow type="destructive" label="Sign Out" onPress={() => go("P05")} />
      </SettingsGroup>
    </LargeTitleScreen>
  );
}
