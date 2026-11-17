"use client";

/*
 * Simulated "Add to Instacart" job (J13 → J14). It runs at module level, so leaving J13
 * (Back, another tab) doesn't stop it: the progress keeps going and J11 shows it.
 * ~4 s in total at 1× speed (debug Speed divides it), items tick off one by one.
 */
import { create } from "zustand";
import { go, useNavState } from "@/proto/nav";
import { useProto } from "@/proto/store";

export type CartItem = { dish: string; name: string; amount: string };
export type Outcome = "added" | "changed" | "unavailable";

type Job = {
  status: "idle" | "running" | "done";
  items: CartItem[];
  done: number; // items finished
  /** Last finished send (J14 reads it). Kept until the next send starts. */
  result: { items: CartItem[]; outcomes: Outcome[] } | null;
  /** J14 was seen: Grocery goes back to offering a fresh send. */
  seen: () => void;
  start: (items: CartItem[]) => void;
  stop: () => void;
  reset: () => void;
};

const TOTAL_MS = 4000;
let timer: ReturnType<typeof setTimeout> | null = null;

export const useInstacart = create<Job>((set, get) => ({
  status: "idle",
  items: [],
  done: 0,
  result: null,
  seen: () => { if (get().status === "done") set({ status: "idle", items: [], done: 0 }); },
  start: (items) => {
    if (timer) clearTimeout(timer);
    set({ status: "running", items, done: 0, result: null });
    const speed = useProto.getState().debug.speed;
    const per = TOTAL_MS / Math.max(1, items.length) / speed;
    const tick = () => {
      const s = get();
      if (s.status !== "running") return;
      const done = s.done + 1;
      if (done >= s.items.length) {
        const res = outcomes(s.items, useProto.getState().debug.instacart);
        set({ done, status: "done", result: { items: s.items, outcomes: res } });
        // Items now in the cart leave the grocery list; unavailable ones stay.
        const gone = new Set(s.items.filter((_, i) => res[i] !== "unavailable").map((i) => `${i.dish}|${i.name}`));
        const { grocery, set: setStore } = useProto.getState();
        setStore({
          grocery: grocery
            .map((l) => ({ ...l, items: l.items.filter((x) => !gone.has(`${l.dish}|${x.name}`)) }))
            .filter((l) => l.items.length > 0 || l.dish === "Other"),
        });
        timer = null;
        // Still watching J13: the result settles in place.
        if (useNavState.getState().id === "J13") setTimeout(() => go("J14", { replace: true, dir: "none" }), 450 / speed);
        return;
      }
      set({ done });
      timer = setTimeout(tick, per);
    };
    timer = setTimeout(tick, per);
  },
  stop: () => {
    if (timer) clearTimeout(timer);
    timer = null;
    set({ status: "idle", items: [], done: 0 });
  },
  reset: () => set({ status: "idle", items: [], done: 0, result: null }),
}));

/** What happened to each item, per debug.instacart (J14 lists). */
export function outcomes(items: CartItem[], mode: "all-added" | "some-changed" | "some-unavailable"): Outcome[] {
  const out: Outcome[] = items.map(() => "added");
  if (mode === "all-added" || items.length < 2) return out;
  const pick = (re: RegExp, fallback: number) => {
    const i = items.findIndex((x, k) => re.test(x.name) && out[k] === "added");
    return i >= 0 ? i : fallback;
  };
  out[pick(/cream/i, items.length - 2)] = "changed";
  if (mode === "some-unavailable") {
    const i = pick(/cashew/i, items.length - 1);
    if (out[i] === "added") out[i] = "unavailable";
    else { const k = out.findIndex((o) => o === "added"); if (k >= 0) out[k] = "unavailable"; }
  }
  return out;
}

/** Swap note for an item added with a change. */
export function swapNote(name: string) {
  if (/cream/i.test(name)) return "Swapped for half-and-half, 1 pint";
  return `Swapped for a similar ${name.toLowerCase()}`;
}

/** Shelf detail for an added item ("2 cans, 15 oz"). */
export function shelfDetail(name: string, amount: string) {
  const known: Record<string, [string, string]> = { "Black beans": ["2 cans", "2 cans, 15 oz"], "Corn tortillas": ["12", "12 count"], Avocados: ["2", "2 medium"] };
  const k = known[name];
  return k && k[0] === amount ? k[1] : amount;
}
