"use client";

/*
 * Local building blocks for the Nutrition first-open setup (N01–N06).
 * Not in @/components/cravv: listed as missing components in the report.
 */
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cx, optionBase, PRESS } from "@/components/cravv";
import { useMotionTokens } from "@/proto/motion";

/* ── Glyphs missing from the icon set (paths from the frames, colour = currentColor) ── */

/** Filled circle check (N03 selected card). 24px. */
export function CheckCircleGlyph({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill="currentColor"
        d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm-1.5 13.8L17.3 9l-1.6-1.6-5.2 5.2L7.9 10l-1.6 1.6 4.2 4.2Z"
      />
    </svg>
  );
}

/** Up/down chevrons (popup value, N02 Sex row). 14px. */
export function UpDownGlyph({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M7 1.75 9.917 4.958H4.083L7 1.75Zm0 10.5L4.083 9.042h5.834L7 12.25Z" fill="currentColor" />
    </svg>
  );
}

/** Small x (sheet close, N05b). 16px. */
export function CloseGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Frying pan with steam (N06 empty state). 24px. */
export function PanGlyph({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        fill="currentColor"
        d="M3 10h13v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-3Zm14 1h5v2h-5v-2ZM6 3.5c1 1 1 2 0 3l-1-.9c.4-.4.4-.8 0-1.2l1-.9Zm4 0c1 1 1 2 0 3l-1-.9c.4-.4.4-.8 0-1.2l1-.9Z"
      />
    </svg>
  );
}

/* ── Target ring (N01 preview, N05) ────────────────────────────────────────── */

let ringDrawn = false; // draw clockwise once per session, not on every revisit / N05b

/**
 * Static macro ring: protein, carbs, fat as shares of calories, clockwise from 12 o'clock,
 * in the nutrient colours. Draws once per session (stroke-dashoffset, CSS transition).
 */
export function TargetRing({
  size,
  stroke,
  shares,
  dim = false,
  children,
}: {
  size: number;
  stroke: number;
  /** Fractions 0..1 for protein, carbs, fat. */
  shares: { protein: number; carbs: number; fat: number };
  /** Muted preview (N01). */
  dim?: boolean;
  children?: ReactNode;
}) {
  const m = useMotionTokens();
  const [drawn, setDrawn] = useState(() => ringDrawn || m.reduced);
  const animate = !ringDrawn && !m.reduced;
  useEffect(() => {
    if (drawn) return;
    let id2 = 0;
    const id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => {
        ringDrawn = true;
        setDrawn(true);
      });
    });
    return () => {
      cancelAnimationFrame(id1);
      cancelAnimationFrame(id2);
    };
  }, [drawn]);

  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const gap = stroke * 0.45;
  const order = ["protein", "carbs", "fat"] as const;
  const DRAW = 0.9 * m.scale;
  let start = 0;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden className="block">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="white" strokeOpacity={0.08} strokeWidth={stroke} />
        {order.map((k) => {
          const f = shares[k];
          const len = Math.max(0, f * circ - gap);
          const s0 = start;
          start += f;
          return (
            <circle
              key={k}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={optionBase(`nutrient-${k}`)}
              strokeOpacity={dim ? 0.75 : 1}
              strokeWidth={stroke}
              strokeDasharray={`${circ} ${circ}`}
              strokeDashoffset={circ - (drawn ? len : 0)}
              style={{
                transformOrigin: `${size / 2}px ${size / 2}px`,
                transform: `rotate(${s0 * 360 - 90 + ((gap / 2) / circ) * 360}deg)`,
                transition: animate ? `stroke-dashoffset ${Math.max(0.05, f * DRAW)}s linear ${s0 * DRAW}s` : "none",
              }}
            />
          );
        })}
      </svg>
      {children && <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>}
    </div>
  );
}

/* ── Grouped value row (N02) ───────────────────────────────────────────────── */

/** Hairline at the top of a row; a SettingsGroup hides it on the first row. */
function Sep({ inset = 52 }: { inset?: number }) {
  return <span data-sep aria-hidden className="pointer-events-none absolute right-0 top-0 h-px origin-top scale-y-50 bg-white/[0.12]" style={{ left: inset }} />;
}
export { Sep as RowSep };

/**
 * 56px row with a coloured leading icon (body-* option token), label, secondary value and a
 * trailing glyph. Used inside SettingsGroup.
 */
export function ValueRow({
  icon,
  label,
  value,
  trailing,
  onPress,
  separator = true,
  children,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  trailing: ReactNode;
  onPress?: () => void;
  separator?: boolean;
  /** Extra layer inside the row (e.g. a native <select> covering it). */
  children?: ReactNode;
}) {
  return (
    <div className={cx("relative flex h-14 w-full items-center text-left select-none", PRESS)}>
      {separator && <Sep />}
      <span className="ml-4 flex size-[22px] shrink-0 items-center justify-center">{icon}</span>
      <span className="ml-[14px] min-w-0 flex-1 truncate text-[17px] leading-[22px] text-white">{label}</span>
      <span className="ml-3 shrink-0 text-[17px] leading-[22px] tabular-nums text-secondary">{value}</span>
      <span className="ml-2 mr-4 flex shrink-0 items-center" style={{ color: "var(--cravv-option-icon-off)" }}>
        {trailing}
      </span>
      {onPress && <button type="button" onClick={onPress} aria-label={`${label}, ${value}`} className="absolute inset-0" />}
      {children}
    </div>
  );
}

/* ── Wheel picker (N02b, age/weight sheets) ───────────────────────────────── */

export const WHEEL_ROW = 37;
const VISIBLE = 5;

/**
 * iOS-style wheel column built on CSS scroll-snap: no JS animation loop. The value is read when
 * scrolling settles (`scrollend`, with a debounce fallback). Fading toward the edges is a static mask.
 */
export function Wheel({
  values,
  value,
  onChange,
  label,
  format = String,
  className,
  align = "right",
}: {
  values: readonly number[];
  value: number;
  onChange: (v: number) => void;
  label: string;
  format?: (v: number) => string;
  className?: string;
  align?: "right" | "center";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const idx = Math.max(0, values.indexOf(value));
  const [active, setActive] = useState(idx);
  const valuesRef = useRef(values);
  const changeRef = useRef(onChange);
  useEffect(() => {
    valuesRef.current = values;
    changeRef.current = onChange;
  });

  // Start on the current value.
  useLayoutEffect(() => {
    if (ref.current) ref.current.scrollTop = idx * WHEEL_ROW;
    // only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let t = 0;
    const settle = () => {
      const i = Math.min(valuesRef.current.length - 1, Math.max(0, Math.round(el.scrollTop / WHEEL_ROW)));
      setActive(i);
      changeRef.current(valuesRef.current[i]);
    };
    const onScroll = () => {
      clearTimeout(t);
      t = window.setTimeout(settle, 140);
    };
    const onEnd = () => {
      clearTimeout(t);
      settle();
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("scrollend", onEnd);
    return () => {
      clearTimeout(t);
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("scrollend", onEnd);
    };
  }, []);

  const scrollTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const j = Math.min(values.length - 1, Math.max(0, i));
    el.scrollTo({ top: j * WHEEL_ROW, behavior: "smooth" });
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); scrollTo(active + 1); }
    if (e.key === "ArrowUp") { e.preventDefault(); scrollTo(active - 1); }
  };

  const fade = "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.35) 14%, rgba(0,0,0,0.7) 32%, #000 42%, #000 58%, rgba(0,0,0,0.7) 68%, rgba(0,0,0,0.35) 86%, transparent 100%)";

  return (
    <div
      ref={ref}
      role="spinbutton"
      tabIndex={0}
      aria-label={label}
      aria-valuenow={values[active]}
      aria-valuetext={format(values[active])}
      aria-valuemin={values[0]}
      aria-valuemax={values[values.length - 1]}
      onKeyDown={onKey}
      className={cx("relative overflow-y-auto overscroll-contain outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", className)}
      style={{
        height: WHEEL_ROW * VISIBLE,
        scrollSnapType: "y mandatory",
        maskImage: fade,
        WebkitMaskImage: fade,
        paddingTop: WHEEL_ROW * 2,
        paddingBottom: WHEEL_ROW * 2,
      }}
    >
      {values.map((v, i) => (
        <button
          key={v}
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={() => scrollTo(i)}
          className={cx(
            "flex w-full items-center text-[21px] leading-none tabular-nums",
            align === "right" ? "justify-end" : "justify-center",
            i === active ? "text-white" : "text-secondary"
          )}
          style={{ height: WHEEL_ROW, scrollSnapAlign: "center" }}
        >
          {format(v)}
        </button>
      ))}
    </div>
  );
}

/** Selection band behind the wheels (38px, 8% white). */
export function WheelBand() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-4 rounded-[10px] bg-white/[0.08]"
      style={{ top: WHEEL_ROW * 2 - 0.5, height: 38 }}
    />
  );
}

/** Cancel · Title · Done row at the top of a picker sheet. */
export function PickerHeader({ title, onCancel, onDone, titleId }: { title: string; onCancel: () => void; onDone: () => void; titleId?: string }) {
  return (
    <div className="relative flex h-[62px] items-end pb-1">
      <div aria-hidden className="absolute left-1/2 top-1.5 h-[5px] w-9 -translate-x-1/2 rounded-[3px] bg-white/30" />
      <button type="button" onClick={onCancel} className="h-11 px-5 text-[17px] text-copper">
        Cancel
      </button>
      <h2 id={titleId} className="flex-1 text-center text-[17px] font-semibold leading-[44px] text-white">
        {title}
      </h2>
      <button type="button" onClick={onDone} className="h-11 px-5 text-[17px] font-semibold text-copper">
        Done
      </button>
    </div>
  );
}

/** Range helper. */
export const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
