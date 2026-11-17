"use client";

import { go, back } from "@/proto/nav";
import { SCREEN_IDS, type ScreenId } from "@/proto/store";

/** Temporary stand-in until a screen is built. */
export default function Placeholder({ id }: { id: ScreenId }) {
  const i = SCREEN_IDS.indexOf(id);
  const next = SCREEN_IDS[i + 1];
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-5 text-center">
      <p className="text-[34px] font-bold">{id}</p>
      <p className="text-secondary">Not built yet</p>
      {next && <button className="h-[52px] w-full rounded-full bg-white font-semibold text-black" onClick={() => go(next)}>Next: {next}</button>}
      <button className="h-11 text-white" onClick={() => back()}>Back</button>
    </div>
  );
}
