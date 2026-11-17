import { cx } from "./utils";

export type SetupStepProps = {
  /** "01", "02"… (numbers are zero-padded automatically). */
  number: string | number;
  label: string;
  className?: string;
};

/** One item of the mono setup strip (Figma Setup step 2612:4090): copper number, 70% white label, 9px caps. */
export function SetupStep({ number, label, className }: SetupStepProps) {
  const n = typeof number === "number" ? String(number).padStart(2, "0") : number;
  return (
    <span className={cx("inline-flex gap-1.5 whitespace-nowrap text-[9px] uppercase leading-[14px] tracking-[0.36px]", className)}>
      <span className="font-semibold" style={{ color: "var(--cravv-copper-500)" }}>
        {n}
      </span>
      <span className="font-medium text-white/70">{label}</span>
    </span>
  );
}

/** The 01–03 strip under the hero on 07 and 12. Numbers are added in order. Left-aligned, 18px apart. */
export function SetupStepStrip({ steps, className }: { steps: readonly string[]; className?: string }) {
  return (
    <ol className={cx("flex flex-wrap gap-x-[18px] gap-y-1", className)}>
      {steps.map((s, i) => (
        <li key={s}>
          <SetupStep number={i + 1} label={s} />
        </li>
      ))}
    </ol>
  );
}
