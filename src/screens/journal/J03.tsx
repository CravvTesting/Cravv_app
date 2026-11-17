"use client";

/*
 * J03 Log a meal: sheet over J01. Snap a Photo → J04. Search / Quick add are out of scope
 * (placeholder). Leftovers and recent foods log straight away: the sheet closes and the new
 * row expands in place on J01.
 */
import { Icon } from "@/components/cravv";
import { back, go } from "@/proto/nav";
import { useProto } from "@/proto/store";
import { TODAY, type Meal } from "@/proto/seed/meals";
import { Sheet } from "@/proto/ui";
import { MEAL_PHOTOS, SLOT_LABEL, nextSlot, nowTime, useJournalUi } from "./data";
import { AboveTabBar, Glyph, Hairline, PressRow, SECONDARY, SectionLabel, Thumb, type GlyphName } from "./parts";

type Food = { key: string; name: string; detail: string; kcal: number; source: Meal["source"]; photo?: string; note?: string };

const LEFTOVERS: Food[] = [{ key: "lo-thai", name: "Thai Green Curry", detail: "Today · 1 serving left · 540 kcal", kcal: 540, source: "leftovers", photo: MEAL_PHOTOS["Thai Green Curry"] }];
const RECENT: Food[] = [
  { key: "re-yogurt", name: "Greek yogurt bowl", detail: "1 bowl · 320 kcal", kcal: 320, source: "logged" },
  { key: "re-pizza", name: "Cheese pizza", detail: "2 slices · 570 kcal", kcal: 570, source: "logged", note: "2 slices" },
];

export default function J03() {
  const meals = useProto((s) => s.meals);
  const setStore = useProto((s) => s.set);
  const slot = nextSlot(meals);

  const log = (f: Food) => {
    const id = `m-${Date.now().toString(36)}`;
    setStore({ meals: [...meals, { id, day: TODAY, slot, name: f.name, kcal: f.kcal, time: nowTime(), source: f.source, note: f.note }] });
    useJournalUi.getState().set({ justAdded: id });
    back();
  };

  const ways: { label: string; icon: GlyphName | "search" | "bolt"; onPress: () => void }[] = [
    { label: "Snap a photo", icon: "camera", onPress: () => go("J04", { replace: true }) },
    { label: "Search food", icon: "search", onPress: () => go("placeholder", { replace: true }) },
    { label: "Quick add", icon: "bolt", onPress: () => go("placeholder", { replace: true }) },
  ];

  return (
    <AboveTabBar>
    <Sheet onDismiss={() => back()} label={`Log ${SLOT_LABEL[slot].toLowerCase()}`}>
      <div className="flex justify-center pt-1.5"><span aria-hidden className="h-[5px] w-9 rounded-[3px] bg-white/30" /></div>
      <div className="flex items-center justify-between px-5 pt-[13px]">
        <h2 className="text-[22px] font-bold leading-7 text-white">Log {SLOT_LABEL[slot].toLowerCase()}</h2>
        <button type="button" aria-label="Close" onClick={() => back()} className="relative flex size-8 items-center justify-center rounded-full bg-white/10 text-white/70 before:absolute before:-inset-1.5 before:content-['']">
          <Glyph name="close" size={16} />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 px-4">
        {ways.map((w) => (
          <button key={w.label} type="button" onClick={w.onPress} className="relative flex h-[84px] flex-col justify-between rounded-[16px] p-3 text-left transition-transform active:scale-[0.97]" style={{ background: "var(--cravv-surface-secondary)" }}>
            <span style={{ color: "var(--cravv-option-icon-off)" }}>
              {w.icon === "search" || w.icon === "bolt" ? <Icon name={w.icon} size={24} /> : <Glyph name={w.icon} size={24} />}
            </span>
            <span className="truncate text-[14px] font-semibold leading-[17px] text-white">{w.label}</span>
          </button>
        ))}
      </div>

      <SectionLabel className="mt-5">Leftovers from Tara</SectionLabel>
      <FoodList foods={LEFTOVERS} onAdd={log} />
      <SectionLabel className="mt-5">Recent</SectionLabel>
      <FoodList foods={RECENT} onAdd={log} />

      <p className="px-9 pt-4 text-[13px] leading-[18px]" style={{ color: SECONDARY }}>
        Meals you cook with Tara log themselves.
      </p>
    </Sheet>
    </AboveTabBar>
  );
}

function FoodList({ foods, onAdd }: { foods: Food[]; onAdd: (f: Food) => void }) {
  return (
    <div className="mx-5 overflow-hidden rounded-[16px]" style={{ background: "var(--cravv-surface-secondary)" }}>
      {foods.map((f, i) => (
        <div key={f.key} className="relative">
          {i > 0 && <Hairline inset={72} />}
          <PressRow onClick={() => onAdd(f)} label={`Add ${f.name}`} className="h-[72px] pl-4 pr-4">
            <Thumb src={f.photo} />
            <span className="ml-3 flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[16px] font-semibold leading-[19px] text-white">{f.name}</span>
              <span className="mt-[3px] truncate text-[12px] leading-[14px]" style={{ color: SECONDARY }}>{f.detail}</span>
            </span>
            <span aria-hidden className="flex h-8 w-9 items-center justify-center rounded-full bg-white/[0.12] text-white">
              <Glyph name="plus" size={18} />
            </span>
          </PressRow>
        </div>
      ))}
    </div>
  );
}
