import type { ButtonHTMLAttributes } from "react";

import { cn } from "../../utils/cn";

type IconButtonVariant = "outline" | "ghost" | "danger";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: IconButtonVariant;
};

export function IconButton({
  variant = "outline",
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      className={cn("ui-icon-button", `ui-icon-button--${variant}`, className)}
      {...props}
    >
      {children}
    </button>
  );
}
