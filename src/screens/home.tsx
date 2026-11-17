"use client";

/*
 * Placeholder Home (out of scope beyond this): says onboarding is done, shows the captured state,
 * and offers "Reset prototype".
 */
import { ALLERGIES, CUISINES, DIETS, SKILLS, STOVE_TYPES, TextButton } from "@/components/cravv";
import { go } from "@/proto/nav";
import { useProto } from "@/proto/store";
import { Screen } from "@/proto/ui";
import { SummaryCard } from "./entry/SummaryCard";

const labels = (ids: string[], opts: readonly { id: string; label: string }[], empty: string) =>
  ids.map((id) => opts.find((o) => o.id === id)?.label ?? id).join(", ") || empty;

export default function Home() {
  const s = useProto();

  const rows = [
    { key: "name", label: "Name", value: s.name || "—" },
    { key: "diet", label: "Diet", value: labels(s.diet, DIETS, "—") },
    { key: "allergies", label: "Allergies", value: labels(s.allergies, ALLERGIES, "None") },
    { key: "cuisines", label: "Cuisines", value: labels(s.cuisines, CUISINES, "—") },
    { key: "for", label: "Cooking for", value: String(s.cookingFor) },
    { key: "units", label: "Units", value: s.units === "us" ? "US" : "Metric" },
    { key: "skill", label: "Skill", value: SKILLS.find((k) => k.id === s.skill)?.label ?? s.skill },
    { key: "stove", label: "Stove", value: STOVE_TYPES.find((k) => k.id === s.stoveType)?.label ?? s.stoveType },
    { key: "burners", label: "Burners", value: String(s.burners) },
    { key: "wifi", label: "Wi-Fi", value: s.wifi },
    { key: "alerts", label: "Alerts", value: s.alerts ? "On" : "Off" },
    { key: "pending", label: "Tara setup", value: s.setupPending ? "Pending" : "Done" },
  ];

  return (
    <Screen
      footer={
        <TextButton
          onClick={() => {
            s.reset();
            go("01", { replace: true, dir: "none" });
          }}
        >
          Reset prototype
        </TextButton>
      }
    >
      <h1 className="pt-6 text-[34px] font-bold leading-[41px] tracking-[0.4px] text-white">Home</h1>
      <p className="mt-1.5 text-[17px] leading-[22px] tracking-[-0.43px] text-secondary">
        Onboarding is done{s.name ? `, ${s.name}` : ""}. The rest of the app isn’t part of this prototype.
      </p>
      {s.setupPending && (
        <p className="mt-4 rounded-[20px] bg-raised px-4 py-3 text-[15px] leading-5 text-white/85">
          Tara isn’t set up yet. You chose to explore recipes first.
        </p>
      )}
      <h2 className="mt-7 px-4 pb-2 text-[17px] font-semibold leading-[22px] text-secondary">What Tara knows</h2>
      <SummaryCard rows={rows} className="mb-6" />
    </Screen>
  );
}
