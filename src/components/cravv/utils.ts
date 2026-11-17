/** Joins class names, skipping falsy values. */
export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/**
 * Pressed highlight for rows and cards that paint their own background: a white overlay
 * (pseudo-element) fades to 6% while the finger is down. Opacity only, so it stays on the compositor.
 * The element must be `relative`.
 */
export const PRESS =
  "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-white after:opacity-0 after:transition-opacity after:duration-150 active:after:opacity-[0.06] after:content-['']";
