import { useId, type CSSProperties } from "react";
import { ICON_GLYPHS, type IconGlyph, type IconName, type IconPart } from "./iconGlyphs";

export type { IconName } from "./iconGlyphs";
export { ICON_NAMES } from "./iconGlyphs";

export type IconProps = {
  name: IconName;
  /** Rendered size in px. Default 24. */
  size?: number;
  /**
   * Avoid treatment (allergy picked): a diagonal strike through the glyph with a cut-out halo,
   * so it reads on any background. Matches Chip State=Avoid.
   */
  strike?: boolean;
  /** Accessible name. Omit for decorative icons (aria-hidden). */
  title?: string;
  className?: string;
  style?: CSSProperties;
};

/* Strike in 24-unit space: Figma draws it 2→18 on a 20px box (stroke 1.8, halo 4). */
const STRIKE = "M2.4 2.4L21.6 21.6";

function partProps(p: IconPart, mode: "paint" | "mask") {
  const colour = (k?: "g" | "c") =>
    k === undefined ? "none" : mode === "paint" ? "currentColor" : k === "g" ? "white" : "black";
  return {
    d: p.d,
    fill: colour(p.f),
    stroke: p.s ? colour(p.s) : undefined,
    strokeWidth: p.w,
    strokeLinecap: p.lc,
    strokeLinejoin: p.lj,
    opacity: p.o,
    fillRule: p.r,
    clipRule: p.r,
  };
}

/**
 * Filled 24px glyph from the Figma icon grid. Colour comes from `currentColor`: set `color`
 * (or a text-* class) to `var(--cravv-option-icon-off)`, an option base token, or
 * `var(--cravv-option-icon-on-fill)` on a solid fill. Never copper.
 *
 * Glyphs with interior detail (leaf vein, coil rings…) are drawn as true cut-outs via a mask,
 * so they stay correct on coloured fills.
 */
export function Icon({ name, size = 24, strike = false, title, className, style }: IconProps) {
  const glyph: IconGlyph = ICON_GLYPHS[name];
  const uid = useId().replace(/:/g, "");
  const vb = glyph.vb;
  const k = vb / 24; // strike geometry is authored for 24
  const needsMask = strike || glyph.parts.some((p) => p.f === "c" || p.s === "c");
  const a11y = title ? { role: "img", "aria-label": title } : { "aria-hidden": true as const };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${vb} ${vb}`}
      fill="none"
      className={className}
      style={{ flexShrink: 0, display: "block", ...style }}
      {...a11y}
    >
      {needsMask ? (
        <>
          <defs>
            <mask id={`m${uid}`} maskUnits="userSpaceOnUse" x={-2} y={-2} width={vb + 4} height={vb + 4}>
              {glyph.parts.map((p, i) => (
                <path key={i} {...partProps(p, "mask")} />
              ))}
              {strike && (
                <path d={STRIKE} transform={`scale(${k})`} stroke="black" strokeWidth={4.8} strokeLinecap="round" />
              )}
            </mask>
          </defs>
          <rect x={-2} y={-2} width={vb + 4} height={vb + 4} fill="currentColor" mask={`url(#m${uid})`} />
          {strike && (
            <path d={STRIKE} transform={`scale(${k})`} stroke="currentColor" strokeWidth={2.16} strokeLinecap="round" />
          )}
        </>
      ) : (
        glyph.parts.map((p, i) => <path key={i} {...partProps(p, "paint")} />)
      )}
    </svg>
  );
}
