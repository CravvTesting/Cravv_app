"use client";

/*
 * N02 · About you (2601:4009). Age, sex, height, weight bound to store.body (US units stored).
 * Height → N02b (wheel sheet route). Age and weight open the same wheel in a local sheet
 * (no frames for those). Sex uses the native popup picker. The pregnancy row shows only for Female.
 * "Switch to metric" flips store.units (display only; the store keeps inches and pounds).
 */
import { AnimatePresence } from "motion/react";
import { useId, useState } from "react";
import { Icon, SettingsChevron, SettingsGroup, Switch, optionBase } from "@/components/cravv";
import { go } from "@/proto/nav";
import { useProto, type Tabs } from "@/proto/store";
import { Sheet } from "@/proto/ui";
import { formatHeight, formatWeight, kgToLb, lbToKg } from "./setup/calc";
import { PickerHeader, range, UpDownGlyph, ValueRow, Wheel, WheelBand } from "./setup/parts";
import { SetupScreen } from "./setup/SetupScreen";

const SEX: { value: Tabs["body"]["sex"]; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
];

const AGES = range(13, 100);
const LBS = range(70, 400);
const KGS = range(32, 180);

type Picker = null | "age" | "weight";

function NumberSheet({ kind, onClose }: { kind: "age" | "weight"; onClose: () => void }) {
  const body = useProto((s) => s.body);
  const units = useProto((s) => s.units);
  const set = useProto((s) => s.set);
  const metric = units === "metric";
  const initial = kind === "age" ? body.age : metric ? lbToKg(body.weightLb) : body.weightLb;
  const [v, setV] = useState(initial);
  const titleId = useId();
  const values = kind === "age" ? AGES : metric ? KGS : LBS;
  const unit = kind === "age" ? "years" : metric ? "kg" : "lb";

  const done = () => {
    if (kind === "age") set({ body: { ...body, age: v } });
    else set({ body: { ...body, weightLb: metric ? kgToLb(v) : v } });
    onClose();
  };

  return (
    <Sheet onDismiss={onClose} label={kind === "age" ? "Age" : "Weight"}>
      <PickerHeader title={kind === "age" ? "Age" : "Weight"} onCancel={onClose} onDone={done} titleId={titleId} />
      <div className="relative mt-4">
        <WheelBand />
        <div className="relative flex items-start">
          <Wheel className="w-[55%] pr-2" values={values} value={initial} onChange={setV} label={kind === "age" ? "Age in years" : `Weight in ${unit}`} />
          <span className="pl-1 text-[17px] text-secondary" style={{ marginTop: 37 * 2 + 9 }}>
            {unit}
          </span>
        </div>
      </div>
      <p className="mt-6 px-5 text-center text-[13px] leading-[18px] text-secondary">
        {kind === "age" ? "Only used to size your targets." : "Your weight is kept private and only used for your targets."}
      </p>
    </Sheet>
  );
}

export default function N02() {
  const body = useProto((s) => s.body);
  const units = useProto((s) => s.units);
  const set = useProto((s) => s.set);
  const [picker, setPicker] = useState<Picker>(null);
  const pregLabel = useId();
  const female = body.sex === "female";
  const icon = (token: Parameters<typeof optionBase>[0], name: Parameters<typeof Icon>[0]["name"]) => (
    <Icon name={name} size={22} style={{ color: optionBase(token) }} />
  );

  return (
    <>
      <SetupScreen step={1} title="About you" subtitle="Only used to size your targets." button="Continue" onButton={() => go("N03")}>
        <SettingsGroup className="mt-[19px]">
          <ValueRow icon={icon("body-age", "cake")} label="Age" value={String(body.age)} trailing={<SettingsChevron size={14} />} onPress={() => setPicker("age")} />
          <ValueRow icon={icon("body-sex", "person")} label="Sex" value={SEX.find((s) => s.value === body.sex)?.label ?? ""} trailing={<UpDownGlyph />}>
            {/* Native popup picker covering the row (iOS shows its own menu). */}
            <select
              aria-label="Sex"
              value={body.sex}
              onChange={(e) => {
                const sex = e.target.value as Tabs["body"]["sex"];
                set({ body: { ...body, sex, pregnant: sex === "female" ? body.pregnant : false } });
              }}
              className="absolute inset-0 cursor-pointer appearance-none opacity-0"
            >
              {SEX.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </ValueRow>
          <ValueRow icon={icon("body-height", "ruler")} label="Height" value={formatHeight(body.heightIn, units)} trailing={<SettingsChevron size={14} />} onPress={() => go("N02b")} />
          <ValueRow icon={icon("body-weight", "scale")} label="Weight" value={formatWeight(body.weightLb, units)} trailing={<SettingsChevron size={14} />} onPress={() => setPicker("weight")} />
        </SettingsGroup>

        {female && (
          <div className="mt-4 flex h-14 items-center rounded-[16px] bg-raised" style={{ animation: "cravv-fade-in 0.25s var(--ease-ios) both" }}>
            <span className="ml-4 shrink-0" style={{ color: body.pregnant ? optionBase("body-pregnancy") : "var(--cravv-option-icon-off)", transition: "color 0.2s" }}>
              <Icon name="heart" size={22} />
            </span>
            <span id={pregLabel} className="ml-[14px] min-w-0 flex-1 truncate text-[17px] leading-[22px] text-white">
              Pregnant or breastfeeding
            </span>
            <Switch className="mr-4" checked={body.pregnant} labelledBy={pregLabel} onChange={(v) => set({ body: { ...body, pregnant: v } })} />
          </div>
        )}
        <p className="mt-2 px-4 text-[13px] leading-[18px] text-secondary">
          {female ? "Changes your calorie and protein needs. " : ""}We use sex and body size only for the math.
        </p>
        <button
          type="button"
          onClick={() => set({ units: units === "us" ? "metric" : "us" })}
          className="mt-1 h-11 px-4 text-left text-[13px] font-semibold text-copper"
        >
          {units === "us" ? "Using US units · Switch to metric" : "Using metric · Switch to US units"}
        </button>
      </SetupScreen>
      <AnimatePresence>{picker && <NumberSheet key={picker} kind={picker} onClose={() => setPicker(null)} />}</AnimatePresence>
    </>
  );
}
