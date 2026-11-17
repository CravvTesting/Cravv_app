"use client";

/*
 * R08 · Edit targets. For You = calculated (read-only); Custom = calories and macros editable
 * (native pickers). Save writes store.targets and goes back (R01 or Profile).
 */
import { useState } from "react";
import { PrimaryButton, SegmentedControl, SettingsGroup, SettingsRow, cx, formatNumber } from "@/components/cravv";
import { back, go } from "@/proto/nav";
import { initialTabs, useProto, type Tabs } from "@/proto/store";
import { LargeTitleScreen } from "@/proto/ui";
import { LIMITS } from "./today-data";
import { Card, Hairline, SECONDARY, UpDownGlyph } from "./today-ui";

type Targets = Tabs["targets"];
type Key = "kcal" | "protein" | "carbs" | "fat";

const range = (from: number, to: number, step: number) => Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, i) => from + i * step);
const FIELDS: { key: Key; label: string; unit: string; options: number[] }[] = [
  { key: "kcal", label: "Calories", unit: "kcal", options: range(1200, 3500, 50) },
  { key: "protein", label: "Protein", unit: "g", options: range(40, 200, 5) },
  { key: "carbs", label: "Carbs", unit: "g", options: range(100, 400, 10) },
  { key: "fat", label: "Fat", unit: "g", options: range(30, 130, 1) },
];
const LIMIT_ROWS = [
  { label: "Fiber", value: `at least ${LIMITS.fiber} g` },
  { label: "Sodium", value: `under ${formatNumber(LIMITS.sodium)} mg` },
  { label: "Added sugar", value: `under ${LIMITS["added-sugar"]} g a meal` },
  { label: "Saturated fat", value: `under ${LIMITS["saturated-fat"]} g` },
];
/** "For You": calculated from the details in N02–N04 (Mifflin–St Jeor × activity, see N05). */
const FOR_YOU = initialTabs.targets;

const withOption = (opts: number[], v: number) => (opts.includes(v) ? opts : [...opts, v].sort((a, b) => a - b));

export default function R08() {
  const targets = useProto((s) => s.targets);
  const set = useProto((s) => s.set);
  const [mode, setMode] = useState<Targets["mode"]>(targets.mode);
  const [custom, setCustom] = useState<Omit<Targets, "mode">>(() => {
    const { mode: _m, ...rest } = targets; // eslint-disable-line @typescript-eslint/no-unused-vars
    return rest;
  });
  const shown = mode === "forYou" ? FOR_YOU : custom;

  const save = () => {
    set({ targets: mode === "forYou" ? { ...FOR_YOU, mode } : { ...custom, mode } });
    back();
  };

  return (
    <LargeTitleScreen
      title="Your targets"
      back
      subtitle="Calculated from your details, or set your own."
      below={
        <SegmentedControl
          label="Targets"
          options={[{ value: "forYou" as const, label: "For You" }, { value: "custom" as const, label: "Custom" }]}
          value={mode}
          onChange={setMode}
        />
      }
      footer={<PrimaryButton onClick={save}>Save</PrimaryButton>}
    >
      <Card>
        {FIELDS.map((f, i) => {
          const value = `${formatNumber(shown[f.key])} ${f.unit}`;
          return (
            <div key={f.key} className="relative flex h-14 items-center">
              {i > 0 && <Hairline inset={16} right={16} />}
              <span className="ml-4 flex-1 text-[17px] leading-[22px] text-white">{f.label}</span>
              {mode === "custom" ? (
                <label className="relative mr-4 flex h-11 items-center gap-1.5 text-[17px] leading-[22px]" style={{ color: "var(--cravv-text-accent)" }}>
                  <span className="tabular-nums">{value}</span>
                  <span style={{ color: "var(--cravv-option-icon-off)" }}><UpDownGlyph /></span>
                  <select
                    aria-label={f.label}
                    value={custom[f.key]}
                    onChange={(e) => setCustom((c) => ({ ...c, [f.key]: Number(e.target.value) }))}
                    className="absolute inset-0 cursor-pointer appearance-none opacity-0"
                  >
                    {withOption(f.options, custom[f.key]).map((o) => (
                      <option key={o} value={o}>{formatNumber(o)} {f.unit}</option>
                    ))}
                  </select>
                </label>
              ) : (
                <span className={cx("mr-4 text-[17px] leading-[22px] tabular-nums")} style={{ color: SECONDARY }}>{value}</span>
              )}
            </div>
          );
        })}
      </Card>

      <Card className="mt-4">
        {LIMIT_ROWS.map((r, i) => (
          <div key={r.label} className="relative flex h-14 items-center">
            {i > 0 && <Hairline inset={16} right={16} />}
            <span className="ml-4 flex-1 text-[17px] leading-[22px] text-white">{r.label}</span>
            <span className="mr-4 text-[17px] leading-[22px]" style={{ color: SECONDARY }}>{r.value}</span>
          </div>
        ))}
      </Card>

      <SettingsGroup className="mt-3">
        <SettingsRow type="navigation" icon="person" label="Update my details" onPress={() => go("N02")} separator={false} />
      </SettingsGroup>
    </LargeTitleScreen>
  );
}
