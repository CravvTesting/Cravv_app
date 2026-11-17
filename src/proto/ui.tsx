"use client";

/*
 * App-shell building blocks for screens: Screen layout, Sheet and SystemAlert overlays.
 * Visual components from the Figma library live in @/components/cravv.
 */
import { motion } from "motion/react";
import { useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { BackButton, StepProgress } from "@/components/cravv";
import { MOTION, useMotionTokens } from "./motion";
import { back as navBack } from "./nav";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/**
 * A full-height screen. `header` sits under the safe-area top (back button + step bar),
 * `children` scroll, `footer` is pinned to the bottom above the home indicator.
 * Set `bleed` to let content (hero photos) run under the status bar.
 */
export function Screen({
  header,
  children,
  footer,
  bleed = false,
  className,
  contentClassName,
}: {
  header?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  bleed?: boolean;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <div className={cx("cravv-bg relative flex h-full w-full flex-col overflow-hidden", className)}>
      {header && (
        <div className="relative z-10 shrink-0 px-4" style={{ paddingTop: "max(env(safe-area-inset-top), 8px)" }}>
          {header}
        </div>
      )}
      <div
        className={cx("relative min-h-0 flex-1 overflow-y-auto overscroll-contain", !bleed && "px-5", contentClassName)}
        style={!header && !bleed ? { paddingTop: "max(env(safe-area-inset-top), 16px)" } : undefined}
      >
        {children}
      </div>
      {footer && (
        <div className="relative z-10 shrink-0 px-5 pt-3" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 16px)" }}>
          {footer}
        </div>
      )}
    </div>
  );
}

/** Dim layer behind sheets and alerts. */
function Dim({ onClick }: { onClick?: () => void }) {
  const m = useMotionTokens();
  return (
    <motion.div
      className="absolute inset-0 bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: MOTION.dimOpacity }}
      exit={{ opacity: 0 }}
      transition={m.fade}
      onClick={onClick}
      aria-hidden
    />
  );
}

/**
 * Bottom sheet (02/02b, 07h, 08x, 09x, 12h). Rises from the bottom with the dim fading in;
 * drag down or tap the dim to dismiss when `onDismiss` is given.
 * Render it from an overlay screen; App's AnimatePresence plays the exit.
 *
 * Enter/exit animate a full `transform` string and opacity, which Motion hands to the Web
 * Animations API (compositor thread). The drag writes transforms directly, no React renders.
 */
export function Sheet({
  children,
  onDismiss,
  dim = true,
  label,
  className,
}: {
  children: ReactNode;
  onDismiss?: () => void;
  dim?: boolean;
  label?: string;
  className?: string;
}) {
  const m = useMotionTokens();
  const dragEl = useRef<HTMLDivElement>(null);
  const drag = useRef<{ y0: number; dy: number; lastY: number; lastT: number; v: number } | null>(null);
  const ease = { duration: 0.5 * m.scale, ease: [0.32, 0.72, 0, 1] as const };

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!onDismiss) return;
    drag.current = { y0: e.clientY, dy: 0, lastY: e.clientY, lastT: e.timeStamp, v: 0 };
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || !dragEl.current) return;
    const raw = e.clientY - d.y0;
    if (raw > 6 && !e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.setPointerCapture(e.pointerId);
    d.dy = raw > 0 ? raw : raw / 4; // rubber-band upwards
    d.v = (e.clientY - d.lastY) / Math.max(1, e.timeStamp - d.lastT);
    d.lastY = e.clientY; d.lastT = e.timeStamp;
    dragEl.current.style.transform = `translate3d(0,${d.dy}px,0)`;
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    const el = dragEl.current;
    if (!d || !el) return;
    if (onDismiss && (d.dy > 120 || (d.v > 0.5 && d.dy > 10))) {
      onDismiss();
      return;
    }
    el.animate([{ transform: `translate3d(0,${d.dy}px,0)` }, { transform: "translate3d(0,0,0)" }], {
      duration: 350 * m.scale, easing: "cubic-bezier(0.32, 0.72, 0, 1)",
    });
    el.style.transform = "";
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      {dim && <Dim onClick={onDismiss} />}
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="relative mx-2"
        style={{ marginBottom: "max(calc(env(safe-area-inset-bottom) - 26px), 8px)", willChange: "transform" }}
        initial={m.reduced ? { opacity: 0 } : { transform: "translateY(100%)" }}
        animate={m.reduced ? { opacity: 1 } : { transform: "translateY(0%)" }}
        exit={m.reduced ? { opacity: 0 } : { transform: "translateY(110%)" }}
        transition={m.reduced ? m.fade : ease}
      >
        <div
          ref={dragEl}
          className={cx("overflow-hidden rounded-[38px] bg-recessed", className)}
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 20px)", touchAction: onDismiss ? "none" : undefined }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          {children}
        </div>
      </motion.section>
    </div>
  );
}

export type AlertAction = { label: string; onPress: () => void; bold?: boolean; destructive?: boolean };

/** Simulated iOS system alert: 270px, centred, blurred (07b and the 13n alerts prompt). */
export function SystemAlert({ title, message, actions }: { title: string; message?: ReactNode; actions: AlertAction[] }) {
  const m = useMotionTokens();
  const row = actions.length === 2;
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center">
      <Dim />
      <motion.div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-[270px] overflow-hidden rounded-[14px] text-center backdrop-blur-2xl"
        style={{ background: "rgba(44,44,46,0.96)" }}
        initial={{ opacity: 0, transform: m.reduced ? "scale(1)" : "scale(1.15)" }}
        animate={{ opacity: 1, transform: "scale(1)" }}
        exit={{ opacity: 0, transform: m.reduced ? "scale(1)" : "scale(0.95)" }}
        transition={{ duration: 0.35 * m.scale, ease: [0.32, 0.72, 0, 1] }}
      >
        <div className="px-4 pb-4 pt-[19px]">
          <p className="text-[17px] font-semibold leading-[22px]">{title}</p>
          {message && <div className="mt-0.5 text-[13px] leading-4">{message}</div>}
        </div>
        <div className={cx("border-t border-white/15", row ? "grid grid-cols-2" : "flex flex-col")}>
          {actions.map((a, i) => (
            <button
              key={a.label}
              type="button"
              onClick={a.onPress}
              className={cx(
                "h-11 text-[17px] active:bg-white/10",
                a.bold && "font-semibold",
                a.destructive ? "text-alert" : "text-[#0A84FF]", // iOS system blue: system chrome, not a Cravv token
                i > 0 && (row ? "border-l border-white/15" : "border-t border-white/15")
              )}
            >
              {a.label}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export { cx };

// ---------------------------------------------------------------------------
// Header used by most screens: Liquid Glass back button + optional step bar.
// ---------------------------------------------------------------------------

/**
 * Top row of 03–13: back button (calls nav back(), or `onBack`) and the step bar.
 * Personalise = steps 3, Connect = steps 4 (Connect · Wi-Fi · Stove · Camera).
 */
export function ScreenHeader({
  back = true,
  onBack,
  steps,
  current,
  right,
}: {
  back?: boolean;
  onBack?: () => void;
  steps?: 3 | 4;
  current?: number;
  right?: ReactNode;
}) {
  return (
    <div className="flex min-h-[56px] items-center gap-4">
      <div className="flex w-12 shrink-0 items-center">{back && <BackButton onClick={onBack ?? (() => navBack())} />}</div>
      {steps && current ? <div className="flex-1"><StepProgress steps={steps} current={current} /></div> : <div className="flex-1" />}
      {right}
    </div>
  );
}
