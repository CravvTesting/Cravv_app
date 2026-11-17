"use client";

import { motion } from "motion/react";
import { useEffect } from "react";
import { MOTION, useMotionTokens } from "@/proto/motion";
import { cx, PRESS } from "./utils";

export type ActionSheetAction = {
  label: string;
  /** Red label (`--cravv-status-alert`) + a light haptic on tap. */
  destructive?: boolean;
  onPress: () => void;
};

export type ActionSheetProps = {
  /** 13pt semibold grey ("Sign out of Cravv?"). */
  title?: string;
  /** 13pt grey under the title. */
  message?: string;
  actions: ActionSheetAction[];
  /** Cancel button and dim tap. */
  onCancel: () => void;
  cancelLabel?: string;
  className?: string;
};

/**
 * iOS action sheet (Figma 2675:6280). There is no `open` prop: render it while it is shown, inside
 * `<AnimatePresence>`, and it rises with a dim and sinks on exit. Fills the nearest positioned
 * ancestor (the phone frame / screen). Escape cancels.
 *
 * Enter/exit animate a `transform` string and opacity, which Motion runs on the Web Animations API.
 */
export function ActionSheet({ title, message, actions, onCancel, cancelLabel = "Cancel", className }: ActionSheetProps) {
  const m = useMotionTokens();
  const ease = { duration: 0.45 * m.scale, ease: [0.32, 0.72, 0, 1] as const };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const run = (a: ActionSheetAction) => {
    if (a.destructive) navigator.vibrate?.(10);
    a.onPress();
  };

  const group = "overflow-hidden rounded-[14px]";
  const groupBg = { background: "var(--cravv-surface-secondary)" };

  return (
    <div className={cx("absolute inset-0 z-40 flex flex-col justify-end", className)}>
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: MOTION.dimOpacity }}
        exit={{ opacity: 0 }}
        transition={m.fade}
        onClick={onCancel}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "Actions"}
        className="relative mx-2 flex flex-col gap-2"
        style={{ marginBottom: "max(env(safe-area-inset-bottom), 8px)", willChange: "transform" }}
        initial={m.reduced ? { opacity: 0 } : { transform: "translateY(110%)" }}
        animate={m.reduced ? { opacity: 1 } : { transform: "translateY(0%)" }}
        exit={m.reduced ? { opacity: 0 } : { transform: "translateY(110%)" }}
        transition={m.reduced ? m.fade : ease}
      >
        <div className={group} style={groupBg}>
          {(title || message) && (
            <div className="flex flex-col items-center gap-1 px-6 pb-[14px] pt-[18px] text-center text-[13px] leading-[18px]" style={{ color: "var(--cravv-text-secondary)" }}>
              {title && <p className="font-semibold">{title}</p>}
              {message && <p>{message}</p>}
            </div>
          )}
          {actions.map((a, i) => (
            <button
              key={a.label}
              type="button"
              onClick={() => run(a)}
              className={cx("relative flex h-[60px] w-full items-center justify-center text-[20px] leading-6 select-none", PRESS)}
              style={{ color: a.destructive ? "var(--cravv-status-alert)" : "var(--cravv-text-primary)" }}
            >
              {(i > 0 || title || message) && <span aria-hidden className="absolute inset-x-0 top-0 h-px origin-top scale-y-50 bg-white/[0.12]" />}
              {a.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onCancel}
          className={cx(group, "relative h-[60px] w-full text-[20px] font-semibold leading-6 text-white select-none", PRESS)}
          style={groupBg}
        >
          {cancelLabel}
        </button>
      </motion.div>
    </div>
  );
}
