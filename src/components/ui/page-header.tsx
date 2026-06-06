import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  metadata,
  actions,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  metadata?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-5 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="sudo-kicker">{eyebrow}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-[1.65rem] font-semibold leading-tight tracking-[-0.02em] text-foreground sm:text-[1.85rem]">
            {title}
          </h1>
          {metadata}
        </div>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8a8f98]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}
