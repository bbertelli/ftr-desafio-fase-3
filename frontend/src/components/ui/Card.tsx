import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "../../utils/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode;
  subtitle?: ReactNode;
};

export function Card({ title, subtitle, className, children, ...props }: CardProps) {
  return (
    <section className={cn("ui-card", className)} {...props}>
      {title || subtitle ? (
        <header className="ui-card__header">
          {title ? <h3 className="ui-card__title">{title}</h3> : null}
          {subtitle ? <p className="ui-card__subtitle">{subtitle}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
