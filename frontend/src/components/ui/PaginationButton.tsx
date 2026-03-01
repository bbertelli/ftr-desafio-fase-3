import type { ButtonHTMLAttributes } from "react";

import { cn } from "../../utils/cn";

type PaginationButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isActive?: boolean;
};

export function PaginationButton({
  isActive = false,
  className,
  children,
  ...props
}: PaginationButtonProps) {
  return (
    <button
      className={cn(
        "ui-pagination-button",
        isActive && "ui-pagination-button--active",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
