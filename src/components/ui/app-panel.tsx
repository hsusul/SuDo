import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AppPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_0_rgb(255_255_255_/_4%)_inset,0_20px_50px_rgb(0_0_0_/_18%)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function AppPanelHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-b border-border px-5 py-4 sm:px-6", className)}>
      {children}
    </div>
  );
}
