"use client";

/*
 * J12 Add ingredient: sheet over J11. Suggestions are the recipe's ingredients that aren't on
 * the list yet; "Something else" takes a name, an amount and a unit. Done appends to the list.
 */
import { useState } from "react";
import { PrimaryButton } from "@/components/cravv";
import { back } from "@/proto/nav";
import { useProto } from "@/proto/store";
import type { GroceryItem } from "@/proto/seed/journal";
import { Sheet } from "@/proto/ui";
import { formatAmount, recipe, useJournalUi } from "./data";
import { AboveTabBar, Glyph, Hairline, SECONDARY, Stepper, TERTIARY } from "./parts";

const UNITS = ["", "cup", "oz", "lb", "can", "bunch"];
const unitLabel = (u: string) => u || "count";

export default function J12() {
  const dish = useJournalUi((s) => s.dish);
  const grocery = useProto((s) => s.grocery);
  const setStore = useProto((s) => s.set);
  const setDebug = useProto((s) => s.setDebug);
  const list = grocery.find((l) => l.dish === dish);
  const recipeId = list?.recipeId;
  const suggestions = (recipeId ? recipe(recipeId).ingredients ?? [] : []).filter((i) => !list?.items.some((x) => x.name === i.name));

  const [added, setAdded] = useState<GroceryItem[]>([]);
  const [name, setName] = useState("");
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState("");

  const isAdded = (n: string) => added.some((a) => a.name === n);
  const toggle = (i: { name: string; amount: string }) =>
    setAdded((a) => (isAdded(i.name) ? a.filter((x) => x.name !== i.name) : [...a, { ...i, have: false }]));

  const addCustom = () => {
    const n = name.trim();
    if (!n) return;
    const plural = (u: string) => (u === "oz" || u === "lb" ? u : u.endsWith("ch") ? `${u}es` : `${u}s`);
    const amount = formatAmount(qty, unit ? (qty > 1 ? plural(unit) : unit) : "");
    setAdded((a) => [...a.filter((x) => x.name !== n), { name: n, amount, have: false }]);
    setName(""); setQty(1); setUnit("");
  };

  const done = () => {
    if (added.length) {
      const exists = grocery.some((l) => l.dish === dish);
      const next = exists
        ? grocery.map((l) => (l.dish === dish ? { ...l, items: [...l.items, ...added] } : l))
        : [...grocery.filter((l) => l.items.length > 0), { dish, source: "Added by you", selected: true, items: added }];
      setStore({ grocery: next });
      setDebug({ groceryData: "persona" });
    }
    back();
  };

  const custom = added.filter((a) => !suggestions.some((s) => s.name === a.name));

  return (
    <AboveTabBar>
    <Sheet onDismiss={() => back()} label={`Add to ${dish}`}>
      <div className="flex justify-center pt-1.5"><span aria-hidden className="h-[5px] w-9 rounded-[3px] bg-white/30" /></div>
      <div className="px-5 pt-[13px]">
        <h2 className="text-[22px] font-bold leading-7 text-white">Add to {dish}</h2>
        <p className="mt-1 text-[14px] leading-[18px]" style={{ color: SECONDARY }}>
          {suggestions.length ? "Ingredients from this recipe that aren’t on the list yet." : "Anything you need, with how much."}
        </p>
      </div>

      {(suggestions.length > 0 || custom.length > 0) && (
        <div className="mx-5 mt-4 overflow-hidden rounded-[16px]" style={{ background: "var(--cravv-surface-secondary)" }}>
          {[...suggestions, ...custom].map((i, k) => {
            const on = isAdded(i.name);
            return (
              <div key={i.name} className="relative flex h-[54px] items-center pl-4 pr-4">
                {k > 0 && <Hairline inset={16} right={16} />}
                <span className="min-w-0 flex-1 truncate text-[16px] text-white">
                  {i.name} <span className="ml-1.5 text-[13px]" style={{ color: TERTIARY }}>{i.amount}</span>
                </span>
                <button
                  type="button"
                  aria-pressed={on}
                  aria-label={on ? `Remove ${i.name}` : `Add ${i.name}`}
                  onClick={() => toggle(i)}
                  className="relative flex h-8 w-[84px] shrink-0 items-center justify-center gap-1.5 rounded-full text-[14px] font-semibold transition-colors before:absolute before:-inset-y-1.5 before:inset-x-0 before:content-['']"
                  style={{ background: on ? "color-mix(in srgb, var(--cravv-status-success) 18%, transparent)" : "rgb(255 255 255 / 0.1)", color: on ? "var(--cravv-status-success)" : "white" }}
                >
                  <Glyph name={on ? "check" : "plus"} size={16} />
                  {on ? "Added" : "Add"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Something else: name, amount, unit */}
      <div className="mx-5 mt-4 rounded-[22px] bg-white/[0.08]">
        <div className="flex h-11 items-center gap-2.5 pl-3.5 pr-1.5">
          <Glyph name="plus" size={20} style={{ color: TERTIARY }} />
          <label htmlFor="j12-name" className="sr-only">Something else</label>
          <input
            id="j12-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addCustom(); }}
            placeholder="Something else"
            autoComplete="off"
            enterKeyHint="done"
            className="min-w-0 flex-1 bg-transparent text-[16px] text-white outline-none placeholder:text-[color:rgb(235_235_245/0.5)]"
          />
          {name.trim() && (
            <button type="button" onClick={addCustom} className="h-8 shrink-0 rounded-full bg-white px-3.5 text-[14px] font-semibold" style={{ color: "var(--cravv-button-primary-label)" }}>
              Add
            </button>
          )}
        </div>
        {name.trim() && (
          <div className="flex flex-col gap-2.5 px-3.5 pb-3.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[15px]" style={{ color: SECONDARY }}>Amount</span>
              <Stepper label="Amount" value={formatAmount(qty, "")} onMinus={() => setQty((q) => Math.max(0.25, q <= 1 ? q - 0.25 : q - 1))} onPlus={() => setQty((q) => (q < 1 ? q + 0.25 : q + 1))} minusDisabled={qty <= 0.25} />
            </div>
            <div role="radiogroup" aria-label="Unit" className="flex flex-wrap gap-1.5">
              {UNITS.map((u) => (
                <button
                  key={u || "count"}
                  type="button"
                  role="radio"
                  aria-checked={unit === u}
                  onClick={() => setUnit(u)}
                  className="h-8 rounded-full px-3 text-[14px] transition-colors"
                  style={{ background: unit === u ? "white" : "rgb(255 255 255 / 0.08)", color: unit === u ? "var(--cravv-button-primary-label)" : "rgb(235 235 245 / 0.85)", fontWeight: unit === u ? 600 : 400 }}
                >
                  {unitLabel(u)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pt-5">
        <PrimaryButton onClick={done}>{added.length ? `Done · ${added.length} Added` : "Done"}</PrimaryButton>
      </div>
    </Sheet>
    </AboveTabBar>
  );
}
