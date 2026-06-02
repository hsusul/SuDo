import { Database, KeyRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { IssuePanel, type IssueListItem } from "@/components/issue-panel";
import { ProjectPanel, type ProjectListItem } from "@/components/project-panel";
import { SettingsPanel } from "@/components/settings-panel";
import { ViewsPanel } from "@/components/views-panel";
import { WorkspaceOnboardingForm } from "@/components/workspace-onboarding-form";
import {
  getCurrentClerkAuth,
  getOrCreateCurrentUser,
  isClerkConfigured,
  isDatabaseConfigured,
} from "@/lib/auth";
import { getIssueComments } from "@/lib/comment";
import { getWorkspaceNavigationCounts } from "@/lib/counts";
import { parseIssueFilters, type IssueFilters } from "@/lib/issue-filter-validation";
import { getIssueForDetail, getProjectIssues } from "@/lib/issue";
import { getWorkspaceLabels } from "@/lib/label";
import { getWorkspaceProjects } from "@/lib/project";
import { getProjectViewSummary, type ProjectViewSummary } from "@/lib/view";
import { getUserWorkspaces, type UserWorkspace } from "@/lib/workspace";

export type WorkspaceView = "projects" | "issues" | "views" | "settings";

export type WorkspaceRouteProps = {
  view: WorkspaceView;
  searchParams?: Promise<{
    workspace?: string;
    project?: string;
    issue?: string;
    status?: string;
    priority?: string;
    label?: string;
    q?: string;
  }>;
};

export async function WorkspaceRoute({ view, searchParams }: WorkspaceRouteProps) {
  const clerkConfigured = isClerkConfigured();

  if (clerkConfigured) {
    const { auth } = await import("@clerk/nextjs/server");
    await auth.protect();
  }

  if (!clerkConfigured || !isDatabaseConfigured()) {
    const authState = await getCurrentClerkAuth();

    return (
      <AppShell isAuthConfigured={clerkConfigured} activeView={view}>
        <SetupState
          clerkConfigured={clerkConfigured}
          databaseConfigured={isDatabaseConfigured()}
          authenticated={authState.isAuthenticated}
        />
      </AppShell>
    );
  }

  const userResult = await getOrCreateCurrentUser();

  if (userResult.status !== "ready") {
    return (
      <AppShell isAuthConfigured={clerkConfigured} activeView={view}>
        <SetupErrorState status={userResult.status} />
      </AppShell>
    );
  }

  const workspaces = await getUserWorkspaces(userResult.user.id);

  if (workspaces.length === 0) {
    return (
      <AppShell isAuthConfigured={clerkConfigured} workspaces={workspaces} activeView={view}>
        <WorkspaceOnboardingState userName={userResult.user.name} />
      </AppShell>
    );
  }

  const params = await searchParams;
  const issueFilters = parseIssueFilters({
    status: params?.status,
    priority: params?.priority,
    label: params?.label,
    q: params?.q,
  });
  const currentWorkspace = resolveCurrentWorkspace(workspaces, params?.workspace);
  const [projects, navigationCounts] = await Promise.all([
    getWorkspaceProjects(currentWorkspace.workspace.id),
    getWorkspaceNavigationCounts(currentWorkspace.workspace.id),
  ]);
  const workspaceLabels =
    view === "issues" ? await getWorkspaceLabels(currentWorkspace.workspace.id) : [];
  const requestedIssue =
    view === "issues" && params?.issue ? await getIssueForDetail(params.issue) : null;
  const selectedIssue =
    requestedIssue?.workspaceId === currentWorkspace.workspace.id ? requestedIssue : null;
  const selectedProject =
    selectedIssue && projects.some((project) => project.id === selectedIssue.projectId)
      ? projects.find((project) => project.id === selectedIssue.projectId) ?? null
      : resolveSelectedProject(projects, params?.project);
  const issues =
    view === "issues" && selectedProject
      ? await getProjectIssues(selectedProject.id, issueFilters)
      : [];
  const selectedIssueComments =
    view === "issues" && selectedIssue ? await getIssueComments(selectedIssue.id) : [];
  const viewSummary =
    view === "views" && selectedProject ? await getProjectViewSummary(selectedProject.id) : null;

  return (
    <AppShell
      isAuthConfigured={clerkConfigured}
      workspaces={workspaces}
      currentWorkspace={currentWorkspace.workspace}
      activeView={view}
      navigationCounts={navigationCounts}
    >
      <WorkspaceHomeState
        view={view}
        workspace={{
          id: currentWorkspace.workspace.id,
          name: currentWorkspace.workspace.name,
          slug: currentWorkspace.workspace.slug,
          isDemo: currentWorkspace.workspace.isDemo,
        }}
        currentUser={{
          name: userResult.user.name,
          email: userResult.user.email,
          imageUrl: userResult.user.imageUrl,
        }}
        projects={projects.map((project) => ({
          id: project.id,
          key: project.key,
          name: project.name,
          description: project.description,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
          activeIssueCount: project._count.issues,
        }))}
        selectedProjectKey={selectedProject?.key ?? null}
        issues={issues.map((issue) => ({
          id: issue.id,
          issueKey: issue.issueKey,
          title: issue.title,
          description: issue.description,
          status: issue.status.type,
          priority: issue.priority,
          createdAt: issue.createdAt.toISOString(),
          updatedAt: issue.updatedAt.toISOString(),
          labels: issue.labels.map((issueLabel) => ({
            id: issueLabel.label.id,
            name: issueLabel.label.name,
            color: issueLabel.label.color,
          })),
        }))}
        workspaceLabels={workspaceLabels.map((label) => ({
          id: label.id,
          name: label.name,
          color: label.color,
        }))}
        issueFilters={issueFilters}
        selectedIssue={
          selectedIssue
            ? {
                id: selectedIssue.id,
                issueKey: selectedIssue.issueKey,
                issueNumber: selectedIssue.issueNumber,
                title: selectedIssue.title,
                description: selectedIssue.description,
                status: selectedIssue.status.type,
                priority: selectedIssue.priority,
                createdAt: selectedIssue.createdAt.toISOString(),
                updatedAt: selectedIssue.updatedAt.toISOString(),
                project: {
                  id: selectedIssue.project.id,
                  key: selectedIssue.project.key,
                  name: selectedIssue.project.name,
                },
                labels: selectedIssue.labels.map((issueLabel) => ({
                  id: issueLabel.label.id,
                  name: issueLabel.label.name,
                  color: issueLabel.label.color,
                })),
                comments: selectedIssueComments.map((comment) => ({
                  id: comment.id,
                  body: comment.body,
                  createdAt: comment.createdAt.toISOString(),
                  updatedAt: comment.updatedAt.toISOString(),
                  author: {
                    id: comment.author.id,
                    name: comment.author.name,
                    imageUrl: comment.author.imageUrl,
                  },
                })),
              }
            : null
        }
        viewSummary={viewSummary}
      />
    </AppShell>
  );
}

function resolveCurrentWorkspace(workspaces: UserWorkspace[], workspaceSlug?: string) {
  if (!workspaceSlug) {
    return workspaces[0];
  }

  return (
    workspaces.find((membership) => membership.workspace.slug === workspaceSlug) ??
    workspaces[0]
  );
}

function resolveSelectedProject(
  projects: Array<{ id: string; key: string }>,
  projectKey?: string,
) {
  if (projects.length === 0) {
    return null;
  }

  if (!projectKey) {
    return projects[0];
  }

  return projects.find((project) => project.key === projectKey) ?? projects[0];
}

function WorkspaceOnboardingState({ userName }: { userName: string | null }) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-2xl items-center">
      <section className="w-full rounded-xl border border-border/70 bg-card/82 p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground/90">
          Workspace onboarding
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-normal">
          Create your first workspace
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {userName ? `${userName}, ` : ""}
          start with a demo workspace or create a blank one for your own project.
        </p>
        <WorkspaceOnboardingForm />
      </section>
    </div>
  );
}

function WorkspaceHomeState({
  view,
  workspace,
  currentUser,
  projects,
  selectedProjectKey,
  issues,
  workspaceLabels,
  issueFilters,
  selectedIssue,
  viewSummary,
}: {
  view: WorkspaceView;
  workspace: { id: string; name: string; slug: string; isDemo: boolean };
  currentUser: { name: string | null; email: string; imageUrl: string | null };
  projects: ProjectListItem[];
  selectedProjectKey: string | null;
  issues: IssueListItem[];
  workspaceLabels: IssueLabelItem[];
  issueFilters: IssueFilters;
  selectedIssue: IssueListItemWithProject | null;
  viewSummary: ProjectViewSummary | null;
}) {
  const selectedProject =
    projects.find((project) => project.key === selectedProjectKey) ?? projects[0] ?? null;
  const issueProjects = projects.map((project) => ({
    id: project.id,
    key: project.key,
    name: project.name,
  }));

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4">
      {view === "projects" ? (
        <ProjectPanel
          workspaceId={workspace.id}
          workspaceSlug={workspace.slug}
          projects={projects}
          selectedProjectKey={selectedProjectKey}
        />
      ) : view === "issues" ? (
        <IssuePanel
          workspaceSlug={workspace.slug}
          project={
            selectedProject
              ? { id: selectedProject.id, key: selectedProject.key, name: selectedProject.name }
              : null
          }
          workspaceId={workspace.id}
          projects={issueProjects}
          issues={issues}
          workspaceLabels={workspaceLabels}
          filters={issueFilters}
          selectedIssue={selectedIssue}
        />
      ) : view === "views" ? (
        <ViewsPanel
          workspaceSlug={workspace.slug}
          projects={issueProjects}
          selectedProjectKey={selectedProjectKey}
          summary={viewSummary}
        />
      ) : (
        <SettingsPanel user={currentUser} />
      )}
    </div>
  );
}

type IssueListItemWithProject = IssueListItem & {
  issueNumber: number;
  project: {
    id: string;
    key: string;
    name: string;
  };
  comments: Array<{
    id: string;
    body: string;
    createdAt: string;
    updatedAt: string;
    author: {
      id: string;
      name: string | null;
      imageUrl: string | null;
    };
  }>;
};

type IssueLabelItem = {
  id: string;
  name: string;
  color: string;
};

function SetupState({
  clerkConfigured,
  databaseConfigured,
  authenticated,
}: {
  clerkConfigured: boolean;
  databaseConfigured: boolean;
  authenticated: boolean;
}) {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6">
      <section className="rounded-xl border border-border/70 bg-card/82 p-6">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Setup required
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-normal">
          Auth and database are not fully configured
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          SuDo can render without secrets for local scaffold checks. Add Clerk
          keys and a Postgres `DATABASE_URL` to enable real workspace onboarding.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <FoundationStatusCard
          icon={<KeyRound className="size-4" aria-hidden="true" />}
          title="Authentication"
          status={clerkConfigured ? "Clerk configured" : "Waiting for Clerk env vars"}
          body={
            clerkConfigured
              ? authenticated
                ? "Clerk is configured and the current request is authenticated."
                : "Clerk is configured. Sign in to continue."
              : "Add Clerk publishable and secret keys to enable protected /app routes."
          }
        />
        <FoundationStatusCard
          icon={<Database className="size-4" aria-hidden="true" />}
          title="Database"
          status={databaseConfigured ? "DATABASE_URL configured" : "Waiting for DATABASE_URL"}
          body={
            databaseConfigured
              ? "Prisma can run against the configured Postgres database."
              : "Add a Postgres DATABASE_URL before running migrations or creating workspaces."
          }
        />
      </section>
    </div>
  );
}

function SetupErrorState({ status }: { status: string }) {
  return (
    <section className="mx-auto w-full max-w-3xl rounded-xl border border-border/70 bg-card/82 p-6">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Setup blocked
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-normal">
        SuDo could not prepare your local user
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Current state: <span className="font-medium text-foreground">{status}</span>.
        Confirm Clerk keys, `DATABASE_URL`, and migrations are configured.
      </p>
    </section>
  );
}

function FoundationStatusCard({
  icon,
  title,
  status,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  status: string;
  body: string;
}) {
  return (
    <article className="rounded-lg border border-border/65 bg-card/72 p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <p className="text-sm font-medium text-foreground">{title}</p>
      </div>
      <p className="mt-4 text-sm font-medium">{status}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </article>
  );
}
