"use client";

/*
 * 04 · Your kitchen (2525:2595). Diet multi-select (Everything clears the others and vice versa),
 * allergies multi-select with the Avoid state ("None" clears them), cuisines multi-select.
 */
import type { ReactNode } from "react";
import { ALLERGIES, Chip, CUISINES, DIETS, PrimaryButton, SectionTitle } from "@/components/cravv";
import { go } from "@/proto/nav";
import { useProto } from "@/proto/store";
import { Screen, ScreenHeader } from "@/proto/ui";

function Group({ title, action, children, className }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  const id = `sec-${title.toLowerCase()}`;
  return (
    <section aria-labelledby={id} className={className}>
      <div className="relative">
        <SectionTitle id={id}>{title}</SectionTitle>
        {action}
      </div>
      <div role="group" aria-labelledby={id} className="flex flex-wrap gap-x-2 gap-y-2.5">
        {children}
      </div>
    </section>
  );
}

export default function S04() {
  const diet = useProto((s) => s.diet);
  const allergies = useProto((s) => s.allergies);
  const cuisines = useProto((s) => s.cuisines);
  const set = useProto((s) => s.set);
  const toggleIn = useProto((s) => s.toggleIn);

  const toggleDiet = (id: string) => {
    if (id === "everything") set({ diet: diet.includes("everything") ? [] : ["everything"] });
    else {
      const rest = diet.filter((d) => d !== "everything");
      set({ diet: rest.includes(id) ? rest.filter((d) => d !== id) : [...rest, id] });
    }
  };

  return (
    <Screen header={<ScreenHeader steps={3} current={2} />} footer={<PrimaryButton onClick={() => go("05")}>Continue</PrimaryButton>}>
      <h1 className="text-[34px] font-bold leading-[41px] tracking-[0.4px] text-white">Your kitchen</h1>
      <p className="mt-[5px] text-[17px] leading-[22px] tracking-[-0.43px] text-secondary">Tara only suggests recipes that fit.</p>

      <Group title="Diet" className="mt-[27px]">
        {DIETS.map((d) => (
          <Chip key={d.id} label={d.label} icon={d.icon} token={d.token} state={diet.includes(d.id) ? "on" : "off"} onClick={() => toggleDiet(d.id)} />
        ))}
      </Group>

      <Group
        title="Allergies"
        className="mt-[35px]"
        action={
          <button
            type="button"
            onClick={() => set({ allergies: [] })}
            aria-pressed={allergies.length === 0}
            className="absolute -top-[9px] right-1 flex h-11 items-center px-3 text-[15px] font-semibold text-accent active:opacity-50"
          >
            None
          </button>
        }
      >
        {ALLERGIES.map((a) => (
          <Chip key={a.id} label={a.label} icon={a.icon} token={a.token} state={allergies.includes(a.id) ? "avoid" : "off"} onClick={() => toggleIn("allergies", a.id)} />
        ))}
      </Group>

      <Group title="Cuisines" className="mt-[35px] pb-6">
        {CUISINES.map((c) => (
          <Chip key={c.id} label={c.label} icon={c.icon} token={c.token} state={cuisines.includes(c.id) ? "on" : "off"} onClick={() => toggleIn("cuisines", c.id)} />
        ))}
      </Group>
    </Screen>
  );
}
