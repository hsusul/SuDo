import { formatCount, getCountAriaLabel } from "@/lib/count-format";
import { cn } from "@/lib/utils";

type CountBadgeVariant = "default" | "muted" | "active";

const variantClassNames: Record<CountBadgeVariant, string> = {
  default: "text-[#8a8f98]",
  muted: "text-[#62666d]",
  active: "text-[#d0d6e0]",
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
        "inline-flex shrink-0 items-center justify-center font-mono text-[0.72rem] font-medium leading-none tabular-nums",
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
