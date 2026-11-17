"use client";

/* eslint-disable @next/next/no-img-element */
/*
 * Profile tab (Figma 2568:4456). Account row, then You / Tara / App groups with values from the
 * prototype store. Rows press but don't navigate. "Reset prototype" at the bottom clears the
 * store and restarts onboarding.
 */
import { DIETS, SKILLS, TextButton } from "@/components/cravv";
import { go } from "@/proto/nav";
import { useProto } from "@/proto/store";
import { Chevron, Group, IMG, Row, Section, SettingRow, TabScreen } from "./tabs/ui";

/** Sign in with Apple returns the full name; the store keeps the first name. */
const fullName = (name: string) => (name.trim() === "Priya" ? "Priya Shah" : name.trim() || "Priya Shah");

function dietLabel(diet: string[]) {
  const labels = diet.map((id) => DIETS.find((d) => d.id === id)?.label ?? id);
  if (labels.length === 0) return "Everything";
  return labels.length === 1 ? labels[0] : `${labels[0]} +${labels.length - 1}`;
}

export default function Profile() {
  const name = useProto((s) => s.name);
  const diet = useProto((s) => s.diet);
  const skill = useProto((s) => s.skill);
  const alerts = useProto((s) => s.alerts);
  const setupPending = useProto((s) => s.setupPending);
  const reset = useProto((s) => s.reset);

  const display = fullName(name);
  const skillLabel = SKILLS.find((k) => k.id === skill)?.label ?? skill;

  return (
    <TabScreen title="Profile">
      <Group className="mt-[11px]">
        <Row height={76} sepInset={0} className="pl-3 pr-[14px]" label={`${display}, signed in with Apple`}>
          <span className="relative flex size-[52px] shrink-0 items-center justify-center">
            <img src={`${IMG}/avatar.svg`} alt="" width={52} height={52} className="absolute inset-0" aria-hidden />
            <span className="relative text-[22px] font-semibold leading-[26px] text-white">{display.charAt(0).toUpperCase()}</span>
          </span>
          <span className="ml-[14px] flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[17px] font-semibold leading-[20px] tracking-[-0.43px] text-white">{display}</span>
            <span className="mt-[4px] truncate text-[13px] leading-[16px] text-secondary">Signed in with Apple</span>
          </span>
          <Chevron className="ml-3" />
        </Row>
      </Group>

      <Section>You</Section>
      <Group label="You">
        <SettingRow icon="sliders" label="Food preferences" value={dietLabel(diet)} />
        <SettingRow icon="chef" label="How you cook" value={skillLabel} />
      </Group>

      <Section>Tara</Section>
      <Group label="Tara">
        <SettingRow icon="display" label="Tara · Kitchen" value={setupPending ? "Not set up" : "Online"} />
        <SettingRow icon="shield" label="Safety and alerts" value={alerts ? "On" : "Off"} />
        <SettingRow icon="eye" label="Camera and privacy" />
      </Group>

      <Section>App</Section>
      <Group label="App">
        <SettingRow icon="bell" label="Notifications" />
        <SettingRow icon="help" label="Help" />
      </Group>

      <div className="mt-6 flex justify-center opacity-60">
        <TextButton
          onClick={() => {
            reset();
            go("01", { replace: true, dir: "none" });
          }}
        >
          Reset prototype
        </TextButton>
      </div>
    </TabScreen>
  );
}
