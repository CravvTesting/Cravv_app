"use client";

/*
 * Debug menu (handoff section 5). Open with a three-finger tap anywhere, or ?debug=1.
 * Bottom sheet: jump to any screen, force every branch, speed, slow animations, reset.
 */
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { SCREEN_NAMES } from "@/screens/registry";
import { MOTION, useMotionTokens } from "./motion";
import { go, useNavState } from "./nav";
import { SCREEN_IDS, useProto, type Debug } from "./store";

type Opt<K extends keyof Debug> = { value: Debug[K]; label: string };

function Seg<K extends keyof Debug>({ label, k, options }: { label: string; k: K; options: Opt<K>[] }) {
  const value = useProto((s) => s.debug[k]);
  const setDebug = useProto((s) => s.setDebug);
  return (
    <div className="py-2">
      <p className="mb-1.5 text-[13px] text-secondary">{label}</p>
      <div className="flex rounded-[10px] bg-secondary-surface p-0.5" role="radiogroup" aria-label={label}>
        {options.map((o) => {
          const on = o.value === value;
          return (
            <button
              key={String(o.value)}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setDebug({ [k]: o.value } as Partial<Debug>)}
              className={`h-8 flex-1 rounded-[8px] px-1 text-[13px] ${on ? "bg-white/25 font-semibold text-white" : "text-white/70"}`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-4">
      <h3 className="mb-1 text-[13px] font-semibold uppercase tracking-wide text-white/50">{title}</h3>
      <div className="rounded-[14px] bg-raised px-3 py-1">{children}</div>
    </section>
  );
}

export function DebugMenu() {
  const [open, setOpen] = useState(false);
  const current = useNavState((s) => s.id);
  const reset = useProto((s) => s.reset);
  const m = useMotionTokens();

  useEffect(() => {
    try { if (new URLSearchParams(location.search).get("debug") === "1") setOpen(true); } catch { /* ignore */ }
    const onTouch = (e: TouchEvent) => { if (e.touches.length === 3) { e.preventDefault(); setOpen(true); } };
    // Keyboard shortcut for desktop review: press "d" three times… or just Shift+D.
    const onKey = (e: KeyboardEvent) => { if (e.key === "D" && e.shiftKey) setOpen((o) => !o); };
    window.addEventListener("touchstart", onTouch, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("touchstart", onTouch); window.removeEventListener("keydown", onKey); };
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-[100] flex flex-col justify-end">
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 0 }} animate={{ opacity: MOTION.dimOpacity }} exit={{ opacity: 0 }}
            transition={m.fade}
            onClick={() => setOpen(false)}
          />
          <motion.div
            role="dialog"
            aria-label="Debug menu"
            className="relative max-h-[88dvh] overflow-y-auto rounded-t-[24px] bg-recessed px-4 pt-2"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 20px)" }}
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={m.sheet}
          >
            <div className="mx-auto mb-2 h-[5px] w-9 rounded-full bg-white/25" />
            <div className="flex items-center justify-between">
              <h2 className="text-[22px] font-bold">Debug</h2>
              <button type="button" onClick={() => setOpen(false)} className="h-11 px-2 text-[17px] font-semibold text-accent">Done</button>
            </div>

            <Group title="Jump to screen">
              <div className="grid grid-cols-2 gap-1 py-2">
                {SCREEN_IDS.map((sid) => (
                  <button
                    key={sid}
                    type="button"
                    onClick={() => { go(sid, { dir: "none" }); setOpen(false); }}
                    className={`flex h-10 items-center gap-2 rounded-[10px] px-2 text-left text-[13px] ${sid === current ? "bg-white/15" : "active:bg-white/10"}`}
                  >
                    <span className="w-9 shrink-0 font-mono text-[12px] text-accent">{sid}</span>
                    <span className="truncate">{SCREEN_NAMES[sid]}</span>
                  </button>
                ))}
              </div>
            </Group>

            <Group title="Branches">
              <Seg label="Sign-in" k="signIn" options={[{ value: "succeeds", label: "Succeeds" }, { value: "cancelled", label: "Cancelled (02x)" }]} />
              <Seg label="Bluetooth permission" k="bluetooth" options={[{ value: "allow", label: "Allow" }, { value: "deny", label: "Deny (07c)" }]} />
              <Seg label="Find Tara" k="find" options={[{ value: "found", label: "Found" }, { value: "cant-find", label: "Can’t find" }, { value: "already-set-up", label: "Set up (09x)" }]} />
              <Seg label="Wi-Fi" k="wifi" options={[{ value: "joins", label: "Joins" }, { value: "wrong-once", label: "Wrong once (10x)" }]} />
              <Seg label="Update pending (10b)" k="updatePending" options={[{ value: false, label: "Off" }, { value: true, label: "On" }]} />
              <Seg label="Calibration result" k="calibration" options={[{ value: "match", label: "Match" }, { value: "fewer", label: "Fewer (13x)" }, { value: "more", label: "More (13y)" }]} />
              <Seg label="Drop Wi-Fi during calibration (13p)" k="dropWifi" options={[{ value: false, label: "Off" }, { value: true, label: "On" }]} />
              <Seg label="Ending" k="ending" options={[{ value: "14", label: "14 All set" }, { value: "14b", label: "14b First cook" }]} />
            </Group>

            <Group title="Playback">
              <Seg label="Speed (simulation timers)" k="speed" options={[{ value: 0.5, label: "0.5×" }, { value: 1, label: "1×" }, { value: 2, label: "2×" }]} />
              <Seg label="Slow animations ×5" k="slowAnimations" options={[{ value: false, label: "Off" }, { value: true, label: "On" }]} />
            </Group>

            <button
              type="button"
              onClick={() => { reset(); go("01", { replace: true, dir: "none" }); setOpen(false); }}
              className="mt-5 h-[52px] w-full rounded-full bg-secondary-surface text-[17px] font-semibold text-alert"
            >
              Reset prototype
            </button>
            <p className="mt-3 text-center text-[12px] text-white/40">Three-finger tap or ?debug=1 opens this menu. Shift+D on desktop.</p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
