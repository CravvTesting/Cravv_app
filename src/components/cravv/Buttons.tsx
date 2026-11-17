"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useMotionTokens } from "@/proto/motion";
import { Spinner } from "./Spinner";
import { cx } from "./utils";

type NativeButton = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "type">;

export type PrimaryButtonProps = NativeButton & {
  children: ReactNode;
  /** Shows a spinner in place of the label (label stays as the accessible name). */
  loading?: boolean;
  /** Shows a check in place of the label (the 10 → 11 "joined" beat). */
  done?: boolean;
  type?: "button" | "submit";
};

/**
 * White 52px pill, semibold 17 label in --cravv-button-primary-label (iOS "Bordered - Prominent",
 * e.g. Continue). Full width by default. `loading` and `done` crossfade the content in place.
 */
export function PrimaryButton({ children, loading = false, done = false, disabled, className, type = "button", ...rest }: PrimaryButtonProps) {
  const m = useMotionTokens();
  const state = done ? "done" : loading ? "loading" : "label";
  const t = m.reduced ? m.fade : m.spring;
  const enter = m.reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6 };
  return (
    <button
      type={type}
      disabled={disabled}
      aria-busy={loading || undefined}
      className={cx(
        "relative flex h-[52px] w-full items-center justify-center overflow-hidden rounded-full px-5 select-none",
        "text-[17px] font-semibold leading-[22px] tracking-[-0.43px] transition-[opacity,transform] active:scale-[0.98] active:opacity-85",
        "disabled:opacity-35 disabled:active:scale-100",
        className
      )}
      style={{ background: "var(--cravv-button-primary-fill)", color: "var(--cravv-button-primary-label)" }}
      {...rest}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {state === "label" && (
          <motion.span key="label" className="truncate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={t}>
            {children}
          </motion.span>
        )}
        {state === "loading" && (
          <motion.span key="loading" className="flex" initial={enter} animate={{ opacity: 1, scale: 1 }} exit={enter} transition={t}>
            <Spinner size={22} label="" />
            <span className="sr-only">{children}</span>
          </motion.span>
        )}
        {state === "done" && (
          <motion.span key="done" className="flex" initial={enter} animate={{ opacity: 1, scale: 1 }} exit={enter} transition={t}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
              <motion.path
                d="M4.5 11.5L9 16L17.5 6"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={m.reduced ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.35 * m.scale, ease: "easeOut", delay: 0.05 * m.scale }}
              />
            </svg>
            <span className="sr-only">{children}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

/** Borderless 44px text button, 17 regular at 85% white (e.g. "Nothing on the Screen?"). */
export function TextButton({ children, className, type = "button", ...rest }: NativeButton & { children: ReactNode; type?: "button" | "submit" }) {
  return (
    <button
      type={type}
      className={cx(
        "flex h-11 w-full items-center justify-center rounded-xl px-5 text-[17px] leading-[22px] tracking-[-0.43px] text-white/85 select-none active:opacity-50 disabled:opacity-35",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/** iOS 26 Liquid Glass 48px circular button (dark). Use BackButton / CloseButton for the common glyphs. */
export function GlassButton({ children, label, className, type = "button", ...rest }: NativeButton & { children: ReactNode; label: string; type?: "button" | "submit" }) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cx(
        "relative flex size-12 shrink-0 items-center justify-center rounded-full text-[#f5f5f5] backdrop-blur-xl select-none",
        "transition-transform active:scale-95 disabled:opacity-35",
        className
      )}
      style={{
        // Dark Liquid Glass approximation, sampled from 2525:2746: ~20% darker than the page, light 1px rim.
        background: "linear-gradient(90deg, rgba(0,0,0,0.26), rgba(0,0,0,0.12))",
        boxShadow: "0 8px 40px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(255,255,255,0.18)",
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Back (chevron.left) in a 48px glass circle, top-left of onboarding screens. */
export function BackButton({ label = "Back", ...rest }: NativeButton & { label?: string }) {
  return (
    <GlassButton label={label} {...rest}>
      <svg width="12" height="20" viewBox="0 0 12 20" fill="none" aria-hidden>
        <path d="M9.5 2L2 10L9.5 18" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </GlassButton>
  );
}

/** Close (xmark) in a 48px glass circle, top-right of sheets/cards (09). */
export function CloseButton({ label = "Close", ...rest }: NativeButton & { label?: string }) {
  return (
    <GlassButton label={label} {...rest}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
        <path d="M2.5 2.5L15.5 15.5M15.5 2.5L2.5 15.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
    </GlassButton>
  );
}
