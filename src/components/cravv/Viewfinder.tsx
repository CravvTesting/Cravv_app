import type { CSSProperties, ReactNode } from "react";
import { cx } from "./utils";

export type ViewfinderProps = {
  /** Square size in px, or {width, height}. Omit to fill the parent (or size to children). */
  size?: number | { width: number | string; height: number | string };
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const CORNER = "M0.75 10.75V0.75H10.75";
const ROT = { tl: 0, tr: 90, br: 180, bl: 270 } as const;
const POS = { tl: "left-0 top-0", tr: "right-0 top-0", br: "right-0 bottom-0", bl: "left-0 bottom-0" } as const;

/** Four copper corner brackets around a drawing or camera view (Figma Viewfinder 2612:4093). Corners pin to the edges. */
export function Viewfinder({ size, children, className, style }: ViewfinderProps) {
  const dims = typeof size === "number" ? { width: size, height: size } : size;
  return (
    <div className={cx("relative", !dims && "h-full w-full", className)} style={{ ...dims, ...style }}>
      {children}
      {(Object.keys(ROT) as (keyof typeof ROT)[]).map((k) => (
        <svg
          key={k}
          aria-hidden
          width="11.5"
          height="11.5"
          viewBox="0 0 11.5 11.5"
          fill="none"
          className={cx("pointer-events-none absolute -m-[0.75px]", POS[k])}
          style={{ transform: `rotate(${ROT[k]}deg)` }}
        >
          <path d={CORNER} stroke="var(--cravv-copper-500)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ))}
    </div>
  );
}
