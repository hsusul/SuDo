import {
  CheckCircle2,
  CircleDashed,
  Command,
  FolderKanban,
  ListFilter,
  MessageSquareText,
  Search,
  Settings,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { LabelChip, PriorityBadge, StatusBadge } from "@/components/ui/issue-badges";
import { cn } from "@/lib/utils";

const issues = [
  {
    id: "WEB-18",
    title: "Tighten onboarding copy",
    status: "IN_PROGRESS",
    statusLabel: "In progress",
    priority: "HIGH",
    priorityLabel: "High",
    label: "Polish",
    color: "#5e6ad2",
  },
  {
    id: "WEB-21",
    title: "Verify production redirect flow",
    status: "TODO",
    statusLabel: "Todo",
    priority: "URGENT",
    priorityLabel: "Urgent",
    label: "Auth",
    color: "#eb5757",
  },
  {
    id: "WEB-24",
    title: "Document release checklist",
    status: "BACKLOG",
    statusLabel: "Backlog",
    priority: "MEDIUM",
    priorityLabel: "Medium",
    label: "Docs",
    color: "#02b8cc",
  },
  {
    id: "WEB-27",
    title: "Polish project archive states",
    status: "DONE",
    statusLabel: "Done",
    priority: "LOW",
    priorityLabel: "Low",
    label: "Quality",
    color: "#27a644",
  },
];

const previewNavigation = [
  { icon: FolderKanban, label: "Projects", count: "3" },
  { icon: CheckCircle2, label: "Issues", count: "12" },
  { icon: Command, label: "Views", count: "" },
  { icon: Settings, label: "Settings", count: "" },
];

export function ProductPreview({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[10px] border border-[#323334] bg-[#08090a] text-[#f7f8f8] shadow-[0_30px_90px_rgb(0_0_0_/_45%)]",
        compact ? "min-h-[24rem]" : "min-h-[34rem]",
        className,
      )}
    >
      <div className="flex h-9 items-center justify-between border-b border-[#23252a] bg-[#0f1011] px-3">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="size-2 rounded-full bg-[#eb5757]/75" />
          <span className="size-2 rounded-full bg-[#e4f222]/70" />
          <span className="size-2 rounded-full bg-[#27a644]/75" />
        </div>
        <span className="font-mono text-[0.52rem] text-[#62666d]">
          app.sudo.work/issues
        </span>
        <span className="size-5" />
      </div>

      <div className="grid min-h-[inherit] grid-cols-[8.75rem_minmax(0,1fr)] sm:grid-cols-[11.5rem_minmax(0,1fr)]">
        <aside className="border-r border-[#23252a] bg-[#0c0d0e] p-2.5 sm:p-3">
          <div className="flex items-center gap-2 px-1.5 py-1">
            <BrandMark
              className="size-7 border-[#323334] bg-[#161718] text-[#e4f222]"
              iconClassName="size-3.5"
            />
            <div className="min-w-0">
              <p className="truncate text-[0.68rem] font-medium">SuDo</p>
              <p className="truncate font-mono text-[0.48rem] text-[#62666d]">LAUNCH DECK</p>
            </div>
          </div>

          <div className="mt-4 border-y border-[#23252a] py-2">
            <p className="px-1.5 font-mono text-[0.48rem] uppercase text-[#62666d]">Workspace</p>
            <div className="mt-1.5 flex items-center gap-1.5 rounded-md bg-[#161718] px-1.5 py-2 text-[0.58rem] text-[#d0d6e0]">
              <CircleDashed className="size-3 text-[#8f99ff]" />
              <span className="truncate">Launch workspace</span>
            </div>
          </div>

          <nav className="mt-3 space-y-0.5">
            {previewNavigation.map(({ icon: Icon, label, count }, index) => (
              <div
                key={label}
                className={cn(
                  "relative flex h-7 items-center gap-1.5 rounded-md px-1.5 text-[0.56rem]",
                  index === 1
                    ? "bg-[#161718] text-[#f7f8f8] before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:rounded-full before:bg-[#5e6ad2]"
                    : "text-[#62666d]",
                )}
              >
                <Icon className="size-3" />
                <span className="flex-1">{label}</span>
                {count ? <span className="font-mono">{count}</span> : null}
              </div>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 bg-[#08090a]">
          <header className="flex h-12 items-center justify-between border-b border-[#23252a] px-3 sm:px-4">
            <div className="min-w-0">
              <p className="truncate text-[0.66rem] font-medium">Launch Website</p>
              <p className="font-mono text-[0.48rem] text-[#62666d]">WEB / ACTIVE PIPELINE</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="hidden h-6 items-center gap-1.5 rounded-md border border-[#323334] bg-[#111214] px-2 text-[0.5rem] text-[#62666d] sm:flex">
                <Search className="size-2.5" />
                Search
                <kbd className="font-mono text-[#8a8f98]">/</kbd>
              </div>
              <span className="rounded-md bg-[#e4f222] px-2 py-1.5 text-[0.5rem] font-medium text-[#08090a]">
                New issue
              </span>
            </div>
          </header>

          <div className="grid min-h-[calc(100%-3rem)] lg:grid-cols-[minmax(0,1fr)_12.5rem]">
            <section className="min-w-0">
              <div className="flex h-9 items-center gap-2 border-b border-[#23252a] px-3 sm:px-4">
                <div className="flex h-5 items-center gap-1 rounded-[4px] border border-[#323334] bg-[#111214] px-1.5 text-[0.48rem] text-[#8a8f98]">
                  <ListFilter className="size-2.5" />
                  All issues
                </div>
                <span className="font-mono text-[0.48rem] text-[#62666d]">12 ACTIVE</span>
              </div>
              <div className="hidden grid-cols-[4rem_minmax(0,1fr)_5rem_4.5rem] border-b border-[#23252a] px-4 py-2 font-mono text-[0.46rem] uppercase text-[#62666d] sm:grid">
                <span>ID</span>
                <span>Issue</span>
                <span>Status</span>
                <span>Priority</span>
              </div>
              <div className="divide-y divide-[#23252a]">
                {issues.map((issue, index) => (
                  <div
                    key={issue.id}
                    className={cn(
                      "grid min-h-14 gap-1 px-3 py-2.5 sm:grid-cols-[4rem_minmax(0,1fr)_5rem_4.5rem] sm:items-center sm:px-4",
                      index === 0 && "bg-[#121315]",
                    )}
                  >
                    <span className="font-mono text-[0.5rem] text-[#62666d]">{issue.id}</span>
                    <div className="min-w-0">
                      <p className="truncate text-[0.58rem] font-medium text-[#d0d6e0]">
                        {issue.title}
                      </p>
                      <div className="mt-1">
                        <LabelChip
                          name={issue.label}
                          color={issue.color}
                          className="h-4 border-0 bg-transparent px-0 text-[0.46rem]"
                        />
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <StatusBadge status={issue.status} label={issue.statusLabel} />
                    </div>
                    <div className="hidden sm:block">
                      <PriorityBadge priority={issue.priority} label={issue.priorityLabel} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <aside className="hidden border-l border-[#23252a] bg-[#0f1011] p-3 lg:block">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.5rem] text-[#8a8f98]">WEB-18</span>
                <MessageSquareText className="size-3 text-[#62666d]" />
              </div>
              <h3 className="mt-3 text-[0.68rem] font-medium leading-4">
                Tighten onboarding copy
              </h3>
              <p className="mt-2 text-[0.52rem] leading-4 text-[#8a8f98]">
                Make the first-run path direct and keep the demo workspace promise explicit.
              </p>
              <div className="mt-4 space-y-2 border-y border-[#23252a] py-3">
                <div className="flex items-center justify-between">
                  <span className="text-[0.48rem] text-[#62666d]">Status</span>
                  <StatusBadge status="IN_PROGRESS" label="In progress" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[0.48rem] text-[#62666d]">Priority</span>
                  <PriorityBadge priority="HIGH" label="High" />
                </div>
              </div>
              <div className="mt-4 rounded-md border border-[#23252a] bg-[#161718] p-2.5">
                <p className="text-[0.5rem] font-medium text-[#d0d6e0]">Maya Chen</p>
                <p className="mt-1 text-[0.48rem] leading-3.5 text-[#8a8f98]">
                  Redirect copy is ready. I linked the deployment note here.
                </p>
              </div>
              <div className="mt-2 rounded-md border border-[#323334] bg-[#111214] p-2.5 text-[0.48rem] text-[#62666d]">
                Write a comment...
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
