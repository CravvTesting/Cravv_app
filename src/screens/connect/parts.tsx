"use client";

/*
 * Local pieces shared by the Bluetooth / find / pair screens (07a–09x).
 * Assets live in public/img/connect (exported from the Figma frames).
 */
import { motion } from "motion/react";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { cx } from "@/components/cravv";
import { useMotionTokens } from "@/proto/motion";

export const IMG = "/img/connect";

/** Plain <img> for static local assets (decorative by default). */
export function Img({ src, alt = "", className, style }: { src: string; alt?: string; className?: string; style?: CSSProperties }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} aria-hidden={alt ? undefined : true} draggable={false} className={cx("block max-w-none select-none", className)} style={style} />;
}

/** Tinted 120px rounded square with a 56px glyph (07a / 07c hero). */
export function PermissionHero({ tint, src }: { tint: string; src: string }) {
  return (
    <div
      className="mx-auto flex size-[120px] items-center justify-center rounded-[32px]"
      style={{ background: `color-mix(in srgb, ${tint} 16%, transparent)` }}
    >
      <Img src={src} className="size-14" />
    </div>
  );
}

/** Title + body block used on the centred permission / search screens. */
export function TitleBlock({ title, body, bodyWidth = 330, className }: { title: string; body: ReactNode; bodyWidth?: number; className?: string }) {
  return (
    <div className={cx("text-center", className)}>
      <h1 className="-mx-2 text-[34px] font-bold leading-[41px] tracking-[0.4px] text-white">{title}</h1>
      <p className="mx-auto mt-[7px] text-[17px] leading-[22px] tracking-[-0.43px] text-secondary" style={{ maxWidth: bodyWidth }}>
        {body}
      </p>
    </div>
  );
}

/** The front drawing of Tara (203 × 150), used on 08 and 09. */
export function TaraDrawing({ className, style }: { className?: string; style?: CSSProperties }) {
  return <Img src={`${IMG}/drawing-front.svg`} className={cx("h-[150px] w-[202.941px]", className)} style={style} />;
}

export type ChecklistItem = { icon: string; title: string; hint: string };

/**
 * Grouped three-row checklist inside the troubleshooting sheets (07h, 08x).
 * Rows are 60px: 22px icon at 16px, title + caption at 52px, inset separator.
 * `variant` follows the two frames: 07h uses a 16px title and a faint separator, 08x a 17px title and the iOS separator.
 */
export function Checklist({ items, variant }: { items: ChecklistItem[]; variant: "07h" | "08x" }) {
  const big = variant === "08x";
  return (
    <ul className={cx("overflow-hidden bg-secondary-surface", big ? "rounded-[20px]" : "rounded-[18px]")}>
      {items.map((it, i) => (
        <li key={it.title} className="relative flex h-[60px] items-center">
          <Img src={it.icon} className="ml-4 size-[22px] shrink-0" />
          <div className="ml-[14px] min-w-0">
            <p className={cx("truncate text-white", big ? "text-[17px] leading-[22px]" : "text-[16px] leading-[21px]")}>{it.title}</p>
            <p className="mt-px truncate text-[13px] leading-4 text-secondary">{it.hint}</p>
          </div>
          {i < items.length - 1 && (
            <span
              aria-hidden
              className={cx("absolute bottom-0 left-[52px] right-0", big ? "h-px" : "h-[0.5px]")}
              style={{ background: big ? "color-mix(in srgb, var(--cravv-gray-600) 60%, transparent)" : "rgba(255,255,255,0.12)" }}
            />
          )}
        </li>
      ))}
    </ul>
  );
}

/** 112px read-only tile on 08 (Stay close / Bluetooth). InfoTile is 120px with library icons, so this is local. */
export function SearchTile({ icon, label, hint }: { icon: string; label: string; hint: string }) {
  return (
    <div className="flex h-[112px] min-w-0 flex-col items-start overflow-hidden rounded-[20px] bg-raised px-3 pt-3">
      <Img src={icon} className="size-[22px]" />
      <span className="mt-[22px] text-[15px] font-semibold leading-[18px] text-white">{label}</span>
      <span className="mt-1 text-[12px] leading-[15px] text-secondary">{hint}</span>
    </div>
  );
}

/**
 * Rings around the drawing on 08.
 * - "pulse": copper rings pulse outwards, staggered (the search).
 * - "static": the two rings from the 08x / 09x frames.
 * - "collapse": rings shrink into the drawing (found → 09).
 */
export function SearchRings({ mode }: { mode: "pulse" | "static" | "collapse" }) {
  const m = useMotionTokens();
  // The page AnimatePresence uses initial={false}, which would snap a deep-linked page's
  // keyframes straight to their end. Start the loop after mount instead.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const copper = (pct: number) => `color-mix(in srgb, var(--cravv-copper-500) ${pct}%, transparent)`;
  const ring = "pointer-events-none absolute left-1/2 top-1/2 rounded-full border";
  const statics = (
    <>
      <span className={cx(ring, "-ml-[104px] -mt-[104px] size-[208px]")} style={{ borderColor: copper(20) }} />
      <span className={cx(ring, "-ml-[88px] -mt-[88px] size-[176px]")} style={{ borderColor: copper(38) }} />
    </>
  );

  if (mode === "static" || (mode === "pulse" && m.reduced)) return <div aria-hidden className="absolute inset-0">{statics}</div>;

  if (mode === "collapse") {
    const t = m.reduced ? m.fade : { duration: 0.45 * m.scale, ease: [0.4, 0, 0.2, 1] as const };
    return (
      <div aria-hidden className="absolute inset-0">
        {[208, 176, 144].map((s, i) => (
          <motion.span
            key={s}
            className={ring}
            style={{ width: s, height: s, marginLeft: -s / 2, marginTop: -s / 2, borderColor: copper(60 - i * 10) }}
            initial={{ scale: 1, opacity: 1 }}
            animate={m.reduced ? { opacity: 0 } : { scale: 0.35, opacity: 0 }}
            transition={{ ...t, delay: i * 0.04 * m.scale }}
          />
        ))}
      </div>
    );
  }

  // Pulse: three rings born at the drawing's edge, growing and fading, staggered.
  const period = 2.4 * m.scale;
  return (
    <div aria-hidden className="absolute inset-0">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className={cx(ring, "-ml-[88px] -mt-[88px] size-[176px]")}
          style={{ borderColor: copper(70) }}
          initial={{ scale: 0.55, opacity: 0 }}
          animate={mounted ? { scale: [0.55, 0.65, 1.25], opacity: [0, 0.9, 0] } : { scale: 0.55, opacity: 0 }}
          transition={{ duration: period, times: [0, 0.15, 1], ease: "easeOut", repeat: Infinity, delay: (i * period) / 3 }}
        />
      ))}
    </div>
  );
}
