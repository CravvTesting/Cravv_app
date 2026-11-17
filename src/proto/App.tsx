"use client";

import { AnimatePresence, animate, motion, useMotionValue, useTransform, MotionConfig, type MotionValue } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { REGISTRY } from "@/screens/registry";
import { DebugMenu } from "./DebugMenu";
import { MOTION, useMotionTokens } from "./motion";
import { BACK, go, initNav, useNavState, type Direction } from "./nav";
import { useProto, type ScreenId } from "./store";
import { warmImages } from "./warmImages";

/*
 * iOS-style navigation.
 * - Push: incoming slides in from the right; outgoing moves left by MOTION.parallax and dims.
 * - Pop: the reverse. Reduced motion: cross-fade.
 * - Only transform and opacity animate (GPU-composited on iPhone). The dim is a black layer
 *   whose opacity is derived from the page's x, not a CSS filter.
 * - The slide starts after MOTION.pageDelay so the incoming screen renders and decodes its
 *   images while still off-screen; otherwise the first frames are dropped and the slide jumps.
 * - Edge swipe is interactive: the previous screen tracks the finger underneath, and releasing
 *   past the threshold completes the pop from where the finger left it.
 */

const EDGE = 24; // px from the left edge that starts a back swipe
const DIM = 0.35; // opacity of the dim on the covered screen

type Custom = { dir: Direction; reduced: boolean; w: number; delay: number };

const pageVariants = {
  enter: ({ dir, reduced, w }: Custom) =>
    dir === "instant" ? { x: 0, opacity: 1 } :
    reduced || dir === "none" ? { x: 0, opacity: 0 } :
    dir === "push" ? { x: w, opacity: 1, zIndex: 2 } :
    { x: -w * MOTION.parallax, opacity: 1, zIndex: 1 },
  center: { x: 0, opacity: 1 },
  exit: ({ dir, reduced, w }: Custom) =>
    dir === "instant" ? { opacity: 0, transition: { duration: 0 } } :
    reduced || dir === "none" ? { x: 0, opacity: 0, zIndex: 0 } :
    dir === "push" ? { x: -w * MOTION.parallax, zIndex: 1 } :
    { x: w, zIndex: 2 },
};

/** One screen plus its dim layer, both driven by the page's x motion value. */
function PageView({ pageId, x, w }: { pageId: ScreenId; x: MotionValue<number>; w: number }) {
  const { Component } = REGISTRY[pageId];
  const dim = useTransform(x, [-w * MOTION.parallax, 0], [DIM, 0], { clamp: true });
  return (
    <>
      <Component id={pageId} />
      <motion.div className="pointer-events-none absolute inset-0 z-[60] bg-black" style={{ opacity: dim }} aria-hidden />
    </>
  );
}

function usePageWidth() {
  const [w, setW] = useState(402);
  useLayoutEffect(() => {
    const read = () => setW(Math.min(window.innerWidth, 440));
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);
  return w;
}

export function App() {
  const [ready, setReady] = useState(false);
  const id = useNavState((s) => s.id);
  const dir = useNavState((s) => s.dir);
  const m = useMotionTokens();
  const slow = useProto((s) => s.debug.slowAnimations);
  const w = usePageWidth();

  // Wait for persisted state, then start the router (deep link or resume).
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    const start = () => { cleanup = initNav(); setReady(true); warmImages(); };
    if (useProto.persist.hasHydrated()) start();
    else {
      const unsub = useProto.persist.onFinishHydration(() => { unsub(); start(); });
    }
    // iOS Safari only applies :active styles when a touch listener exists.
    const noop = () => {};
    document.addEventListener("touchstart", noop, { passive: true });
    return () => { cleanup?.(); document.removeEventListener("touchstart", noop); };
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--motion-scale", slow ? "5" : "1");
  }, [slow]);

  // ----- interactive edge swipe -----
  const swipeX = useMotionValue(0); // finger offset of the current page
  const underX = useTransform(swipeX, [0, w], [-w * MOTION.parallax, 0]);
  const [swiping, setSwiping] = useState(false);
  const drag = useRef<{ x0: number; t0: number; lastX: number; lastT: number } | null>(null);

  const entry = REGISTRY[id];
  const pageId = (entry.base ?? id) as ScreenId;
  const groupKey = REGISTRY[pageId].group ?? pageId;
  const Overlay = entry.base ? entry.Component : null;
  const backTo = BACK[id];
  const canSwipe = ready && !Overlay && backTo !== null;
  const underId = backTo ? ((REGISTRY[backTo].base ?? backTo) as ScreenId) : null;

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!canSwipe) return;
    const left = e.currentTarget.getBoundingClientRect().left;
    if (e.clientX - left > EDGE) return;
    drag.current = { x0: e.clientX, t0: e.timeStamp, lastX: e.clientX, lastT: e.timeStamp };
    e.currentTarget.setPointerCapture(e.pointerId);
    setSwiping(true);
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    swipeX.set(Math.max(0, e.clientX - d.x0));
    d.lastX = e.clientX; d.lastT = e.timeStamp;
  };
  const onUp = async (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    const dx = e.clientX - d.x0;
    const v = (e.clientX - d.lastX) / Math.max(1, e.timeStamp - d.lastT) || dx / Math.max(1, e.timeStamp - d.t0);
    if (backTo && (dx > w * 0.35 || v > 0.5)) {
      await animate(swipeX, w, { ...m.page, velocity: v * 1000 });
      go(backTo, { dir: "instant" });
      swipeX.jump(0);
      setSwiping(false);
    } else {
      await animate(swipeX, 0, m.spring);
      setSwiping(false);
    }
  };

  if (!ready) return <div className="cravv-bg h-dvh" />;

  const custom: Custom = { dir, reduced: m.reduced, w, delay: MOTION.pageDelay * m.scale };
  const pageTransition = m.reduced || dir === "none" ? m.fade : { ...m.page, delay: dir === "instant" ? 0 : custom.delay };

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="relative mx-auto h-dvh w-full max-w-[440px] overflow-hidden bg-deep"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        {/* Previous screen, shown only while a back swipe is in progress. */}
        {swiping && underId && (
          <motion.div className="absolute inset-0 z-0 will-change-transform" style={{ x: underX }}>
            <PageView pageId={underId} x={underX} w={w} />
          </motion.div>
        )}
        <AnimatePresence initial={false} custom={custom}>
          <Page key={groupKey} pageId={pageId} custom={custom} transition={pageTransition} swipeX={swipeX} w={w} />
        </AnimatePresence>
        <AnimatePresence>{Overlay && <Overlay key={id} id={id} />}</AnimatePresence>
        <DebugMenu />
      </div>
    </MotionConfig>
  );
}

/** Animated page wrapper: x is a motion value so the dim can follow it. */
function Page({
  pageId, custom, transition, swipeX, w,
}: {
  pageId: ScreenId; custom: Custom; transition: object; swipeX: MotionValue<number>; w: number;
}) {
  const x = useMotionValue(custom.dir === "push" ? w : 0);
  // The page's on-screen x is its own transition x plus the live swipe offset.
  const shown = useTransform(() => x.get() + swipeX.get());
  return (
    <motion.div
      className="absolute inset-0 z-[1] will-change-transform shadow-[-10px_0_30px_rgba(0,0,0,0.45)]"
      style={{ x }}
      custom={custom}
      variants={pageVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={transition}
    >
      <motion.div className="absolute inset-0" style={{ x: swipeX }}>
        <PageView pageId={pageId} x={shown} w={w} />
      </motion.div>
    </motion.div>
  );
}
