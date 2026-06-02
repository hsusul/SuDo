import Link from "next/link";
import { ArrowRight, Layers3, ListFilter, Tags, Zap } from "lucide-react";
import type { ProjectViewSummary } from "@/lib/view";
import { buildIssueViewHref } from "@/lib/view-definitions";
import { Button } from "@/components/ui/button";
import { CountBadge } from "@/components/ui/count-badge";

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
}: {
  workspaceSlug: string;
  projects: ViewsProjectItem[];
  selectedProjectKey: string | null;
  summary: ProjectViewSummary | null;
}) {
  const selectedProject =
    projects.find((project) => project.key === selectedProjectKey) ?? projects[0] ?? null;

  return (
    <section className="overflow-hidden rounded-xl border border-border/70 bg-card/82">
      <div className="border-b border-border/55 p-5">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground/85">
          Views
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-normal">Issue shortcuts</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Views are shortcuts into your issue list. They use the existing project
              filters instead of a saved custom views system.
            </p>
          </div>
          {selectedProject ? (
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
          ) : null}
        </div>
      </div>

      {projects.length === 0 || !selectedProject || !summary ? (
        <div className="p-6">
          <div className="rounded-lg border border-dashed border-border/55 bg-background/28 p-8 text-center">
            <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-lg border border-border/55 bg-muted/40 text-muted-foreground">
              <Layers3 className="size-5" aria-hidden="true" />
            </div>
            <h3 className="text-base font-medium">No views yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Create a project first. Views are generated from a project&apos;s active
              issues, priorities, and labels.
            </p>
            <Button asChild className="mt-5">
              <Link href={`/app/projects?workspace=${workspaceSlug}`}>Create project</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 p-5">
          {projects.length > 1 ? (
            <div className="rounded-lg border border-border/55 bg-background/28 p-3">
              <p className="px-1 text-xs font-medium text-muted-foreground">Project context</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/app/views?workspace=${workspaceSlug}&project=${project.key}`}
                    className={
                      project.key === selectedProject.key
                        ? "rounded-md border border-border/70 bg-muted/65 px-3 py-1.5 text-xs font-medium text-foreground"
                        : "rounded-md border border-border/45 bg-background/40 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-border/70 hover:text-foreground"
                    }
                  >
                    {project.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

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
      )}
    </section>
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
    <div>
      <div className="mb-2 flex items-center gap-2 px-1 text-sm font-medium text-muted-foreground">
        {icon}
        <h3>{title}</h3>
      </div>
      {views.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border/45 bg-background/24 p-4 text-sm text-muted-foreground">
          {emptyText ?? "No shortcuts available yet."}
        </p>
      ) : (
        <div className="grid gap-2 md:grid-cols-2">
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
              className="group rounded-lg border border-border/55 bg-background/30 p-4 transition hover:border-border/80 hover:bg-muted/28"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{view.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {view.description}
                  </p>
                </div>
                <CountBadge count={view.count} label="matching issue" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
