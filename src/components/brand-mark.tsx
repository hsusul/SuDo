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
        "flex size-8 items-center justify-center rounded-md border border-[#323334] bg-[#161718] text-current",
        className,
      )}
      aria-hidden="true"
    >
      <Flower2 className={cn("size-5", iconClassName)} />
    </span>
  );
}
