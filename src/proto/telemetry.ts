"use client";

/*
 * Diagnostics for testing on real iPhones (where we can't attach a debugger).
 * After every screen change, records what is actually on screen: each page layer's box,
 * transform, opacity, and the element at the centre of the viewport. Errors are sent too.
 * Goes to /api/log → Vercel runtime logs.
 */
import { useNavState } from "./nav";

const session = Math.random().toString(36).slice(2, 8);

export function diag(event: string, data: Record<string, unknown> = {}) {
  try {
    const payload = JSON.stringify({ s: session, t: Math.round(performance.now()), event, hash: location.hash, ...data });
    if (!navigator.sendBeacon?.("/api/log", payload)) {
      fetch("/api/log", { method: "POST", body: payload, keepalive: true }).catch(() => {});
    }
  } catch { /* ignore */ }
}

function describe(el: Element | null) {
  if (!el) return null;
  const c = typeof el.className === "string" ? el.className : "";
  return `${el.tagName.toLowerCase()}.${c.split(" ").slice(0, 4).join(".")}`;
}

export function snapshot(label: string) {
  try {
    const layers = [...document.querySelectorAll<HTMLElement>("[data-layer]")].map((el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        key: el.dataset.layer, page: el.dataset.page,
        box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)],
        transform: cs.transform, opacity: cs.opacity, z: cs.zIndex, vis: cs.visibility,
        anims: el.getAnimations?.().length ?? 0,
        dim: (el.querySelector("[data-dim]") as HTMLElement | null)?.style.opacity,
        kids: el.children.length,
      };
    });
    const center = describe(document.elementFromPoint(innerWidth / 2, innerHeight / 2));
    const top = describe(document.elementFromPoint(innerWidth / 2, 80));
    diag("snapshot", { label, vw: innerWidth, vh: innerHeight, layers, center, top, ua: navigator.userAgent });
  } catch (e) {
    diag("snapshot-failed", { message: String(e) });
  }
}

let started = false;
export function startTelemetry() {
  if (started) return;
  started = true;
  snapshot("boot");
  let timer: ReturnType<typeof setTimeout> | undefined;
  useNavState.subscribe((s, prev) => {
    if (s.id === prev.id) return;
    diag("nav", { from: prev.id, to: s.id, dir: s.dir });
    clearTimeout(timer);
    setTimeout(() => snapshot(`+200ms ${s.id}`), 200);
    timer = setTimeout(() => snapshot(`+1500ms ${s.id}`), 1500);
  });
  window.addEventListener("error", (e) => diag("error", { message: e.message, stack: e.error?.stack?.slice(0, 1500) }));
  window.addEventListener("unhandledrejection", (e) => diag("rejection", { message: String((e.reason as Error)?.message ?? e.reason), stack: (e.reason as Error)?.stack?.slice(0, 1500) }));
}
