/**
 * Simulated Tara device for the Connect phase (screens 07–10x).
 * No real Bluetooth or Wi-Fi: every call resolves on a timer. Swap these
 * functions for the real BLE provisioning API later; the screens only use
 * what is exported here.
 */

export type SearchScenario = "found" | "notfound";

/** How long the fake search takes to find Tara. */
export const SEARCH_FIND_MS = 2500;
/** Design note 08x: "Shown after 30 seconds without a match." */
export const SEARCH_TIMEOUT_MS = 30_000;
/** ?scenario=notfound fast-forwards the 30 s timeout so reviewers needn't wait. */
export const REVIEW_TIMEOUT_MS = 3000;

export const PAIR_MS = 900;
export const JOIN_MS = 1500;

export function scenarioFrom(param: string | null): SearchScenario {
  return param === "notfound" ? "notfound" : "found";
}

/**
 * Starts a search. Calls onFound when Tara shows up, or onTimeout when nothing
 * matched in time. Returns a cancel function.
 */
export function startSearch(
  scenario: SearchScenario,
  handlers: { onFound: () => void; onTimeout: () => void }
): () => void {
  const timers: ReturnType<typeof setTimeout>[] = [];
  if (scenario === "found") {
    timers.push(setTimeout(handlers.onFound, SEARCH_FIND_MS));
    timers.push(setTimeout(handlers.onTimeout, SEARCH_TIMEOUT_MS)); // never reached: found first
  } else {
    timers.push(setTimeout(handlers.onTimeout, REVIEW_TIMEOUT_MS));
  }
  return () => timers.forEach(clearTimeout);
}

/** Pairs with the device that showed the given code. */
export function pairDevice(code: string): Promise<{ code: string }> {
  return new Promise((resolve) => setTimeout(() => resolve({ code }), PAIR_MS));
}

export type Network = {
  ssid: string;
  secured: boolean;
  /** Subtitle under the chosen network. */
  note?: string;
};

/** What Tara "sees" nearby. The first one is the network this phone is on. */
export const NETWORKS: Network[] = [
  { ssid: "Home WiFi", secured: true, note: "Your iPhone’s network" },
  { ssid: "TP-Link_5G", secured: true },
  { ssid: "Netgear_Guest", secured: false },
];

export function networkSubtitle(n: Network) {
  return n.note ?? (n.secured ? "Secured network" : "Open network");
}

export type JoinError = "wrong-password" | "too-short";

/**
 * Joins a network. The password "wrong", or any password shorter than 8
 * characters on a secured network, fails (screen 10x).
 */
export function joinNetwork(n: Network, password: string): Promise<{ ok: true } | { ok: false; error: JoinError }> {
  return new Promise((resolve) =>
    setTimeout(() => {
      if (!n.secured) return resolve({ ok: true });
      if (password === "wrong") return resolve({ ok: false, error: "wrong-password" });
      if (password.length < 8) return resolve({ ok: false, error: "too-short" });
      resolve({ ok: true });
    }, JOIN_MS)
  );
}
