"use client";

/*
 * Hash router for the prototype. One route per screen id: /#/13.
 * Keeps a stack that mirrors browser history so the iOS-style push/pop direction is right,
 * whether navigation comes from a button, the browser back button or the edge swipe.
 */
import { create } from "zustand";
import { isScreenId, useProto, type ScreenId } from "./store";

export type Direction = "push" | "pop" | "none";

type NavState = {
  id: ScreenId;
  stack: ScreenId[];
  dir: Direction;
};

export const useNavState = create<NavState>(() => ({ id: "01", stack: ["01"], dir: "none" }));

/** Where Back (button and edge swipe) goes from each screen. null = no back. From handoff section 3. */
export const BACK: Record<ScreenId, ScreenId | null> = {
  "01": null, "02": "01", "02b": "01", "02x": "01", "02c": null,
  "03": "02", "04": "03", "05": "04", "06": "05",
  "07a": "06", "07b": null, "07c": "06", "07": "07a", "07h": "07",
  "08": "07", "08x": "07", "09": "07", "09x": "07",
  "10": "09", "10x": "09", "10b": null,
  "11": "10", "12": "11", "12h": "12",
  "13": "12", "13p": null, "13r": null, "13s": "12", "13x": "12", "13y": "12", "13n": null,
  "14": null, "14b": null, "home": null,
};

function writeHash(id: ScreenId, replace: boolean) {
  const url = `#/${id}`;
  const state = { tara: true, depth: useNavState.getState().stack.length };
  try {
    if (replace) history.replaceState(state, "", url);
    else history.pushState(state, "", url);
  } catch { /* ignore */ }
}

function remember(id: ScreenId) {
  const done = id === "home";
  useProto.getState().set(done ? { step: id, done: true } : { step: id });
}

export type GoOptions = { replace?: boolean; dir?: Direction };

/** Navigate to a screen. Default is an iOS push. */
export function go(id: ScreenId, opts: GoOptions = {}) {
  const { stack } = useNavState.getState();
  const dir = opts.dir ?? "push";
  let next: ScreenId[];
  if (opts.replace) next = [...stack.slice(0, -1), id];
  else if (dir === "pop") {
    // Popping to a screen already in the stack: trim to it.
    const i = stack.lastIndexOf(id);
    next = i >= 0 ? stack.slice(0, i + 1) : [...stack.slice(0, -1), id];
  } else next = [...stack, id];
  useNavState.setState({ id, stack: next, dir });
  writeHash(id, !!opts.replace || dir === "pop");
  remember(id);
}

/** Back from the current screen (button or swipe). Uses BACK, or `to` when given. */
export function back(to?: ScreenId) {
  const { id } = useNavState.getState();
  const target = to ?? BACK[id];
  if (!target) return;
  go(target, { dir: "pop" });
}

/** Called once on startup: deep link (#/13) wins, else resume at the saved step. */
export function initNav() {
  const fromHash = location.hash.replace(/^#\/?/, "");
  const { step, done } = useProto.getState();
  const start: ScreenId = isScreenId(fromHash) ? fromHash : done ? "home" : step;
  useNavState.setState({ id: start, stack: [start], dir: "none" });
  writeHash(start, true);
  remember(start);

  const onPop = () => {
    const h = location.hash.replace(/^#\/?/, "");
    if (!isScreenId(h)) return;
    const { stack } = useNavState.getState();
    const i = stack.lastIndexOf(h);
    if (i >= 0 && i < stack.length - 1) useNavState.setState({ id: h, stack: stack.slice(0, i + 1), dir: "pop" });
    else useNavState.setState({ id: h, stack: [...stack, h], dir: "push" });
    remember(h);
  };
  window.addEventListener("popstate", onPop);
  return () => window.removeEventListener("popstate", onPop);
}

/** Hook for screens: current id plus navigation helpers. */
export function useNav() {
  const id = useNavState((s) => s.id);
  return { id, go, back, canGoBack: BACK[id] !== null };
}
