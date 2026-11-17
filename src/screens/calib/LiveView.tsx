"use client";

/*
 * Live camera view for 13 · Calibrating and its states (13p/13r/13s/13x/13y).
 * Frames 2537:2804, 2628:4717, 2628:4770, 2537:2904, 2537:3002, 2541:2813.
 *
 * Local piece: the frame's live view uses 18px / 2.5px corner brackets inset 16px that change
 * colour with the outcome (copper → green / amber). The library Viewfinder draws 11.5px / 1.5px
 * copper-only corners pinned to the edges, so it can't express this frame.
 */
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useMotionTokens } from "@/proto/motion";

export type LiveTone = "copper" | "success" | "warning";

const TONE: Record<LiveTone, string> = {
  copper: "var(--cravv-copper-500)",
  success: "var(--cravv-status-success)",
  warning: "var(--cravv-status-warning)",
};

const CORNERS = [
  { k: "tl", pos: "left-4 top-4", rot: 0, dx: 1, dy: 1 },
  { k: "tr", pos: "right-4 top-4", rot: 90, dx: -1, dy: 1 },
  { k: "br", pos: "right-4 bottom-4", rot: 180, dx: -1, dy: -1 },
  { k: "bl", pos: "left-4 bottom-4", rot: 270, dx: 1, dy: -1 },
] as const;

/** Four corner brackets. `breathe` makes them drift inward and back while Tara is looking. */
function Brackets({ tone, breathe }: { tone: LiveTone; breathe: boolean }) {
  const m = useMotionTokens();
  const on = breathe && !m.reduced;
  return (
    <>
      {CORNERS.map((c) => (
        <motion.svg
          key={c.k}
          aria-hidden
          width="20.5"
          height="20.5"
          viewBox="0 0 20.5 20.5"
          fill="none"
          className={`pointer-events-none absolute -m-[1.25px] ${c.pos}`}
          style={{ rotate: c.rot }}
          animate={on ? { x: [0, c.dx * 4, 0], y: [0, c.dy * 4, 0], opacity: [1, 0.7, 1] } : { x: 0, y: 0, opacity: 1 }}
          transition={on ? { duration: 1.6 * m.scale, ease: "easeInOut", repeat: Infinity } : m.spring}
        >
          <path
            d="M1.25 19.25V1.25H19.25"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ stroke: TONE[tone], transition: `stroke ${0.3 * m.scale}s ease` }}
          />
        </motion.svg>
      ))}
    </>
  );
}

/** Small dark glass pill used on the camera feed. */
export function FeedPill({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex h-7 items-center gap-1.5 rounded-[14px] bg-black/50 pl-2.5 pr-3 whitespace-nowrap text-white backdrop-blur-[7px] ${className}`}>
      {children}
    </div>
  );
}

export function Dot({ color, size = 7 }: { color: string; size?: number }) {
  return <span aria-hidden className="shrink-0 rounded-full" style={{ width: size, height: size, background: color, transition: "background 0.3s" }} />;
}

export function LiveView({
  tone,
  breathe,
  chip,
  offline,
}: {
  tone: LiveTone;
  breathe: boolean;
  /** Bottom chip ("Tara sees 3 burners…"); null hides it. */
  chip: ReactNode;
  /** 13p: dim the feed and show "Tara lost Wi-Fi". */
  offline: boolean;
}) {
  const m = useMotionTokens();
  return (
    <div
      className="relative w-full overflow-hidden rounded-[26px] bg-black"
      // 300px as in the frames; shrinks on short phones (375×667) so the result card stays in view.
      style={{ height: "clamp(200px, calc(100dvh - 560px), 300px)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/img/calib/live-view.webp" alt="Live view of your stove from Tara's camera" className="absolute inset-0 size-full object-cover" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.55) 100%)" }}
      />
      <Brackets tone={tone} breathe={breathe} />
      <FeedPill className="absolute left-7 top-[26px]">
        <Dot color="var(--cravv-status-alert)" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.66px]">Live</span>
      </FeedPill>
      <FeedPill className="absolute right-7 top-[26px] pl-2.5">
        <span className="text-[11px] font-medium">Camera module</span>
      </FeedPill>
      <div className="absolute inset-x-0 bottom-5 flex justify-center">
        <AnimatePresence initial={false}>
          {chip && (
            <motion.div
              key="chip"
              initial={{ opacity: 0, y: m.reduced ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={m.reduced ? m.fade : m.spring}
            >
              {chip}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence initial={false}>
        {offline && (
          <motion.div
            key="offline"
            className="absolute inset-0 flex flex-col items-center justify-center rounded-[26px] bg-black/62 pb-2 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 * m.scale }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/calib/wifi-off.svg" alt="" width={36} height={36} />
            <p className="mt-3 text-[17px] font-semibold text-white">Tara lost Wi-Fi</p>
            <p className="mt-1 text-[13px]" style={{ color: "rgba(235,235,245,0.7)" }}>
              Reconnecting… keep Tara plugged in.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
