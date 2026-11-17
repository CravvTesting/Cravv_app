"use client";

import { AnimatePresence, MotionConfig } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { REGISTRY } from "@/screens/registry";
import { DebugMenu } from "./DebugMenu";
import { MOTION, useMotionTokens } from "./motion";
import { BACK, go, initNav, useNavState, type Direction } from "./nav";
import { useProto, type ScreenId } from "./store";
import { warmImages } from "./warmImages";

/*
 * iOS-style navigation stack.
 *
 * Why it's built this way: JS-driven animations (requestAnimationFrame) stutter whenever React
 * renders, which is exactly when a screen is pushed. So page transitions use the Web Animations
 * API on transform/opacity only. Those run on the compositor thread, like UIKit's, and keep
 * moving even while the main thread is busy mounting the next screen.
 *
 * - Push: incoming slides in from the right; outgoing moves left by MOTION.parallax under a dim.
 * - Pop: the reverse. "none" cross-fades (debug jumps, reduced motion). "instant" doesn't animate.
 * - The animation starts after the incoming screen has painted (two frames), so its first frame
 *   is never dropped.
 * - Edge swipe: the previous screen is mounted underneath on touch-down; during the drag both
 *   screens are moved by writing transforms directly (no React renders). On release the rest of
 *   the movement is handed to the compositor. The underneath layer then *becomes* the current
 *   screen (same React key), so nothing remounts or flashes.
 */

const EDGE = 28; // px from the left edge that starts a back swipe
const DIM = 0.35; // dim on the covered screen

type Layer = { key: string; pageId: ScreenId; group: string };

const groupOf = (pageId: ScreenId) => REGISTRY[pageId].group ?? pageId;
const pageOf = (id: ScreenId) => (REGISTRY[id].base ?? id) as ScreenId;
const tx = (x: number) => `translate3d(${x}px,0,0)`;

let layerSeq = 0;
const newLayer = (pageId: ScreenId): Layer => ({ key: `L${++layerSeq}`, pageId, group: groupOf(pageId) });

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

/** Two frames: the first runs before the next paint, the second after it. */
const afterPaint = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

export function App() {
  const [ready, setReady] = useState(false);
  const id = useNavState((s) => s.id);
  const dir = useNavState((s) => s.dir);
  const m = useMotionTokens();
  const slow = useProto((s) => s.debug.slowAnimations);
  const w = usePageWidth();

  const [layers, setLayers] = useState<Layer[]>([]);
  const pageEls = useRef(new Map<string, HTMLDivElement>());
  const dimEls = useRef(new Map<string, HTMLDivElement>());
  const running = useRef<Animation[]>([]);
  const busy = useRef(false); // a transition or swipe is in progress

  // Boot: wait for persisted state, then start the router (deep link or resume).
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    const start = () => {
      cleanup = initNav();
      setLayers([newLayer(pageOf(useNavState.getState().id))]);
      setReady(true);
      warmImages();
    };
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

  const finishRunning = () => {
    running.current.forEach((a) => { try { a.finish(); } catch { /* ignore */ } });
    running.current = [];
  };

  const opts = useCallback(
    (ms: number): KeyframeAnimationOptions => ({ duration: ms * m.scale, easing: MOTION.easeCss, fill: "both" }),
    [m.scale]
  );

  // ----- route changes → layers + compositor transition -----
  const pending = useRef<{ dir: Direction; inKey: string; outKey: string } | null>(null);
  useEffect(() => {
    if (!ready) return;
    const pageId = pageOf(id);
    setLayers((ls) => {
      const top = ls[ls.length - 1];
      if (!top) return [newLayer(pageId)];
      // Same group (02↔02b, 13↔13s…): same screen component, it animates internally.
      if (top.group === groupOf(pageId)) {
        return top.pageId === pageId ? ls : [...ls.slice(0, -1), { ...top, pageId }];
      }
      // End of an edge swipe: the layer underneath is already this screen; promote it.
      const under = ls[ls.length - 2];
      if (dir === "instant" && under && under.group === groupOf(pageId)) {
        return [{ ...under, pageId }];
      }
      finishRunning();
      const incoming = newLayer(pageId);
      const effective: Direction = m.reduced && (dir === "push" || dir === "pop") ? "none" : dir;
      pending.current = effective === "instant" ? null : { dir: effective, inKey: incoming.key, outKey: top.key };
      return effective === "instant" ? [incoming] : [top, incoming];
    });
  }, [id, dir, ready, m.reduced]);

  // Runs after the incoming layer is in the DOM.
  useLayoutEffect(() => {
    const p = pending.current;
    if (!p) return;
    pending.current = null;
    const inEl = pageEls.current.get(p.inKey);
    const outEl = pageEls.current.get(p.outKey);
    const inDim = dimEls.current.get(p.inKey);
    const outDim = dimEls.current.get(p.outKey);
    if (!inEl || !outEl) return;
    busy.current = true;

    // Initial state before the first paint, so nothing flashes.
    if (p.dir === "push") { inEl.style.transform = tx(w); inEl.style.zIndex = "2"; outEl.style.zIndex = "1"; }
    if (p.dir === "pop") { inEl.style.transform = tx(-w * MOTION.parallax); inEl.style.zIndex = "1"; outEl.style.zIndex = "2"; if (inDim) inDim.style.opacity = String(DIM); }
    if (p.dir === "none") { inEl.style.opacity = "0"; inEl.style.zIndex = "2"; }

    (async () => {
      await afterPaint();
      const o = opts(p.dir === "none" ? 220 : MOTION.pageMs);
      const anims: Animation[] = [];
      if (p.dir === "push") {
        anims.push(inEl.animate([{ transform: tx(w) }, { transform: tx(0) }], o));
        anims.push(outEl.animate([{ transform: tx(0) }, { transform: tx(-w * MOTION.parallax) }], o));
        if (outDim) anims.push(outDim.animate([{ opacity: 0 }, { opacity: DIM }], o));
      } else if (p.dir === "pop") {
        anims.push(inEl.animate([{ transform: tx(-w * MOTION.parallax) }, { transform: tx(0) }], o));
        if (inDim) anims.push(inDim.animate([{ opacity: DIM }, { opacity: 0 }], o));
        anims.push(outEl.animate([{ transform: tx(0) }, { transform: tx(w) }], o));
      } else {
        anims.push(inEl.animate([{ opacity: 0 }, { opacity: 1 }], o));
        anims.push(outEl.animate([{ opacity: 1 }, { opacity: 0 }], o));
      }
      running.current = anims;
      try { await Promise.all(anims.map((a) => a.finished)); } catch { /* finished early or cancelled */ }
      // Settle: clear inline styles, drop the outgoing layer.
      inEl.style.transform = ""; inEl.style.opacity = ""; inEl.style.zIndex = "";
      if (inDim) inDim.style.opacity = "";
      anims.forEach((a) => { try { a.cancel(); } catch { /* ignore */ } });
      running.current = [];
      busy.current = false;
      setLayers((ls) => ls.filter((l) => l.key === p.inKey || ls.indexOf(l) > ls.findIndex((x) => x.key === p.inKey)));
    })();
  }, [layers, opts, w]);

  // ----- interactive edge swipe -----
  const drag = useRef<{ x0: number; lastX: number; lastT: number; v: number; dx: number; topKey: string; underKey: string } | null>(null);
  const backTo = BACK[id];
  const isOverlay = !!REGISTRY[id].base;

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!ready || busy.current || isOverlay || !backTo || layers.length !== 1) return;
    const left = e.currentTarget.getBoundingClientRect().left;
    if (e.clientX - left > EDGE) return;
    const top = layers[0];
    const under = newLayer(pageOf(backTo));
    busy.current = true;
    drag.current = { x0: e.clientX, lastX: e.clientX, lastT: e.timeStamp, v: 0, dx: 0, topKey: top.key, underKey: under.key };
    e.currentTarget.setPointerCapture(e.pointerId);
    setLayers([under, top]);
  };

  // Place the freshly mounted underneath layer.
  useLayoutEffect(() => {
    const d = drag.current;
    if (!d) return;
    const under = pageEls.current.get(d.underKey);
    const dim = dimEls.current.get(d.underKey);
    if (under && !under.dataset.placed) {
      under.dataset.placed = "1";
      under.style.transform = tx(-w * MOTION.parallax + d.dx * MOTION.parallax);
      if (dim) dim.style.opacity = String(DIM * (1 - d.dx / w));
    }
  }, [layers, w]);

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = Math.max(0, Math.min(w, e.clientX - d.x0));
    const dt = Math.max(1, e.timeStamp - d.lastT);
    d.v = 0.8 * ((e.clientX - d.lastX) / dt) + 0.2 * d.v; // px/ms, smoothed
    d.lastX = e.clientX; d.lastT = e.timeStamp; d.dx = dx;
    const top = pageEls.current.get(d.topKey);
    const under = pageEls.current.get(d.underKey);
    const dim = dimEls.current.get(d.underKey);
    if (top) top.style.transform = tx(dx);
    if (under) under.style.transform = tx(-w * MOTION.parallax + dx * MOTION.parallax);
    if (dim) dim.style.opacity = String(DIM * (1 - dx / w));
  };

  const onPointerUp = async () => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    const top = pageEls.current.get(d.topKey);
    const under = pageEls.current.get(d.underKey);
    const dim = dimEls.current.get(d.underKey);
    const commit = d.dx > w * 0.35 || (d.v > 0.35 && d.dx > 10);
    const remaining = commit ? w - d.dx : d.dx;
    // Duration follows the distance left (and the flick speed), like UIKit's interactive pop.
    const ms = Math.max(160, Math.min(MOTION.pageMs, remaining / Math.max(0.6, Math.abs(d.v)) * 1.6));
    const o = opts(ms);
    const anims: Animation[] = [];
    const underFrom = -w * MOTION.parallax + d.dx * MOTION.parallax;
    if (top) anims.push(top.animate([{ transform: tx(d.dx) }, { transform: tx(commit ? w : 0) }], o));
    if (under) anims.push(under.animate([{ transform: tx(underFrom) }, { transform: tx(commit ? 0 : -w * MOTION.parallax) }], o));
    if (dim) anims.push(dim.animate([{ opacity: DIM * (1 - d.dx / w) }, { opacity: commit ? 0 : DIM }], o));
    running.current = anims;
    try { await Promise.all(anims.map((a) => a.finished)); } catch { /* ignore */ }
    if (under) { under.style.transform = ""; delete under.dataset.placed; }
    if (dim) dim.style.opacity = "";
    if (top) top.style.transform = "";
    anims.forEach((a) => { try { a.cancel(); } catch { /* ignore */ } });
    running.current = [];
    busy.current = false;
    if (commit && backTo) go(backTo, { dir: "instant" });
    else setLayers((ls) => ls.filter((l) => l.key !== d.underKey));
  };

  if (!ready) return <div className="cravv-bg h-dvh" />;

  const Overlay = isOverlay ? REGISTRY[id].Component : null;

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="relative mx-auto h-dvh w-full max-w-[440px] overflow-hidden bg-deep"
        style={{ touchAction: "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {layers.map((l, i) => {
          const { Component } = REGISTRY[l.pageId];
          const isTop = i === layers.length - 1;
          return (
            <div
              key={l.key}
              ref={(el) => { if (el) pageEls.current.set(l.key, el); else pageEls.current.delete(l.key); }}
              className="absolute inset-0 overflow-hidden"
              style={{ zIndex: i + 1, willChange: "transform", boxShadow: isTop && layers.length > 1 ? "-10px 0 30px rgba(0,0,0,0.45)" : undefined }}
              aria-hidden={!isTop || undefined}
              inert={!isTop || undefined}
            >
              <Component id={l.pageId} />
              <div
                ref={(el) => { if (el) dimEls.current.set(l.key, el); else dimEls.current.delete(l.key); }}
                className="pointer-events-none absolute inset-0 z-[60] bg-black"
                style={{ opacity: 0 }}
                aria-hidden
              />
            </div>
          );
        })}
        <AnimatePresence>{Overlay && <Overlay key={id} id={id} />}</AnimatePresence>
        <DebugMenu />
      </div>
    </MotionConfig>
  );
}
