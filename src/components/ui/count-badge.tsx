import { formatCount, getCountAriaLabel } from "@/lib/count-format";
import { cn } from "@/lib/utils";

type CountBadgeVariant = "default" | "muted" | "active";

const variantClassNames: Record<CountBadgeVariant, string> = {
  default: "border-border/55 bg-background/42 text-muted-foreground",
  muted: "border-transparent bg-transparent text-muted-foreground/62",
  active: "border-sidebar-border/60 bg-sidebar/70 text-sidebar-foreground/72",
};

export function CountBadge({
  count,
  label,
  pluralLabel,
  variant = "default",
  showZero = true,
  className,
}: {
  count: number;
  label: string;
  pluralLabel?: string;
  variant?: CountBadgeVariant;
  showZero?: boolean;
  className?: string;
}) {
  if (!showZero && count === 0) {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full border px-1.5 text-[0.68rem] font-medium leading-none tabular-nums",
        variantClassNames[variant],
        className,
      )}
      aria-label={getCountAriaLabel(count, label, pluralLabel)}
      title={getCountAriaLabel(count, label, pluralLabel)}
    >
      {formatCount(count)}
    </span>
  );
}

