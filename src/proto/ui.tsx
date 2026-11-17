"use client";

/*
 * App-shell building blocks for screens: Screen layout, Sheet and SystemAlert overlays.
 * Visual components from the Figma library live in @/components/cravv.
 */
import { motion, type PanInfo } from "motion/react";
import type { ReactNode } from "react";
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
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (onDismiss && (info.offset.y > 120 || info.velocity.y > 600)) onDismiss();
  };
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      {dim && <Dim onClick={onDismiss} />}
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={cx("relative mx-2 overflow-hidden rounded-[38px] bg-recessed", className)}
        style={{ marginBottom: "max(calc(env(safe-area-inset-bottom) - 26px), 8px)", paddingBottom: "max(env(safe-area-inset-bottom), 20px)" }}
        initial={m.reduced ? { opacity: 0 } : { y: "100%" }}
        animate={m.reduced ? { opacity: 1 } : { y: 0 }}
        exit={m.reduced ? { opacity: 0 } : { y: "110%" }}
        transition={m.sheet}
        drag={onDismiss ? "y" : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={onDragEnd}
        layout
      >
        {children}
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
        style={{ background: "rgba(30,30,30,0.75)" }}
        initial={{ opacity: 0, scale: m.reduced ? 1 : 1.15 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: m.reduced ? 1 : 0.95 }}
        transition={m.spring}
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
                a.destructive ? "text-alert" : "text-info",
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
