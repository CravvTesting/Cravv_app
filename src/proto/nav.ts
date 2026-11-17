"use client";

/*
 * Hash router for the prototype. One route per screen id: /#/R04.
 *
 * - Onboarding is a single stack with fixed Back targets (BACK).
 * - After onboarding there are four tabs. Each tab keeps its own stack (and each screen its
 *   scroll position, see scroll.ts), like UITabBarController + UINavigationController.
 *   A push appends to the current tab's stack, whatever screen it is (Profile → R08 stays in
 *   Profile). Back pops that stack; a deep link falls back to PARENT.
 * - No browser history entries are ever added: iOS standalone web apps walk browser history
 *   with their own edge swipes, which would fight ours.
 */
import { create } from "zustand";
import { isScreenId, useProto, type ScreenId } from "./store";

/** push/pop = iOS slide, none = cross-fade, instant = no animation (end of an edge swipe). */
export type Direction = "push" | "pop" | "none" | "instant";

export const TABS = ["home", "nutrition", "journal", "profile"] as const;
export type TabId = (typeof TABS)[number];
export const isTab = (v: string): v is TabId => (TABS as readonly string[]).includes(v);

type NavState = {
  id: ScreenId;
  dir: Direction;
  tab: TabId | null; // null during onboarding
  stack: ScreenId[]; // current stack (the active tab's, or onboarding's)
  tabStacks: Partial<Record<TabId, ScreenId[]>>; // saved stacks of the other tabs
};

export const useNavState = create<NavState>(() => ({ id: "01", dir: "none", tab: null, stack: ["01"], tabStacks: {} }));

/** Onboarding Back targets (onboarding handoff §3). */
export const BACK: Partial<Record<ScreenId, ScreenId | null>> = {
  "01": null, "02": "01", "02b": "01", "02x": "01", "02c": null,
  "03": "02", "04": "03", "05": "04", "06": "05",
  "07a": "06", "07b": null, "07c": "06", "07": "07a", "07h": "07",
  "08": "07", "08x": "07", "09": "07", "09x": "07",
  "10": "09", "10x": "09", "10b": "10",
  "11": "10", "12": "11", "12h": "12",
  "13": "12", "13p": null, "13r": null, "13s": "12", "13x": "12", "13y": "12", "13n": "13s",
  "14": null, "14b": null,
};

/** Parent of each pushed tab screen: Back when there's no stack (deep link). */
export const PARENT: Partial<Record<ScreenId, ScreenId>> = {
  F01: "home", F02: "home", F03: "home",
  N02: "N01", N02b: "N02", N03: "N02", N04: "N03", N05: "N04", N05b: "N05", N06: "N05",
  R04: "R01", R05: "R01", R06: "R05", R07: "R06", R08: "R01", R09: "R01",
  J02: "J01", J03: "J01", J04: "J01", J07: "J06", J08: "J07", J09: "J06", J12: "J11", J13: "J11", J14: "J11",
  P02: "P01", P03: "P01", P04: "P01", P05: "P01", e04: "P01", e05: "P01", e11: "P02",
};

/** Screens that show the tab bar (tab roots, their segments/states, and sheets over them). */
export const TAB_ROOT_SCREENS: ReadonlySet<ScreenId> = new Set<ScreenId>([
  "home", "F01", "F02", "F03",
  "N01", "N06", "R01", "R02", "R03",
  "J01", "J05", "J06", "J10", "J11", "J15", "J03", "J12",
  "P01", "P01b", "P01c", "P05",
]);

/** Root screen of a tab. Nutrition opens on N01 until its setup is done. */
export function rootOf(tab: TabId): ScreenId {
  if (tab === "home") return "home";
  if (tab === "nutrition") return useProto.getState().nutritionSetup ? "R01" : "N01";
  if (tab === "journal") return "J01";
  return "P01";
}

/** Which tab a screen naturally lives in (for deep links and debug jumps). */
export function naturalTab(id: ScreenId): TabId | null {
  if (id === "home" || id.startsWith("F")) return "home";
  if (id.startsWith("N") || id.startsWith("R")) return "nutrition";
  if (id.startsWith("J")) return "journal";
  if (id.startsWith("P") || id.startsWith("e") || id === "placeholder") return "profile";
  return null;
}

const SEGMENT_ROOTS: ReadonlySet<ScreenId> = new Set<ScreenId>(["home", "N01", "R01", "R02", "R03", "J01", "J05", "J06", "J10", "J11", "J15", "P01", "P01b", "P01c"]);

/** Stack you'd have if you had walked to `id` from its tab root. */
function naturalStack(id: ScreenId): ScreenId[] {
  if (SEGMENT_ROOTS.has(id)) return [id];
  const chain: ScreenId[] = [id];
  let p = PARENT[id];
  while (p && chain.length < 8) { chain.unshift(p); if (SEGMENT_ROOTS.has(p)) break; p = PARENT[p]; }
  return chain;
}

function writeHash(id: ScreenId) {
  try { history.replaceState(null, "", `#/${id}`); } catch { /* ignore */ }
}

function remember(id: ScreenId, tab: TabId | null) {
  useProto.getState().set(tab ? { step: id, done: true } : { step: id });
}

function commit(next: Omit<NavState, "tabStacks"> & { tabStacks?: NavState["tabStacks"] }) {
  useNavState.setState(next);
  writeHash(next.id);
  remember(next.id, next.tab);
}

export type GoOptions = {
  /** Replace the top of the stack instead of pushing (in-place state changes, segments). */
  replace?: boolean;
  dir?: Direction;
};

/**
 * Navigate.
 * - default: iOS push onto the current stack
 * - { replace: true, dir: "none" }: swap the current screen in place with a cross-fade
 * - { dir: "pop" }: pop back to that screen (trims the stack)
 * - { dir: "none" } without replace: a jump (debug menu, deep link, reset). Rebuilds the
 *   natural stack for the target, entering or leaving the tabs as needed.
 */
export function go(id: ScreenId, opts: GoOptions = {}) {
  const s = useNavState.getState();
  const dir = opts.dir ?? "push";

  // Leaving onboarding into the app (14 → home, 02c → home, 06 → home…): start the tabs fresh.
  const entering = !s.tab && naturalTab(id) !== null && (id === "home" || SEGMENT_ROOTS.has(id));
  if ((dir === "none" && !opts.replace) || entering) {
    const tab = naturalTab(id);
    // From a tab into onboarding (e.g. Set Up Tara → 07a) is a push inside the tab, not a jump.
    if (dir !== "none" && s.tab && !tab) {
      commit({ ...s, id, dir, stack: [...s.stack, id] });
      return;
    }
    const tabStacks = tab ? { ...(s.tab === tab ? s.tabStacks : s.tabStacks) } : {};
    commit({ id, dir: entering && dir === "push" ? "none" : dir, tab, stack: tab ? naturalStack(id) : [id], tabStacks });
    return;
  }

  // Heading to a tab root from inside the tabs (e.g. the end of Set Up Tara → "home"):
  // land on that tab's root instead of stacking a copy of it.
  const rootTab = SEGMENT_ROOTS.has(id) ? naturalTab(id) : null;
  if (s.tab && rootTab && !opts.replace && (dir === "push" || dir === "pop")) {
    if (rootTab === s.tab) {
      const i = s.stack.lastIndexOf(id);
      if (i >= 0) { commit({ ...s, id, dir: "pop", stack: s.stack.slice(0, i + 1) }); return; }
      if (dir === "push" && s.stack.length > 1 && !SEGMENT_ROOTS.has(s.id)) {
        commit({ ...s, id, dir: "pop", stack: [id] }); return;
      }
    } else {
      const tabStacks = { ...s.tabStacks };
      tabStacks[s.tab] = [s.stack[0]];
      delete tabStacks[rootTab];
      commit({ id, dir: "none", tab: rootTab, stack: [id], tabStacks });
      return;
    }
  }

  let stack: ScreenId[];
  if (opts.replace) stack = [...s.stack.slice(0, -1), id];
  else if (dir === "pop" || dir === "instant") {
    const i = s.stack.lastIndexOf(id);
    stack = i >= 0 ? s.stack.slice(0, i + 1) : [...s.stack.slice(0, -1), id];
  } else stack = [...s.stack, id];
  commit({ ...s, id, dir, stack });
}

/** Where Back goes from the current screen: the previous screen in the stack, else BACK/PARENT. */
export function backTarget(): ScreenId | null {
  const s = useNavState.getState();
  if (s.tab) {
    if (s.stack.length > 1) return s.stack[s.stack.length - 2];
    return PARENT[s.id] ?? null;
  }
  return BACK[s.id] ?? null;
}

/** Back (button or swipe). `to` overrides the target. */
export function back(to?: ScreenId) {
  const target = to ?? backTarget();
  if (!target) return;
  go(target, { dir: "pop" });
}

/** Tab bar tap. Another tab: restore its stack with a cross-fade. Same tab: pop to its root. */
export function switchTab(tab: TabId) {
  const s = useNavState.getState();
  if (s.tab === tab) {
    if (s.stack.length > 1) commit({ ...s, id: s.stack[0], dir: "pop", stack: [s.stack[0]] });
    return;
  }
  const tabStacks = { ...s.tabStacks };
  if (s.tab) tabStacks[s.tab] = s.stack;
  let stack = tabStacks[tab] ?? [rootOf(tab)];
  // Nutrition finished its setup elsewhere: don't come back to the intro.
  if (tab === "nutrition" && useProto.getState().nutritionSetup && stack[0] === "N01") stack = ["R01"];
  delete tabStacks[tab];
  commit({ id: stack[stack.length - 1], dir: "none", tab, stack, tabStacks });
}

/** Leave the app tabs and go to an onboarding screen (sign out, reset). */
export function exitToOnboarding(id: ScreenId = "01") {
  commit({ id, dir: "none", tab: null, stack: [id], tabStacks: {} });
}

/** Called once on startup: deep link (#/R04) wins, else resume at the saved step. */
export function initNav() {
  const fromHash = location.hash.replace(/^#\/?/, "");
  const { step, done } = useProto.getState();
  const start: ScreenId = isScreenId(fromHash) ? fromHash : done ? (naturalTab(step) ? step : "home") : step;
  const tab = naturalTab(start);
  commit({ id: start, dir: "none", tab, stack: tab ? naturalStack(start) : [start], tabStacks: {} });

  // Someone edited the URL hash by hand: jump there with a cross-fade.
  const onHash = () => {
    const h = location.hash.replace(/^#\/?/, "");
    if (isScreenId(h) && h !== useNavState.getState().id) go(h, { dir: "none" });
  };
  window.addEventListener("hashchange", onHash);
  return () => window.removeEventListener("hashchange", onHash);
}

/** Hook for screens: current id plus navigation helpers. */
export function useNav() {
  const id = useNavState((s) => s.id);
  const tab = useNavState((s) => s.tab);
  const depth = useNavState((s) => s.stack.length);
  const canGoBack = tab ? depth > 1 || !!PARENT[id] : !!BACK[id];
  return { id, tab, go, back, switchTab, canGoBack };
}
