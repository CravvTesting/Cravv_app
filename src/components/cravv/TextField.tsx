"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import { cx } from "./utils";

export type TextFieldProps = {
  /** Visible to screen readers only (the design has no visible label). */
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** "name" (56px, person icon) or "password" (52px, lock icon + eye toggle). */
  type?: "name" | "password";
  /** Error message. When set the field gets a 1.5px red ring and the message shows below in red. */
  error?: string;
  placeholder?: string;
  /** Override the leading icon. */
  icon?: IconName;
  /** Right-aligned hint inside the field, e.g. "From Apple ID". */
  trailing?: ReactNode;
  autoFocus?: boolean;
  autoComplete?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  enterKeyHint?: InputHTMLAttributes<HTMLInputElement>["enterKeyHint"];
  onSubmit?: () => void;
  disabled?: boolean;
  className?: string;
};

/** Pill-shaped controlled input (Figma Text field 2611:4187). */
export function TextField({
  label,
  value,
  onChange,
  type = "name",
  error,
  placeholder,
  icon,
  trailing,
  autoFocus,
  autoComplete,
  inputMode,
  enterKeyHint,
  onSubmit,
  disabled,
  className,
}: TextFieldProps) {
  const id = useId();
  const [reveal, setReveal] = useState(false);
  const password = type === "password";
  const errId = `${id}-err`;

  return (
    <div className={cx("w-full", className)}>
      <div
        className={cx(
          "relative flex items-center gap-3.5 rounded-[26px] pl-4",
          password ? "h-[52px] pr-1" : "h-14 pr-4",
          disabled && "opacity-40"
        )}
        style={{
          background: "var(--cravv-surface-raised)",
          boxShadow: error ? "inset 0 0 0 1.5px var(--cravv-status-alert)" : undefined,
        }}
      >
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        <Icon name={icon ?? (password ? "lock" : "user")} size={22} style={{ color: "var(--cravv-option-icon-off)" }} />
        <input
          id={id}
          type={password && !reveal ? "password" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && onSubmit) onSubmit();
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete={autoComplete ?? (password ? "current-password" : "name")}
          autoCapitalize={password ? "none" : "words"}
          autoCorrect="off"
          spellCheck={false}
          inputMode={inputMode}
          enterKeyHint={enterKeyHint}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? errId : undefined}
          className="h-full min-w-0 flex-1 bg-transparent text-[17px] text-white outline-none placeholder:text-placeholder"
          style={{ caretColor: "var(--cravv-accent-default)" }}
        />
        {trailing && !password && <span className="shrink-0 text-[13px] text-secondary">{trailing}</span>}
        {password && (
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            aria-label={reveal ? "Hide password" : "Show password"}
            aria-pressed={reveal}
            className="flex size-11 shrink-0 items-center justify-center rounded-full"
            style={{ color: "var(--cravv-option-icon-off)" }}
          >
            <Icon name="eye" size={22} strike={reveal} />
          </button>
        )}
      </div>
      {error && (
        <p id={errId} role="alert" className="mt-2 px-4 text-[13px] leading-[18px] text-alert">
          {error}
        </p>
      )}
    </div>
  );
}
