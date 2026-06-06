import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  BACKLOG: "border-[#323334] bg-[#161718] text-[#8a8f98]",
  backlog: "border-[#323334] bg-[#161718] text-[#8a8f98]",
  TODO: "border-[#5e6ad2]/45 bg-[#5e6ad2]/10 text-[#aeb5ff]",
  todo: "border-[#5e6ad2]/45 bg-[#5e6ad2]/10 text-[#aeb5ff]",
  IN_PROGRESS: "border-[#02b8cc]/40 bg-[#02b8cc]/10 text-[#65dce9]",
  in_progress: "border-[#02b8cc]/40 bg-[#02b8cc]/10 text-[#65dce9]",
  DONE: "border-[#27a644]/40 bg-[#27a644]/10 text-[#70d487]",
  done: "border-[#27a644]/40 bg-[#27a644]/10 text-[#70d487]",
  CANCELED: "border-[#eb5757]/35 bg-[#eb5757]/8 text-[#ff8585]",
  canceled: "border-[#eb5757]/35 bg-[#eb5757]/8 text-[#ff8585]",
};

const priorityStyles: Record<string, string> = {
  NO_PRIORITY: "border-[#323334] text-[#62666d]",
  no_priority: "border-[#323334] text-[#62666d]",
  LOW: "border-[#323334] text-[#8a8f98]",
  low: "border-[#323334] text-[#8a8f98]",
  MEDIUM: "border-[#5e6ad2]/35 text-[#aeb5ff]",
  medium: "border-[#5e6ad2]/35 text-[#aeb5ff]",
  HIGH: "border-[#e4f222]/30 text-[#e4f222]",
  high: "border-[#e4f222]/30 text-[#e4f222]",
  URGENT: "border-[#eb5757]/40 text-[#ff8585]",
  urgent: "border-[#eb5757]/40 text-[#ff8585]",
};

export function StatusBadge({
  status,
  label,
}: {
  status: string;
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-[4px] border px-1.5 text-[0.68rem] font-medium",
        statusStyles[status] ?? statusStyles.BACKLOG,
      )}
    >
      {label}
    </span>
  );
}

export function PriorityBadge({
  priority,
  label,
}: {
  priority: string;
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-[4px] border bg-transparent px-1.5 font-mono text-[0.66rem] uppercase",
        priorityStyles[priority] ?? priorityStyles.NO_PRIORITY,
      )}
    >
      {label}
    </span>
  );
}

export function LabelChip({
  name,
  color,
  className,
}: {
  name: string;
  color?: string | null;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1.5 rounded-[4px] border border-[#323334] bg-[#161718] px-1.5 text-[0.68rem] text-[#d0d6e0]",
        className,
      )}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ backgroundColor: color ?? "#62666d" }}
        aria-hidden="true"
      />
      {name}
    </span>
  );
}
