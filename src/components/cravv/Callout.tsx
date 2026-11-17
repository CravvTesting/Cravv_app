import { cx } from "./utils";

/** Numbered label pinned to a product drawing, "01 DISPLAY" (Figma Callout 2612:4103). Position it yourself. */
export function Callout({ number, label, className }: { number: string | number; label: string; className?: string }) {
  const n = typeof number === "number" ? String(number).padStart(2, "0") : number;
  return (
    <span
      className={cx(
        "inline-flex gap-2 rounded-full bg-black/60 px-2.5 py-1.5 text-[10px] uppercase leading-[14px] tracking-[0.4px] whitespace-nowrap",
        className
      )}
    >
      <span className="font-semibold" style={{ color: "var(--cravv-copper-500)" }}>
        {n}
      </span>
      <span className="font-medium text-white/80">{label}</span>
    </span>
  );
}
