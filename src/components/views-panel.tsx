import Link from "next/link";
import { ArrowRight, Layers3, ListFilter, Tags, Zap } from "lucide-react";
import type { ProjectViewSummary } from "@/lib/view";
import { buildIssueViewHref } from "@/lib/view-definitions";
import { AppPanel, AppPanelHeader } from "@/components/ui/app-panel";
import { Button } from "@/components/ui/button";
import { CountBadge } from "@/components/ui/count-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import {
  SavedViewsPanel,
  type SavedViewListItem,
} from "@/components/saved-views-panel";
import { cn } from "@/lib/utils";

export type ViewsProjectItem = {
  id: string;
  key: string;
  name: string;
};

export function ViewsPanel({
  workspaceSlug,
  projects,
  selectedProjectKey,
  summary,
  workspaceId,
  savedViews,
}: {
  workspaceId: string;
  workspaceSlug: string;
  projects: ViewsProjectItem[];
  selectedProjectKey: string | null;
  summary: ProjectViewSummary | null;
  savedViews: SavedViewListItem[];
}) {
  const selectedProject =
    projects.find((project) => project.key === selectedProjectKey) ?? projects[0] ?? null;

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Views"
        title="Workspace views"
        description="Open shared saved filters or jump into generated slices of the current issue pipeline."
        actions={
          selectedProject ? (
            <Button asChild variant="outline">
              <Link
                href={buildIssueViewHref({
                  workspaceSlug,
                  projectKey: selectedProject.key,
                })}
              >
                Open issue list
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          ) : null
        }
      />

      <SavedViewsPanel
        workspaceId={workspaceId}
        workspaceSlug={workspaceSlug}
        savedViews={savedViews}
      />

      {projects.length === 0 || !selectedProject || !summary ? (
        <AppPanel className="p-3">
          <EmptyState
            icon={<Layers3 className="size-5" aria-hidden="true" />}
            title="No views yet"
            description="Create a project first. Views are generated from a project's active issues, priorities, and labels."
            action={
              <Button asChild>
                <Link href={`/app/projects?workspace=${workspaceSlug}`}>Create project</Link>
              </Button>
            }
          />
        </AppPanel>
      ) : (
        <>
          {projects.length > 1 ? (
            <div className="flex gap-1 overflow-x-auto border-b border-border pb-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/app/views?workspace=${workspaceSlug}&project=${project.key}`}
                  className={cn(
                    "shrink-0 rounded-md border px-3 py-2 text-xs transition duration-150",
                    project.key === selectedProject.key
                      ? "border-[#323334] bg-[#161718] text-foreground"
                      : "border-transparent text-[#8a8f98] hover:bg-[#141517] hover:text-[#d0d6e0]",
                  )}
                >
                  <span className="mr-2 font-mono text-[#62666d]">{project.key}</span>
                  {project.name}
                </Link>
              ))}
            </div>
          ) : null}

          <div className="grid gap-5 xl:grid-cols-2">
            <ViewGroup
              title="Core views"
              icon={<ListFilter className="size-4" aria-hidden="true" />}
              views={summary.systemViews}
              workspaceSlug={workspaceSlug}
              projectKey={selectedProject.key}
            />
            <ViewGroup
              title="Status views"
              icon={<Layers3 className="size-4" aria-hidden="true" />}
              views={summary.statusViews}
              workspaceSlug={workspaceSlug}
              projectKey={selectedProject.key}
            />
            <ViewGroup
              title="Priority views"
              icon={<Zap className="size-4" aria-hidden="true" />}
              views={summary.priorityViews}
              workspaceSlug={workspaceSlug}
              projectKey={selectedProject.key}
            />
            <ViewGroup
              title="Label views"
              icon={<Tags className="size-4" aria-hidden="true" />}
              views={summary.labelViews}
              workspaceSlug={workspaceSlug}
              projectKey={selectedProject.key}
              emptyText="Create labels on issue details to unlock label shortcuts."
            />
          </div>
        </>
      )}
    </div>
  );
}

function ViewGroup({
  title,
  icon,
  views,
  workspaceSlug,
  projectKey,
  emptyText,
}: {
  title: string;
  icon: React.ReactNode;
  views: Array<{
    id: string;
    title: string;
    description: string;
    count: number;
    status?: ProjectViewSummary["statusViews"][number]["status"];
    priority?: ProjectViewSummary["priorityViews"][number]["priority"];
    labelId?: string;
  }>;
  workspaceSlug: string;
  projectKey: string;
  emptyText?: string;
}) {
  return (
    <AppPanel>
      <AppPanelHeader className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[#d0d6e0]">
          <span className="text-[#8f99ff]">{icon}</span>
          <h2 className="text-sm font-medium">{title}</h2>
        </div>
        <span className="font-mono text-[0.62rem] uppercase text-[#62666d]">
          {views.length} shortcuts
        </span>
      </AppPanelHeader>
      {views.length === 0 ? (
        <p className="m-4 border border-dashed border-[#323334] p-5 text-sm text-[#8a8f98]">
          {emptyText ?? "No shortcuts available yet."}
        </p>
      ) : (
        <div className="divide-y divide-border">
          {views.map((view) => (
            <Link
              key={view.id}
              href={buildIssueViewHref({
                workspaceSlug,
                projectKey,
                status: view.status,
                priority: view.priority,
                labelId: view.labelId,
              })}
              className="group grid min-h-20 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3 transition duration-150 hover:bg-[#141517]"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#d0d6e0]">{view.title}</p>
                <p className="mt-1 line-clamp-1 text-xs text-[#8a8f98]">
                  {view.description}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <CountBadge count={view.count} label="matching issue" />
                <ArrowRight className="size-3.5 text-[#62666d] transition group-hover:translate-x-0.5 group-hover:text-[#aeb5ff]" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppPanel>
  );
}
