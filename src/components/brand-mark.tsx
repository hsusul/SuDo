import { Flower2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  iconClassName,
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span
      className={cn(
        "flex size-9 items-center justify-center rounded-lg border border-white/12 bg-white/6 text-current",
        className,
      )}
      aria-hidden="true"
    >
      <Flower2 className={cn("size-5", iconClassName)} />
    </span>
  );
}
