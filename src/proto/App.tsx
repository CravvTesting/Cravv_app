"use client";

import { AnimatePresence, animate, motion, useMotionValue, MotionConfig } from "motion/react";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { REGISTRY } from "@/screens/registry";
import { DebugMenu } from "./DebugMenu";
import { MOTION, useMotionTokens } from "./motion";
import { BACK, back, initNav, useNavState, type Direction } from "./nav";
import { useProto } from "./store";

/*
 * Page transitions: iOS push/pop. Incoming slides in from the right; outgoing moves left by
 * MOTION.parallax and dims. Pop is the reverse. Reduced motion → cross-fade.
 */
const pageVariants = {
  enter: ({ dir, reduced }: { dir: Direction; reduced: boolean }) =>
    reduced || dir === "none" ? { x: 0, opacity: 0, zIndex: 1 } :
    dir === "push" ? { x: "100%", opacity: 1, zIndex: 2, filter: "brightness(1)" } :
    { x: `-${MOTION.parallax * 100}%`, opacity: 1, zIndex: 1, filter: "brightness(0.6)" },
  center: { x: 0, opacity: 1, filter: "brightness(1)" },
  exit: ({ dir, reduced }: { dir: Direction; reduced: boolean }) =>
    reduced || dir === "none" ? { x: 0, opacity: 0, zIndex: 0 } :
    dir === "push" ? { x: `-${MOTION.parallax * 100}%`, zIndex: 1, filter: "brightness(0.6)" } :
    { x: "100%", zIndex: 2, filter: "brightness(1)" },
};

const EDGE = 24; // px from the left edge that starts a back swipe

function Page({ pageId, canSwipe }: { pageId: keyof typeof REGISTRY; canSwipe: boolean }) {
  const { Component } = REGISTRY[pageId];
  const x = useMotionValue(0);
  const drag = useRef<{ startX: number; startT: number; active: boolean } | null>(null);
  const m = useMotionTokens();

  const onDown = (e: ReactPointerEvent) => {
    if (!canSwipe || e.clientX - (e.currentTarget as HTMLElement).getBoundingClientRect().left > EDGE) return;
    drag.current = { startX: e.clientX, startT: performance.now(), active: true };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: ReactPointerEvent) => {
    if (!drag.current?.active) return;
    x.set(Math.max(0, e.clientX - drag.current.startX));
  };
  const onUp = (e: ReactPointerEvent) => {
    if (!drag.current?.active) return;
    const width = (e.currentTarget as HTMLElement).clientWidth;
    const dx = e.clientX - drag.current.startX;
    const v = dx / Math.max(1, performance.now() - drag.current.startT); // px/ms
    drag.current = null;
    if (dx > width * 0.35 || v > 0.6) back();
    else animate(x, 0, m.spring);
  };

  return (
    <motion.div
      className="absolute inset-0"
      style={{ x }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <Component id={pageId} />
    </motion.div>
  );
}

export function App() {
  const [ready, setReady] = useState(false);
  const id = useNavState((s) => s.id);
  const dir = useNavState((s) => s.dir);
  const m = useMotionTokens();
  const slow = useProto((s) => s.debug.slowAnimations);

  // Wait for persisted state, then start the router (deep link or resume).
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    const start = () => { cleanup = initNav(); setReady(true); };
    if (useProto.persist.hasHydrated()) start();
    else {
      const unsub = useProto.persist.onFinishHydration(() => { unsub(); start(); });
    }
    return () => cleanup?.();
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--motion-scale", slow ? "5" : "1");
  }, [slow]);

  if (!ready) return <div className="cravv-bg h-dvh" />;

  const entry = REGISTRY[id];
  const pageId = entry.base ?? id;
  const pageEntry = REGISTRY[pageId];
  const groupKey = pageEntry.group ?? pageId;
  const Overlay = entry.base ? entry.Component : null;
  const custom = { dir, reduced: m.reduced };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative mx-auto h-dvh w-full max-w-[440px] overflow-hidden bg-deep">
        <AnimatePresence initial={false} custom={custom}>
          <motion.div
            key={groupKey}
            className="absolute inset-0"
            custom={custom}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={m.reduced ? m.fade : m.page}
          >
            <Page pageId={pageId} canSwipe={!Overlay && BACK[id] !== null} />
          </motion.div>
        </AnimatePresence>
        <AnimatePresence>{Overlay && <Overlay key={id} id={id} />}</AnimatePresence>
        <DebugMenu />
      </div>
    </MotionConfig>
  );
}
