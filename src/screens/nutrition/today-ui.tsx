"use client";

/* Small building blocks shared by the Nutrition screens (local: not in the component library). */
import { AnimatePresence } from "motion/react";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Icon, PRESS, cx, formatNumber, type IconName } from "@/components/cravv";
import { Sheet } from "@/proto/ui";

export const SECONDARY = "var(--cravv-text-secondary)";
export const TERTIARY = "rgb(235 235 245 / 0.5)";
export const ICON_OFF = "var(--cravv-option-icon-off)";

/** Raised rounded card. */
export function Card({ children, className, secondary = false }: { children: ReactNode; className?: string; secondary?: boolean }) {
  return (
    <div
      className={cx("relative overflow-hidden rounded-[16px]", className)}
      style={{ background: secondary ? "var(--cravv-surface-secondary)" : "var(--cravv-surface-raised)" }}
    >
      {children}
    </div>
  );
}

/** "LEFTOVERS FROM TARA": 12 semibold caps, 50% white, 16px inset. */
export function GroupLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cx("px-4 pb-2 text-[12px] font-semibold uppercase leading-[14px]", className)} style={{ color: TERTIARY }}>{children}</h3>;
}

/** Hairline between rows inside a card. */
export function Hairline({ inset = 16, right = 0 }: { inset?: number; right?: number }) {
  return <span aria-hidden className="pointer-events-none absolute top-0 h-px origin-top scale-y-50 bg-white/[0.12]" style={{ left: inset, right }} />;
}

/** 36×32 "+" pill (R05/R06 rows). */
export function AddPill({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="relative flex h-8 w-9 shrink-0 items-center justify-center rounded-[16px] bg-white/[0.12] text-white transition-transform active:scale-90 before:absolute before:-inset-[6px] before:content-['']"
    >
      <Icon name="plus" size={18} />
    </button>
  );
}

export function MinusGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden>
      <path d="M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function XGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden>
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** chevron.up.chevron.down (picker affordance on R08). */
export function UpDownGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M5 6l3-3 3 3M5 10l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 196×40 servings / portion stepper. */
export function Stepper({
  label,
  onMinus,
  onPlus,
  canMinus = true,
  canPlus = true,
  name,
}: {
  label: string;
  onMinus: () => void;
  onPlus: () => void;
  canMinus?: boolean;
  canPlus?: boolean;
  name: string;
}) {
  const btn = "relative flex h-10 w-9 shrink-0 items-center justify-center rounded-full text-white transition-opacity active:opacity-50 disabled:opacity-30";
  return (
    <div className="flex h-10 w-[196px] shrink-0 items-center justify-between rounded-[20px] bg-white/[0.08] px-0.5">
      <button type="button" className={btn} onClick={onMinus} disabled={!canMinus} aria-label={`Less ${name}`}>
        <MinusGlyph />
      </button>
      <span className="min-w-0 flex-1 truncate text-center text-[15px] font-semibold leading-5 tracking-[-0.2px] tabular-nums text-white" aria-live="polite">
        {label}
      </span>
      <button type="button" className={btn} onClick={onPlus} disabled={!canPlus} aria-label={`More ${name}`}>
        <Icon name="plus" size={20} />
      </button>
    </div>
  );
}

/** kcal · protein · carbs · fat, 20 bold numbers with a macro dot (R04, R07). */
export function MacroStats({ kcal, protein, carbs, fat }: { kcal: number; protein: number; carbs: number; fat: number }) {
  const items = [
    { v: formatNumber(kcal), l: "kcal" },
    { v: `${formatNumber(protein)} g`, l: "protein", c: "nutrient-protein" },
    { v: `${formatNumber(carbs)} g`, l: "carbs", c: "nutrient-carbs" },
    { v: `${formatNumber(fat)} g`, l: "fat", c: "nutrient-fat" },
  ];
  return (
    <div className="grid grid-cols-[84px_84px_84px_1fr] px-4">
      {items.map((x) => (
        <div key={x.l} className="flex flex-col">
          <span className="text-[20px] font-bold leading-6 tabular-nums text-white">{x.v}</span>
          <span className="mt-0.5 flex items-center gap-[5px] text-[12px] leading-[14px]" style={{ color: SECONDARY }}>
            {x.c && <span aria-hidden className="size-[7px] rounded-full" style={{ background: `var(--cravv-option-${x.c}-base)` }} />}
            {x.l}
          </span>
        </div>
      ))}
    </div>
  );
}

/** 44px dish thumb: photo, or a grey icon well. */
export function Thumb({ photo, icon = "bowl", size = 44 }: { photo?: string; icon?: IconName; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-[12px]"
      style={{ width: size, height: size, background: photo ? undefined : "rgb(255 255 255 / 0.06)" }}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" className="size-full object-cover" />
      ) : (
        <span style={{ color: ICON_OFF }}>
          <Icon name={icon} size={Math.round(size / 2)} />
        </span>
      )}
    </span>
  );
}

/** 72px list row: thumb, name, detail, trailing node. Tappable when `onPress`. */
export function ListItem({
  thumb,
  name,
  detail,
  trailing,
  onPress,
  separator,
  inset = 72,
  plain = false,
}: {
  thumb?: ReactNode;
  name: string;
  detail?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  separator?: boolean;
  inset?: number;
  /** 64px row with a regular-weight name (R06 results). */
  plain?: boolean;
}) {
  const inner = (
    <>
      {separator && <Hairline inset={inset} />}
      {thumb && <span className="ml-4">{thumb}</span>}
      <span className={cx("flex min-w-0 flex-1 flex-col", thumb ? "ml-3" : "ml-4")}>
        <span className={cx("truncate text-[16px] leading-[19px] text-white", !plain && "font-semibold")}>{name}</span>
        {detail && <span className="mt-[3px] truncate text-[12px] leading-[14px]" style={{ color: SECONDARY }}>{detail}</span>}
      </span>
      {trailing && <span className="ml-3 mr-4 flex shrink-0 items-center">{trailing}</span>}
    </>
  );
  const base = cx("relative flex w-full items-center text-left select-none", plain ? "h-16" : "h-[72px]");
  if (onPress) {
    return (
      // A div with role=button so the trailing + pill can stay a real button (no nested buttons).
      <div
        role="button"
        tabIndex={0}
        onClick={onPress}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPress(); } }}
        className={cx(base, "cursor-pointer", PRESS)}
      >
        {inner}
      </div>
    );
  }
  return <div className={base}>{inner}</div>;
}

/**
 * A pushed route drawn as a sheet over a copy of the screen it rises from (R05 over R01,
 * R07 over R06). The route swaps in instantly (go(id, { dir: "instant" })) under an identical
 * underlay, then the sheet rises; closing plays the sheet's exit, then calls `onClosed`.
 */
export function SheetRoute({
  underlay,
  children,
  label,
  open,
  onDismiss,
  onClosed,
  underScroll = 0,
  className,
}: {
  underlay: ReactNode;
  children: ReactNode;
  label: string;
  open: boolean;
  onDismiss: () => void;
  onClosed: () => void;
  underScroll?: number;
  className?: string;
}) {
  const under = useRef<HTMLDivElement>(null);
  // Match the underlay's scroll to the screen we came from (after its own scroll memory ran).
  useLayoutEffect(() => {
    const el = under.current?.querySelector<HTMLElement>(".overflow-y-auto");
    if (el && underScroll) el.scrollTop = underScroll;
  }, [underScroll]);
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div ref={under} className="absolute inset-0" aria-hidden inert>
        {underlay}
      </div>
      <AnimatePresence onExitComplete={onClosed}>
        {open && (
          <Sheet label={label} onDismiss={onDismiss} className={className}>
            {children}
          </Sheet>
        )}
      </AnimatePresence>
    </div>
  );
}

/** open/closing state for a SheetRoute. `close(then)` runs `then` after the exit animation. */
export function useSheetClose() {
  const [open, setOpen] = useState(true);
  const after = useRef<(() => void) | null>(null);
  return {
    open,
    close: (then: () => void) => {
      after.current = then;
      setOpen(false);
    },
    onClosed: () => after.current?.(),
  };
}

/** Grabber + bold title + small round close button (R05 header). */
export function SheetTitle({ title, onClose, id }: { title: string; onClose?: () => void; id?: string }) {
  return (
    <div className="relative px-5 pt-[30px]">
      <div aria-hidden className="absolute left-1/2 top-1.5 h-[5px] w-9 -translate-x-1/2 rounded-[3px] bg-white/30" />
      <div className="flex min-h-9 items-center justify-between gap-3">
        <h2 id={id} className="text-[22px] font-bold leading-7 text-white">{title}</h2>
        {onClose && (
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/80 active:opacity-60 before:absolute before:-inset-1.5 before:content-['']"
          >
            <XGlyph />
          </button>
        )}
      </div>
    </div>
  );
}
