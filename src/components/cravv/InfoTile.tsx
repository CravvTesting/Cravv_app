import { Icon, type IconName } from "./Icon";
import { optionBase, type OptionToken } from "./options";
import { cx } from "./utils";

export type InfoTileProps = {
  label: string;
  hint?: string;
  icon: IconName;
  /** Option token; the icon is always drawn in its base colour (e.g. "setup-power"). */
  token: OptionToken;
  className?: string;
};

/** Read-only tile for "what you need" (Figma Info tile 2611:4135), 120px tall. Not interactive. */
export function InfoTile({ label, hint, icon, token, className }: InfoTileProps) {
  return (
    <div
      className={cx("flex h-[120px] min-w-0 flex-col items-start overflow-hidden rounded-[20px] pl-3 pr-2.5 pt-[17px]", className)}
      style={{ background: "var(--cravv-option-surface-off)" }}
    >
      <Icon name={icon} size={26} style={{ color: optionBase(token) }} />
      <span className="mt-[19px] text-[15px] font-semibold leading-[18px] text-white">{label}</span>
      {hint && <span className="mt-1 text-[12px] leading-[15px] text-secondary">{hint}</span>}
    </div>
  );
}
