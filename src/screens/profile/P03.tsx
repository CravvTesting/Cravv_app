"use client";

/*
 * P03 · Safety and alerts (2673:6172). Info and Act now phone alerts persist (alertsCfg).
 * Urgent is always on. Family member backup shows Off and opens a placeholder (consent flow
 * not designed yet, handoff §10).
 */
import { SettingsGroup } from "@/components/cravv";
import { go } from "@/proto/nav";
import { useProto } from "@/proto/store";
import { LargeTitleScreen } from "@/proto/ui";
import { GROUP_GAP, Row } from "./rows";

export default function P03() {
  const cfg = useProto((s) => s.alertsCfg);
  const set = useProto((s) => s.set);
  const patch = (p: Partial<typeof cfg>) => set({ alertsCfg: { ...useProto.getState().alertsCfg, ...p } });

  return (
    <LargeTitleScreen title="Safety and alerts" back subtitle="Tara always speaks first. Your phone follows.">
      <SettingsGroup header="Alert levels" className="pt-[9px]">
        <Row dot="var(--cravv-status-info)" label="Info" subtitle="Chime on Tara · quiet notification" />
        <Row dot="var(--cravv-status-warning)" label="Act now" subtitle="Tara says it aloud · notification" />
        <Row dot="var(--cravv-status-alert)" label="Urgent" subtitle="Alarm on Tara · full-screen alert" />
      </SettingsGroup>

      <SettingsGroup
        header="On this phone"
        className={GROUP_GAP}
        footer="Urgent alerts can’t be turned off. They cover a pan about to boil over or a burner left on."
      >
        <Row label="Info alerts" switchOn={cfg.info} onSwitch={(v) => patch({ info: v })} />
        <Row label="Act now alerts" switchOn={cfg.actNow} onSwitch={(v) => patch({ actNow: v })} />
        <Row label="Urgent alerts" value="Always on" />
      </SettingsGroup>

      <SettingsGroup
        header="Backup"
        className={GROUP_GAP}
        footer="If Tara loses Wi-Fi, its monitors and alarms keep running. Voice and phone alerts pause until it’s back."
      >
        <Row label="Family member" subtitle="If urgent waits 2 min" value={cfg.family ? "On" : "Off"} chevron onPress={() => go("placeholder")} />
      </SettingsGroup>
    </LargeTitleScreen>
  );
}
