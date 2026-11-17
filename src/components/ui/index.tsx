"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/**
 * Full-height phone screen. The design is 402 wide; on larger screens the app
 * is centred at phone width. Respects iOS safe areas.
 */
export function Screen({ children, className, padded = true }: { children: ReactNode; className?: string; padded?: boolean }) {
  return (
    <main
      className={cx(
        "app-bg relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden",
        padded && "px-5",
        className
      )}
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 16px)" }}
    >
      {children}
    </main>
  );
}

/** Top bar with the round back button and optional 3-step progress. Matches the 03–13 frames. */
export function TopBar({ step, total = 3, onBack, back = true }: { step?: number; total?: number; onBack?: () => void; back?: boolean }) {
  return (
    <div className="flex items-center gap-4 pt-[max(env(safe-area-inset-top),12px)]" style={{ minHeight: 60 }}>
      <div className="-ml-1 flex h-12 w-12 shrink-0 items-center">
        {back && <BackButton onClick={onBack} />}
      </div>
      {step !== undefined && <Progress step={step} total={total} />}
    </div>
  );
}

export function BackButton({ onClick }: { onClick?: () => void }) {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="Back"
      onClick={onClick ?? (() => router.back())}
      className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/10 backdrop-blur-xl transition active:scale-95"
    >
      <svg width="12" height="20" viewBox="0 0 12 20" fill="none" aria-hidden>
        <path d="M10 2L2 10l8 8" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/** Segmented progress, active segments in copper. */
export function Progress({ step, total = 3 }: { step: number; total?: number }) {
  return (
    <div className="flex flex-1 gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={cx("h-1 flex-1 rounded-sm transition-colors", i < step ? "bg-accent" : "bg-track")} />
      ))}
    </div>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { href?: string; loading?: boolean };

/** iOS "Bordered – Prominent" large button: white pill, black label, 52 tall. */
export function PrimaryButton({ children, className, href, loading, disabled, ...rest }: BtnProps) {
  const cls = cx(
    "flex h-[52px] w-full items-center justify-center rounded-full bg-white text-[17px] font-semibold text-black transition active:scale-[0.98] active:bg-white/85 disabled:opacity-40",
    className
  );
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return (
    <button type="button" className={cls} disabled={disabled || loading} {...rest}>
      {loading ? <Spinner dark /> : children}
    </button>
  );
}

/** iOS "Borderless" large button: plain white label, 44 tall. */
export function TextButton({ children, className, href, ...rest }: BtnProps) {
  const cls = cx("flex h-11 w-full items-center justify-center text-[17px] text-white transition active:opacity-60", className);
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button type="button" className={cls} {...rest}>{children}</button>;
}

/** Bottom-pinned action area. */
export function Actions({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("mt-auto flex flex-col gap-1.5 pt-6", className)}>{children}</div>;
}

export function Title({ children, className }: { children: ReactNode; className?: string }) {
  return <h1 className={cx("text-[34px] font-bold leading-[41px] tracking-[0.4px] text-white", className)}>{children}</h1>;
}

export function Subtitle({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx("mt-1.5 text-[17px] leading-[22px] tracking-[-0.43px] text-label-2", className)}>{children}</p>;
}

/** Small footnote under a card. */
export function Footnote({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx("px-4 text-[13px] leading-[18px] text-label-2", className)}>{children}</p>;
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("rounded-card bg-surface", className)}>{children}</div>;
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-1 pb-2 pt-4">
      <h2 className="text-[15px] font-semibold text-white">{children}</h2>
      {right}
    </div>
  );
}

/** Selectable pill used on "Your kitchen". */
export function Chip({ selected, onClick, children, icon, color = "accent" }: { selected?: boolean; onClick?: () => void; children: ReactNode; icon?: ReactNode; color?: string }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cx(
        "inline-flex h-[34px] items-center gap-1.5 rounded-full px-3 text-[15px] transition active:scale-95",
        selected ? "font-semibold text-white" : "bg-surface text-white/85"
      )}
      style={selected ? { background: color } : undefined}
    >
      {icon}
      {children}
    </button>
  );
}

export function Spinner({ dark = false, size = 20 }: { dark?: boolean; size?: number }) {
  return (
    <span
      className={cx("inline-block animate-spin rounded-full border-2", dark ? "border-black/20 border-t-black" : "border-white/20 border-t-white")}
      style={{ width: size, height: size }}
      aria-label="Loading"
    />
  );
}

export { cx };
