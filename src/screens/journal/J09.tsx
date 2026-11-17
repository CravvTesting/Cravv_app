"use client";

/*
 * J09 New collection: name field, name ideas, share with family. Create adds it to
 * store.collections and goes back (from J08, the recipe being saved goes straight in).
 */
import { useState } from "react";
import { PrimaryButton, SettingsGroup, SettingsRow } from "@/components/cravv";
import { back, useNavState } from "@/proto/nav";
import { useProto } from "@/proto/store";
import { LargeTitleScreen } from "@/proto/ui";
import { useJournalUi } from "./data";
import { SECONDARY, SectionLabel } from "./parts";

const IDEAS = ["Meal prep", "Date night", "Holiday table", "Quick lunches", "Comfort food"];

export default function J09() {
  const collections = useProto((s) => s.collections);
  const setStore = useProto((s) => s.set);
  const [name, setName] = useState("");
  const [shared, setShared] = useState(false);
  const trimmed = name.trim();

  const create = () => {
    if (!trimmed) return;
    const stack = useNavState.getState().stack;
    const fromSave = stack[stack.length - 2] === "J08";
    const recipeIds = fromSave ? [useJournalUi.getState().recipeId] : [];
    setStore({ collections: [...collections, { id: `c-${Date.now().toString(36)}`, name: trimmed, recipeIds, shared }] });
    back();
  };

  return (
    <LargeTitleScreen
      title="New collection"
      back
      subtitle="Group recipes the way you cook them."
      footer={<PrimaryButton onClick={create} disabled={!trimmed}>Create</PrimaryButton>}
    >
      <label className="sr-only" htmlFor="j09-name">Collection name</label>
      <input
        id="j09-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") create(); }}
        placeholder="Name it"
        autoComplete="off"
        enterKeyHint="done"
        maxLength={40}
        className="h-[52px] w-full rounded-[26px] bg-white/[0.08] px-5 text-[17px] text-white outline-none placeholder:text-[color:var(--cravv-text-placeholder)]"
        style={{ caretColor: "var(--cravv-copper-500)" }}
      />

      <SectionLabel className="mt-5">Ideas</SectionLabel>
      <div className="flex flex-wrap gap-2">
        {IDEAS.map((idea) => (
          <button
            key={idea}
            type="button"
            onClick={() => setName(idea)}
            aria-pressed={trimmed === idea}
            className="h-[34px] rounded-full px-[14px] text-[15px] font-medium transition-colors active:bg-white/[0.16]"
            style={{ background: "var(--cravv-surface-raised)", color: "rgb(235 235 245 / 0.85)" }}
          >
            {idea}
          </button>
        ))}
      </div>

      <SettingsGroup className="mt-[22px]" footer={<span style={{ color: SECONDARY }}>The cover builds itself from the first four recipes you add.</span>}>
        <SettingsRow type="switch" icon="users" label="Share with family" checked={shared} onChange={setShared} />
      </SettingsGroup>
    </LargeTitleScreen>
  );
}
