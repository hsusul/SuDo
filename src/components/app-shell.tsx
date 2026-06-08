import Link from "next/link";
import {
  AlertCircle,
  Command,
  FolderKanban,
  Home,
  ListTodo,
  Settings,
} from "lucide-react";
import type { UserWorkspace } from "@/lib/workspace";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { CountBadge } from "@/components/ui/count-badge";
import { CommandMenu } from "@/components/command-menu";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { cn } from "@/lib/utils";

const viewLabels = {
  projects: "Projects",
  issues: "Issues",
  views: "Views",
  settings: "Settings",
} as const;

export function AppShell({
  children,
  isAuthConfigured,
  currentWorkspace,
  workspaces = [],
  activeView,
  currentProjectKey,
  navigationCounts,
}: {
  children: React.ReactNode;
  isAuthConfigured: boolean;
  currentWorkspace?: UserWorkspace["workspace"] | null;
  workspaces?: UserWorkspace[];
  activeView?: "projects" | "issues" | "views" | "settings";
  currentProjectKey?: string | null;
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
    <main
      data-testid="app-shell"
      className="min-h-screen bg-background text-foreground"
    >
      <div className="grid min-h-screen lg:grid-cols-[16.5rem_minmax(0,1fr)]">
        <aside className="hidden min-h-screen border-r border-border bg-[#0c0d0e] lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
          <Link
            href="/"
            className="flex h-16 items-center gap-2.5 border-b border-border px-4 transition hover:bg-[#111214]"
            aria-label="Go to SuDo home"
          >
            <BrandMark className="border-[#323334] bg-[#161718] text-[#e4f222]" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">SuDo</p>
              <p className="font-mono text-[0.58rem] uppercase text-[#62666d]">
                Command deck
              </p>
            </div>
          </Link>

          <div className="border-b border-border p-3">
            <WorkspaceSwitcher
              workspaces={workspaceItems}
              currentWorkspaceId={currentWorkspace?.id}
            />
          </div>

          <nav className="flex-1 px-3 py-4" aria-label="Primary navigation">
            <p className="mb-2 px-2 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[#62666d]">
              Operate
            </p>
            <div className="space-y-0.5">
              <SidebarItem
                icon={<FolderKanban />}
                label="Projects"
                count={navigationCounts?.activeProjectCount}
                countLabel="active project"
                href={currentWorkspace ? `/app/projects${workspaceQuery}` : undefined}
                active={activeView === "projects"}
              />
              <SidebarItem
                icon={<ListTodo />}
                label="Issues"
                count={navigationCounts?.activeIssueCount}
                countLabel="active issue"
                href={currentWorkspace ? `/app/issues${workspaceQuery}` : undefined}
                active={activeView === "issues"}
              />
              <SidebarItem
                icon={<Command />}
                label="Views"
                href={currentWorkspace ? `/app/views${workspaceQuery}` : undefined}
                active={activeView === "views"}
              />
            </div>

            <p className="mb-2 mt-7 px-2 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[#62666d]">
              Workspace
            </p>
            <SidebarItem
              icon={<Settings />}
              label="Settings"
              href={currentWorkspace ? `/app/settings${workspaceQuery}` : undefined}
              active={activeView === "settings"}
            />
          </nav>

          <div className="border-t border-border px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-xs text-[#8a8f98]">
                  {currentWorkspace?.name ?? "Workspace setup"}
                </p>
                <p className="mt-0.5 font-mono text-[0.56rem] uppercase text-[#62666d]">
                  {currentWorkspace ? "Workspace scoped" : "Configuration required"}
                </p>
              </div>
              <span
                className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  currentWorkspace ? "bg-[#27a644]" : "bg-[#62666d]",
                )}
                aria-hidden="true"
              />
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-[#08090a]/88 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <Link href="/" className="lg:hidden" aria-label="Go to SuDo home">
                <BrandMark className="text-[#e4f222]" />
              </Link>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm">
                  <span className="truncate text-[#8a8f98]">
                    {currentWorkspace?.name ?? "Workspace setup"}
                  </span>
                  {activeView ? (
                    <>
                      <span className="text-[#323334]">/</span>
                      <span className="font-medium text-[#d0d6e0]">
                        {viewLabels[activeView]}
                      </span>
                    </>
                  ) : null}
                </div>
                <p className="mt-0.5 hidden font-mono text-[0.56rem] uppercase text-[#62666d] sm:block">
                  Projects / issues / filters
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentWorkspace ? (
                <CommandMenu
                  activeView={activeView}
                  currentWorkspace={{
                    id: currentWorkspace.id,
                    name: currentWorkspace.name,
                    slug: currentWorkspace.slug,
                  }}
                  currentProjectKey={currentProjectKey}
                  workspaces={workspaces.map((membership) => ({
                    id: membership.workspace.id,
                    name: membership.workspace.name,
                    slug: membership.workspace.slug,
                  }))}
                />
              ) : null}
              {!isAuthConfigured ? (
                <span className="hidden items-center gap-1.5 rounded-md border border-[#eb5757]/30 bg-[#eb5757]/8 px-2 py-1 text-xs text-[#ff8585] sm:inline-flex">
                  <AlertCircle className="size-3.5" aria-hidden="true" />
                  Clerk env needed
                </span>
              ) : null}
              <Button asChild variant="ghost" size="icon" aria-label="Go to home" title="Home">
                <Link href="/">
                  <Home className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </header>

          {currentWorkspace ? (
            <nav
              aria-label="App navigation"
              className="flex gap-1 overflow-x-auto border-b border-border bg-[#0c0d0e] px-3 py-2 lg:hidden"
            >
              <MobileNavItem
                icon={<FolderKanban />}
                label="Projects"
                count={navigationCounts?.activeProjectCount}
                countLabel="active project"
                href={`/app/projects${workspaceQuery}`}
                active={activeView === "projects"}
              />
              <MobileNavItem
                icon={<ListTodo />}
                label="Issues"
                count={navigationCounts?.activeIssueCount}
                countLabel="active issue"
                href={`/app/issues${workspaceQuery}`}
                active={activeView === "issues"}
              />
              <MobileNavItem
                icon={<Command />}
                label="Views"
                href={`/app/views${workspaceQuery}`}
                active={activeView === "views"}
              />
              <MobileNavItem
                icon={<Settings />}
                label="Settings"
                href={`/app/settings${workspaceQuery}`}
                active={activeView === "settings"}
              />
            </nav>
          ) : null}

          <div className="sudo-app-grid min-h-[calc(100vh-4rem)]">
            <div className="mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-8">{children}</div>
          </div>
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
        "flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-xs transition duration-150 [&_svg]:size-3.5",
        active
          ? "border-[#323334] bg-[#161718] text-foreground"
          : "border-transparent text-[#8a8f98] hover:bg-[#161718] hover:text-foreground",
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
    "group relative flex h-9 items-center gap-2 rounded-md px-2.5 text-sm transition duration-150 [&_svg]:size-3.5",
    active ? "bg-[#161718] text-foreground" : "text-[#8a8f98]",
    href && !disabled && "hover:bg-[#141517] hover:text-[#d0d6e0]",
    disabled && "opacity-45",
    active &&
      "before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-[#5e6ad2]",
  );

  const content = (
    <>
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
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={className} aria-current={active ? "page" : undefined}>
        {content}
      </Link>
    );
  }

  return (
    <div className={className} aria-disabled={disabled || undefined}>
      {content}
    </div>
  );
}
