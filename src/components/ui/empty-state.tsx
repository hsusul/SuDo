import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-72 flex-col items-center justify-center border border-dashed border-[#323334] bg-[#0c0d0e] px-6 py-12 text-center",
        className,
      )}
    >
      <div className="mb-4 flex size-10 items-center justify-center rounded-md border border-[#323334] bg-[#161718] text-[#8a8f98]">
        {icon}
      </div>
      <h2 className="text-base font-medium text-foreground">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#8a8f98]">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
