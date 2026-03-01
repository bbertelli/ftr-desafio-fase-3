import type { ReactNode } from "react";

import { cn } from "../../utils/cn";

type TagColor =
  | "blue"
  | "purple"
  | "pink"
  | "red"
  | "orange"
  | "yellow"
  | "green";

type TagProps = {
  children: ReactNode;
  color?: TagColor;
};

export function Tag({ children, color = "blue" }: TagProps) {
  return <span className={cn("ui-tag", `ui-tag--${color}`)}>{children}</span>;
}
