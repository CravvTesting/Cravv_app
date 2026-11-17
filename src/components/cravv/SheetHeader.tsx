import { cx } from "./utils";

export type SheetHeaderProps = {
  title: string;
  subtitle?: string;
  /** Show the drag grabber. Default true. */
  grabber?: boolean;
  /** id for the title, to wire `aria-labelledby` on the sheet. */
  titleId?: string;
  className?: string;
};

/** Top of every onboarding sheet: grabber, 28 bold title, one-line subtitle (Figma Sheet header 2612:4051). */
export function SheetHeader({ title, subtitle, grabber = true, titleId, className }: SheetHeaderProps) {
  return (
    <div className={cx("flex flex-col items-center px-6 pb-5 text-center", grabber ? "pt-2" : "pt-[30px]", className)}>
      {grabber && <div aria-hidden className="mb-[17px] h-[5px] w-9 rounded-[3px] bg-white/25" />}
      <h2 id={titleId} className="text-[28px] font-bold leading-[34px] text-white">
        {title}
      </h2>
      {subtitle && <p className="mt-1.5 max-w-[300px] text-[15px] leading-5 text-secondary">{subtitle}</p>}
    </div>
  );
}
