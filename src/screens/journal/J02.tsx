"use client";

/*
 * J02 Meal detail (frame "J02 · Meal · Thai Green Curry"): hero photo, rating (writes the
 * store), the note with what Tara changes next time, macros, cook rows, Cook Again.
 * Which meal: useJournalUi.mealId (set by the J01 row); deep link = Thai Green Curry.
 */
import { useState } from "react";
import { BackButton, Icon, PrimaryButton, Rating, SettingsChevron } from "@/components/cravv";
import { back, go } from "@/proto/nav";
import { useProto } from "@/proto/store";
import { TODAY, type Meal } from "@/proto/seed/meals";
import { COOK_MINUTES, DEFAULT_NOTES, SLOT_LABEL, dayLabel, mealPhoto, useJournalUi } from "./data";
import { Card, Glyph, Hairline, ICON_OFF, PressRow, SECONDARY, Thumb } from "./parts";

export default function J02() {
  const mealId = useJournalUi((s) => s.mealId);
  const meals = useProto((s) => s.meals);
  const setStore = useProto((s) => s.set);
  const meal = meals.find((x) => x.id === mealId) ?? meals.find((x) => x.id === "m-tue-l") ?? meals[0];
  const [editing, setEditing] = useState(false);

  if (!meal) {
    return (
      <div className="cravv-bg flex h-full flex-col items-center justify-center gap-4 px-5">
        <p className="text-secondary">This meal is no longer in your log.</p>
        <PrimaryButton onClick={() => back()}>Back to Journal</PrimaryButton>
      </div>
    );
  }

  const patch = (p: Partial<Meal>) => setStore({ meals: meals.map((x) => (x.id === meal.id ? { ...x, ...p } : x)) });
  const photo = mealPhoto(meal);
  const tara = meal.source === "tara";
  const when = meal.day === TODAY ? `${SLOT_LABEL[meal.slot]} today` : `${SLOT_LABEL[meal.slot]} · ${dayLabel(meal.day)}`;
  const how = tara ? "cooked with Tara" : meal.source === "leftovers" ? "leftovers" : meal.source === "photo" ? "from a photo" : "logged";
  const mins = tara ? COOK_MINUTES[meal.name] : undefined;
  const subtitle = [when, how, mins ? `${mins} min` : meal.time].filter(Boolean).join(" · ");
  const def = DEFAULT_NOTES[meal.id];
  const note = tara ? meal.note ?? def?.note ?? "" : undefined;
  const taraLine = meal.note && meal.note !== def?.note ? "Tara adjusts next time" : def?.tara ?? "Tara adjusts next time";

  return (
    <div className="cravv-bg relative flex h-full w-full flex-col overflow-hidden">
      <div className="absolute left-4 z-20" style={{ top: "max(env(safe-area-inset-top), 8px)" }}>
        <div className="flex h-[52px] items-center">
          <BackButton onClick={() => back()} />
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain" style={{ paddingBottom: tara ? 16 : "max(env(safe-area-inset-bottom), 24px)" }}>
        {/* Hero */}
        <div className="relative h-[280px] w-full overflow-hidden">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center bg-white/[0.04]" style={{ color: ICON_OFF }}>
              <Icon name="bowl" size={72} />
            </div>
          )}
          <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(28,28,31,0) 45%, #1c1c1f 100%)" }} />
        </div>

        <div className="relative -mt-10 px-5">
          <h1 className="text-[28px] font-bold leading-[34px] text-white">{meal.name}</h1>
          <p className="mt-1 text-[15px] leading-5" style={{ color: SECONDARY }}>{subtitle}</p>

          {/* Rating */}
          <Card className="mt-4">
            <div className="flex h-16 items-center justify-between pl-4 pr-3">
              <span className="text-[16px] text-white">How was it?</span>
              <Rating value={meal.rating ?? 0} onChange={(v) => patch({ rating: v as Meal["rating"] })} size={20} />
            </div>
          </Card>

          {/* Note */}
          {note !== undefined && (
            <Card className="mt-3">
              <div className="flex gap-2.5 p-4">
                <Glyph name="note" size={20} style={{ color: ICON_OFF }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[15px] font-semibold leading-5 text-white">Your note</p>
                    {!editing && (
                      <button type="button" onClick={() => setEditing(true)} className="-my-3 -mr-2 h-11 px-2 text-[15px] active:opacity-50" style={{ color: "var(--cravv-text-accent)" }}>
                        Edit
                      </button>
                    )}
                  </div>
                  {editing ? (
                    <textarea
                      autoFocus
                      defaultValue={note}
                      rows={2}
                      aria-label="Your note"
                      onBlur={(e) => { patch({ note: e.target.value.trim() }); setEditing(false); }}
                      className="mt-1 w-full resize-none rounded-[10px] bg-white/[0.06] p-2 text-[15px] leading-5 text-white outline-none"
                    />
                  ) : (
                    <p className="mt-1 text-[15px] leading-5 text-white/85">{note ? `“${note}”` : "Add a note for next time."}</p>
                  )}
                  {note && !editing && (
                    <p className="mt-3 text-[13px] font-semibold leading-4" style={{ color: "var(--cravv-status-success)" }}>{taraLine}</p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Nutrition */}
          <Card className="mt-3">
            <div className="grid h-[76px] grid-cols-[84px_84px_84px_1fr] items-center px-4">
              <Macro value={String(meal.kcal)} label="kcal" />
              <Macro value={meal.protein !== undefined ? `${meal.protein} g` : "—"} label="protein" dot="var(--cravv-option-nutrient-protein-base)" />
              <Macro value={meal.carbs !== undefined ? `${meal.carbs} g` : "—"} label="carbs" dot="var(--cravv-option-nutrient-carbs-base)" />
              <Macro value={meal.fat !== undefined ? `${meal.fat} g` : "—"} label="fat" dot="var(--cravv-option-nutrient-fat-base)" />
            </div>
          </Card>

          {/* Cook rows */}
          {tara && (
            <Card className="mt-3">
              <PressRow onClick={() => go("placeholder")} className="h-14 pl-4 pr-4">
                <Glyph name="camera" size={22} style={{ color: ICON_OFF }} />
                <span className="ml-[14px] flex-1 text-[16px] text-white">Photos from the cook</span>
                <span className="mr-1.5 text-[14px]" style={{ color: SECONDARY }}>4</span>
                <SettingsChevron size={14} />
              </PressRow>
              <div className="relative">
                <Hairline inset={52} />
                <PressRow onClick={() => go("placeholder")} className="h-14 pl-4 pr-4">
                  <Glyph name="swap" size={22} style={{ color: ICON_OFF }} />
                  <span className="ml-[14px] flex-1 text-[16px] text-white">Cooked</span>
                  <span className="mr-1.5 text-[14px]" style={{ color: SECONDARY }}>{meal.name === "Thai Green Curry" ? "3 times since Sep" : "2 times since Oct"}</span>
                  <SettingsChevron size={14} />
                </PressRow>
              </div>
            </Card>
          )}
          {!tara && photo && meal.source === "photo" && (
            <div className="mt-3 flex items-center gap-3 px-1 text-[13px]" style={{ color: SECONDARY }}>
              <Thumb src={photo} size={32} radius={8} />
              Estimated from your photo
            </div>
          )}
        </div>
      </div>

      {tara && (
        <div className="relative z-10 shrink-0 px-5 pt-3" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 16px)" }}>
          <PrimaryButton onClick={() => go("placeholder")}>Cook Again</PrimaryButton>
        </div>
      )}
    </div>
  );
}

function Macro({ value, label, dot }: { value: string; label: string; dot?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[20px] font-bold leading-6 text-white">{value}</span>
      <span className="mt-0.5 flex items-center gap-[5px] text-[12px] leading-[14px]" style={{ color: SECONDARY }}>
        {dot && <span aria-hidden className="size-[7px] rounded-full" style={{ background: dot }} />}
        {label}
      </span>
    </div>
  );
}
