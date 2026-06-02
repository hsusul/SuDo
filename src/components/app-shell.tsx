import Link from "next/link";
import {
  AlertCircle,
  Bell,
  Command,
  FolderKanban,
  ListTodo,
  Settings,
} from "lucide-react";
import type { UserWorkspace } from "@/lib/workspace";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { CountBadge } from "@/components/ui/count-badge";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { cn } from "@/lib/utils";

export function AppShell({
  children,
  isAuthConfigured,
  currentWorkspace,
  workspaces = [],
  activeView,
  navigationCounts,
}: {
  children: React.ReactNode;
  isAuthConfigured: boolean;
  currentWorkspace?: UserWorkspace["workspace"] | null;
  workspaces?: UserWorkspace[];
  activeView?: "projects" | "issues" | "views" | "settings";
  navigationCounts?: {
    activeProjectCount: number;
    activeIssueCount: number;
  } | null;
}) {
  const workspaceQuery = currentWorkspace ? `?workspace=${currentWorkspace.slug}` : "";
  const workspaceItems = workspaces.map((membership) => ({
    workspaceId: membership.workspaceId,
    workspace: {
      id: membership.workspace.id,
      name: membership.workspace.name,
      slug: membership.workspace.slug,
    },
  }));

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[16rem_1fr]">
        <aside className="hidden border-r border-sidebar-border/80 bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
          <Link
            href="/"
            className="flex h-16 items-center gap-3 border-b border-sidebar-border/60 px-4 transition hover:bg-sidebar-accent/35"
            aria-label="Go to SuDo home"
          >
            <BrandMark className="border-white/10 bg-white/[0.045]" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">SuDo</p>
              <p className="truncate text-xs text-sidebar-foreground/55">
                {currentWorkspace?.name ?? "Workspace pending"}
              </p>
            </div>
          </Link>

          <nav className="flex-1 space-y-6 px-3 py-5">
            <WorkspaceSwitcher
              workspaces={workspaceItems}
              currentWorkspaceId={currentWorkspace?.id}
            />

            <div className="space-y-1 border-t border-sidebar-border/60 pt-4">
              <SidebarItem
                icon={<FolderKanban className="size-4" />}
                label="Projects"
                count={navigationCounts?.activeProjectCount}
                countLabel="active project"
                href={currentWorkspace ? `/app/projects${workspaceQuery}` : undefined}
                active={activeView === "projects"}
              />
              <SidebarItem
                icon={<ListTodo className="size-4" />}
                label="Issues"
                count={navigationCounts?.activeIssueCount}
                countLabel="active issue"
                href={currentWorkspace ? `/app/issues${workspaceQuery}` : undefined}
                active={activeView === "issues"}
              />
              <SidebarItem
                icon={<Command className="size-4" />}
                label="Views"
                href={currentWorkspace ? `/app/views${workspaceQuery}` : undefined}
                active={activeView === "views"}
              />
            </div>
            <div className="border-t border-sidebar-border/60 pt-4">
              <SidebarItem
                icon={<Settings className="size-4" />}
                label="Settings"
                href={currentWorkspace ? `/app/settings${workspaceQuery}` : undefined}
                active={activeView === "settings"}
              />
            </div>
          </nav>

          <div className="border-t border-sidebar-border/60 p-3">
            <p className="rounded-lg border border-white/[0.055] bg-sidebar-accent/46 px-3 py-2 text-xs leading-5 text-sidebar-foreground/58">
              Demo data is ready. Search, label, and comment without setup.
            </p>
          </div>
        </aside>

        <section className="flex min-w-0 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-border/70 bg-background/92 px-4 lg:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Link href="/" className="lg:hidden" aria-label="Go to SuDo home">
                <BrandMark className="border-border/70 bg-muted/50 text-foreground" />
              </Link>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {currentWorkspace?.name ?? "Workspace setup"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {currentWorkspace
                    ? "Projects, issues, and filters"
                    : "Create the first workspace to continue"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isAuthConfigured ? (
                <span className="hidden items-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-900 sm:inline-flex dark:text-amber-100">
                  <AlertCircle className="size-3.5" aria-hidden="true" />
                  Clerk env needed
                </span>
              ) : null}
              <Button variant="ghost" size="icon" aria-label="Notifications placeholder" disabled>
                <Bell className="size-4" aria-hidden="true" />
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Home</Link>
              </Button>
            </div>
          </header>

          {currentWorkspace ? (
            <nav
              aria-label="App navigation"
              className="flex gap-2 overflow-x-auto border-b border-border/60 bg-background/88 px-4 py-2 lg:hidden"
            >
              <MobileNavItem
                icon={<FolderKanban className="size-3.5" />}
                label="Projects"
                count={navigationCounts?.activeProjectCount}
                countLabel="active project"
                href={`/app/projects${workspaceQuery}`}
                active={activeView === "projects"}
              />
              <MobileNavItem
                icon={<ListTodo className="size-3.5" />}
                label="Issues"
                count={navigationCounts?.activeIssueCount}
                countLabel="active issue"
                href={`/app/issues${workspaceQuery}`}
                active={activeView === "issues"}
              />
              <MobileNavItem
                icon={<Command className="size-3.5" />}
                label="Views"
                href={`/app/views${workspaceQuery}`}
                active={activeView === "views"}
              />
              <MobileNavItem
                icon={<Settings className="size-3.5" />}
                label="Settings"
                href={`/app/settings${workspaceQuery}`}
                active={activeView === "settings"}
              />
            </nav>
          ) : null}

          <div className="flex-1 p-4 lg:p-7">{children}</div>
        </section>
      </div>
    </main>
  );
}

function MobileNavItem({
  icon,
  label,
  href,
  active,
  count,
  countLabel,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  count?: number;
  countLabel?: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-xs transition-colors",
        active
          ? "border-border/70 bg-muted/58 text-foreground"
          : "border-transparent bg-background/35 text-muted-foreground hover:border-border/55 hover:text-foreground",
      )}
    >
      {icon}
      <span>{label}</span>
      {typeof count === "number" && countLabel ? (
        <CountBadge
          count={count}
          label={countLabel}
          variant={active ? "active" : "muted"}
          showZero={false}
        />
      ) : null}
    </Link>
  );
}

function SidebarItem({
  icon,
  label,
  href,
  active,
  disabled,
  count,
  countLabel,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  count?: number;
  countLabel?: string;
}) {
  const className = cn(
    "flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm transition-colors",
    active
      ? "bg-sidebar-accent/78 text-sidebar-accent-foreground"
      : "text-sidebar-foreground/65",
    href && !disabled && "hover:bg-sidebar-accent/62 hover:text-sidebar-accent-foreground",
    disabled && "opacity-45",
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={className} aria-current={active ? "page" : undefined}>
        {icon}
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {typeof count === "number" && countLabel ? (
          <CountBadge
            count={count}
            label={countLabel}
            variant={active ? "active" : "muted"}
            showZero={false}
          />
        ) : null}
      </Link>
    );
  }

  return (
    <div
      className={className}
      aria-disabled={disabled || undefined}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {typeof count === "number" && countLabel ? (
        <CountBadge count={count} label={countLabel} variant="muted" showZero={false} />
      ) : null}
    </div>
  );
}
