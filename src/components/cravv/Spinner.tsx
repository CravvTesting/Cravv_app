import { cx } from "./utils";

export type SpinnerProps = {
  /** px. Default 20. */
  size?: number;
  /** Any CSS colour; defaults to currentColor. */
  color?: string;
  /** Accessible label. Default "Loading". Pass "" when a parent already announces it. */
  label?: string;
  className?: string;
};

/**
 * iOS-style activity indicator: 8 rounded spokes with a fading tail, rotating in steps.
 * Uses the global `.cravv-spin` keyframes so "Slow animations ×5" (--motion-scale) applies.
 */
export function Spinner({ size = 20, color = "currentColor", label = "Loading", className }: SpinnerProps) {
  const spokes = 8;
  return (
    <span
      role={label ? "status" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      className={cx("inline-block shrink-0", className)}
      style={{ width: size, height: size, color }}
    >
      <svg viewBox="0 0 24 24" width={size} height={size} className="cravv-spin block" style={{ animationTimingFunction: `steps(${spokes})` }}>
        {Array.from({ length: spokes }, (_, i) => (
          <rect
            key={i}
            x="10.75"
            y="1.5"
            width="2.5"
            height="6.5"
            rx="1.25"
            fill="currentColor"
            opacity={1 - (i / spokes) * 0.85}
            transform={`rotate(${-i * (360 / spokes)} 12 12)`}
          />
        ))}
      </svg>
    </span>
  );
}
