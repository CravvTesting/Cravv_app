"use client";

/*
 * 10 · Wi-Fi and 10x · Wrong password (one component, grouped in the registry).
 * Home WiFi is preselected; tapping another network swaps it into the card.
 * Join Network: spinner for TIMING.wifiJoin, then 10x once (debug "wrong password once"),
 * or a brief check (motion moment 6) and on to 10b / 11.
 */
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Icon, PrimaryButton, SectionTitle, TextField } from "@/components/cravv";
import { useMotionTokens } from "@/proto/motion";
import { go } from "@/proto/nav";
import { useProto } from "@/proto/store";
import { useTiming, wait } from "@/proto/timing";
import { Screen, ScreenHeader } from "@/proto/ui";
import type { ScreenProps } from "./registry";

type Network = { name: string; locked: boolean; hint: string };

const NETWORKS: readonly Network[] = [
  { name: "Home WiFi", locked: true, hint: "Your iPhone’s network" },
  { name: "TP-Link_5G", locked: true, hint: "Secured network" },
  { name: "Netgear_Guest", locked: false, hint: "Open network" },
];

/** Simulated saved password for the iPhone's network (shows as 10 dots). */
const SAVED_PASSWORD = "kitchen123";

/** iOS list separator: gray-600 at 60%, hairline. */
const SEPARATOR = "color-mix(in srgb, var(--cravv-gray-600) 60%, transparent)";

export default function S10({ id }: ScreenProps) {
  const m = useMotionTokens();
  const ms = useTiming();
  const wrong = id === "10x";
  const [selected, setSelected] = useState(NETWORKS[0].name);
  const [password, setPassword] = useState(SAVED_PASSWORD);
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const network = NETWORKS.find((n) => n.name === selected) ?? NETWORKS[0];
  const others = NETWORKS.filter((n) => n.name !== selected);
  const busy = phase !== "idle";
  const canJoin = !network.locked || password.length > 0;

  const pick = (n: Network) => {
    if (busy) return;
    setSelected(n.name);
    setPassword(n.name === NETWORKS[0].name ? SAVED_PASSWORD : "");
    if (wrong) go("10", { dir: "none" });
  };

  const edit = (v: string) => {
    setPassword(v);
    if (wrong) go("10", { dir: "none" });
  };

  const join = async () => {
    if (busy || !canJoin) return;
    setPhase("loading");
    await wait(ms("wifiJoin"));
    if (!alive.current) return;
    const { debug, wrongPasswordShown, set } = useProto.getState();
    if (network.locked && debug.wifi === "wrong-once" && !wrongPasswordShown) {
      set({ wrongPasswordShown: true });
      setPhase("idle");
      go("10x", { dir: "none" });
      return;
    }
    setPhase("done");
    set({ wifi: network.name });
    // The check beat is a third of the join time, so the Speed setting scales it too.
    await wait(ms("wifiJoin") / 3);
    if (!alive.current) return;
    go(useProto.getState().debug.updatePending ? "10b" : "11");
  };

  const rowT = m.reduced ? m.fade : m.spring;

  return (
    <Screen
      header={<ScreenHeader steps={4} current={2} />}
      footer={
        <PrimaryButton loading={phase === "loading"} done={phase === "done"} disabled={!canJoin} onClick={join}>
          Join Network
        </PrimaryButton>
      }
    >
      <h1 className="text-[34px] font-bold leading-[41px] tracking-[0.4px]">Connect to Wi-Fi</h1>

      {/* Network preview card (same card as the Stove preview). */}
      <div
        className="mt-[11px] flex h-[150px] items-center gap-5 rounded-[20px] border border-white/[0.06] p-[10px]"
        style={{ background: "#1a1a1d" /* card fill from Figma; no token exists (same as StovePreview) */ }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/wifi/network-thumb.svg" alt="" width={126} height={126} className="shrink-0" />
        <div className="relative min-w-0 flex-1 pb-[3px]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={network.name}
              initial={m.reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={m.reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={rowT}
            >
              <p className="truncate text-[24px] font-semibold leading-[29px] text-white">{network.name}</p>
              <p className="mt-[5px] text-[17px] leading-5 text-secondary">{network.hint}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Password (collapses for open networks). */}
      <AnimatePresence initial={false}>
        {network.locked && (
          <motion.section
            key="password"
            className="overflow-hidden"
            initial={m.reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={m.reduced ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={m.reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={rowT}
          >
            <SectionTitle className="pt-[17px]">Password</SectionTitle>
            <TextField
              label={`Password for ${network.name}`}
              type="password"
              value={password}
              onChange={edit}
              onSubmit={join}
              enterKeyHint="go"
              error={wrong ? "Wrong password. Check it and try again." : undefined}
              // The library prints the error as plain text; keep it for screen readers and draw the
              // frame's icon + semibold line below instead.
              className="[&_[role=alert]]:sr-only"
            />
            <div className="h-6 px-4 pt-2 text-[13px] leading-4">
              {wrong ? (
                <p aria-hidden className="flex items-center gap-1.5 font-semibold text-alert">
                  <AlertGlyph />
                  Wrong password. Check it and try again.
                </p>
              ) : (
                <p className="text-secondary">Tara needs Wi-Fi to guide you by voice.</p>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <SectionTitle className="pt-6">Other networks</SectionTitle>
      <div className="mb-4 overflow-hidden rounded-[26px] bg-raised" role="list" aria-label="Other networks">
        <AnimatePresence initial={false} mode="popLayout">
          {others.map((n, i) => (
            <motion.button
              key={n.name}
              layout={!m.reduced}
              type="button"
              role="listitem"
              onClick={() => pick(n)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={rowT}
              className="relative flex h-[52px] w-full items-center gap-3.5 px-4 text-left active:bg-white/5"
              aria-label={`${n.name}${n.locked ? ", secured" : ", open"}`}
            >
              <Icon name="wifi" size={22} style={{ color: "var(--cravv-option-icon-off)" }} />
              <span className="min-w-0 flex-1 truncate text-[17px] text-white">{n.name}</span>
              {n.locked && (
                <span className="mr-1 flex size-4 items-center justify-center">
                  <Icon name="lock" size={16} style={{ color: "var(--cravv-option-icon-off)" }} />
                </span>
              )}
              <span
                aria-hidden
                className="absolute bottom-0 right-0 h-px"
                style={{ left: i === others.length - 1 ? 16 : 52, background: SEPARATOR }}
              />
            </motion.button>
          ))}
        </AnimatePresence>
        <button type="button" className="flex h-[52px] w-full items-center px-4 text-left text-[17px] text-accent active:bg-white/5">
          Other Network…
        </button>
      </div>
    </Screen>
  );
}

/** Icon · alert (16px) from 10x. Not in the Cravv icon set, so drawn here with tokens. */
function AlertGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
      <circle cx="8" cy="8" r="6.667" fill="var(--cravv-status-alert)" />
      <path d="M8 4.667V9M8 11.333v.134" stroke="var(--cravv-bg-page)" strokeWidth="1.733" strokeLinecap="round" />
    </svg>
  );
}
