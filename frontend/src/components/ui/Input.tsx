import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "../../utils/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export function Input({
  label,
  helperText,
  error,
  leftIcon,
  rightIcon,
  className,
  ...props
}: InputProps) {
  return (
    <label className="ui-field">
      {label ? <span className="ui-field__label">{label}</span> : null}
      <span className={cn("ui-input", error && "ui-input--error", className)}>
        {leftIcon ? <span className="ui-input__icon">{leftIcon}</span> : null}
        <input className="ui-input__control" {...props} />
        {rightIcon ? <span className="ui-input__icon">{rightIcon}</span> : null}
      </span>
      {error ? (
        <span className="ui-field__error">{error}</span>
      ) : helperText ? (
        <span className="ui-field__helper">{helperText}</span>
      ) : null}
    </label>
  );
}
