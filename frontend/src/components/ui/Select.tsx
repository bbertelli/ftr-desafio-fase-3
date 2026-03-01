import type { ReactNode, SelectHTMLAttributes } from "react";

import { cn } from "../../utils/cn";

type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  error?: string;
  leftIcon?: ReactNode;
};

export function Select({
  label,
  options,
  helperText,
  error,
  leftIcon,
  className,
  ...props
}: SelectProps) {
  return (
    <label className="ui-field">
      {label ? <span className="ui-field__label">{label}</span> : null}
      <span className={cn("ui-input", error && "ui-input--error", className)}>
        {leftIcon ? <span className="ui-input__icon">{leftIcon}</span> : null}
        <select className="ui-input__control" {...props}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </span>
      {error ? (
        <span className="ui-field__error">{error}</span>
      ) : helperText ? (
        <span className="ui-field__helper">{helperText}</span>
      ) : null}
    </label>
  );
}
