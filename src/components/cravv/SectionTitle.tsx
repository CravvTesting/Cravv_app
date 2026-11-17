import type { ReactNode } from "react";
import { cx } from "./utils";

/** iOS list section title above a group ("Stove type", "Burners"): 17 semibold, secondary, inset 16px. */
export function SectionTitle({ children, inset = true, className, id }: { children: ReactNode; /** 16px left inset (iOS). Default true. */ inset?: boolean; className?: string; id?: string }) {
  return (
    <h3 id={id} className={cx(inset && "px-4", "pb-2 text-[17px] font-semibold leading-[22px] tracking-[-0.43px] text-secondary", className)}>
      {children}
    </h3>
  );
}
