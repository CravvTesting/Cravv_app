"use client";

/*
 * J08 Save to collections: sheet over J07 (the heart on any recipe). Multi-select with
 * checkmarks; Done writes store.collections. Dismissing the sheet keeps things as they were.
 */
import { useState } from "react";
import { cx, Icon, PRESS, PrimaryButton } from "@/components/cravv";
import { back, go } from "@/proto/nav";
import { useProto } from "@/proto/store";
import { Sheet } from "@/proto/ui";
import { recipe, useJournalUi } from "./data";
import { FAV, Glyph, Hairline, Mosaic, SECONDARY, Thumb, tint } from "./parts";

export default function J08() {
  const recipeId = useJournalUi((s) => s.recipeId);
  const collections = useProto((s) => s.collections);
  const setStore = useProto((s) => s.set);
  const r = recipe(recipeId);
  const [picked, setPicked] = useState(() => new Set(collections.filter((c) => c.recipeIds.includes(recipeId)).map((c) => c.id)));

  const toggle = (id: string) =>
    setPicked((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const done = () => {
    setStore({
      collections: collections.map((c) => {
        const has = c.recipeIds.includes(recipeId);
        if (picked.has(c.id) && !has) return { ...c, recipeIds: [...c.recipeIds, recipeId] };
        if (!picked.has(c.id) && has) return { ...c, recipeIds: c.recipeIds.filter((x) => x !== recipeId) };
        return c;
      }),
    });
    back();
  };

  return (
    <Sheet onDismiss={() => back()} label={`Save ${r.name}`}>
      <div className="flex justify-center pt-1.5"><span aria-hidden className="h-[5px] w-9 rounded-[3px] bg-white/30" /></div>
      <div className="flex items-center gap-3 px-5 pt-[19px]">
        <Thumb src={r.photo} size={48} radius={12} />
        <div className="min-w-0">
          <h2 className="truncate text-[20px] font-bold leading-6 text-white">Save {r.name}</h2>
          <p className="mt-0.5 text-[13px] leading-4" style={{ color: SECONDARY }}>Pick one or more collections</p>
        </div>
      </div>

      <div role="group" aria-label="Collections" className="mx-5 mt-[18px] overflow-hidden rounded-[16px]" style={{ background: "var(--cravv-surface-secondary)" }}>
        {collections.map((c, i) => {
          const on = picked.has(c.id);
          return (
            <div key={c.id} className="relative">
              {i > 0 && <Hairline inset={68} />}
              <button type="button" role="checkbox" aria-checked={on} onClick={() => toggle(c.id)} className={cx("relative flex h-[60px] w-full items-center pl-4 pr-4 text-left", PRESS)}>
                  {c.id === "all" ? (
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px]" style={{ background: tint(FAV, 16), color: FAV }}>
                      <Icon name="heart" size={20} />
                    </span>
                  ) : (
                    <Mosaic recipeIds={c.recipeIds} size={40} radius={10} />
                  )}
                  <span className="ml-3 flex-1 truncate text-[16px] text-white">{c.name}</span>
                  <Check on={on} />
              </button>
            </div>
          );
        })}
      </div>

      <button type="button" onClick={() => go("J09")} className="mx-5 mt-3.5 flex h-11 items-center gap-2 text-[16px] font-semibold active:opacity-50" style={{ color: "var(--cravv-text-accent)" }}>
        <Glyph name="plus" size={22} />
        New collection
      </button>
      <div className="px-5 pt-3">
        <PrimaryButton onClick={done}>Done</PrimaryButton>
      </div>
    </Sheet>
  );
}

function Check({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className="flex size-[22px] shrink-0 items-center justify-center rounded-full"
      style={{ background: on ? FAV : "transparent", boxShadow: on ? undefined : "inset 0 0 0 1.5px rgb(255 255 255 / 0.35)", transition: "background-color 0.2s ease, box-shadow 0.2s ease" }}
    >
      <Glyph name="check" size={16} className="text-white" style={{ opacity: on ? 1 : 0, transform: on ? "scale(1)" : "scale(0.6)", transition: "opacity 0.2s ease, transform 0.25s cubic-bezier(0.34,1.56,0.64,1)" }} />
    </span>
  );
}
