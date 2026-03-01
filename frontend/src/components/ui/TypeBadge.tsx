import { CircleArrowDown, CircleArrowUp } from "lucide-react";

import { cn } from "../../utils/cn";

type TypeBadgeProps = {
  type: "INCOME" | "EXPENSE";
};

export function TypeBadge({ type }: TypeBadgeProps) {
  const isIncome = type === "INCOME";

  return (
    <span className={cn("ui-type-badge", isIncome && "ui-type-badge--income")}>
      {isIncome ? <CircleArrowUp size={14} /> : <CircleArrowDown size={14} />}
      {isIncome ? "Entrada" : "Saída"}
    </span>
  );
}
