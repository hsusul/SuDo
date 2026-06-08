"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, ArrowUpRight, Check, FolderKanban, Pencil, Plus, X } from "lucide-react";
import {
  archiveProjectAction,
  createProjectAction,
  updateProjectAction,
  type ProjectActionState,
} from "@/app/app/projects/actions";
import { ActionDialog } from "@/components/action-dialog";
import { AppPanel } from "@/components/ui/app-panel";
import { Button } from "@/components/ui/button";
import { CountBadge } from "@/components/ui/count-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";
import { commandEvents } from "@/lib/command-events";

export type ProjectListItem = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  updatedAt: string;
  createdAt: string;
  activeIssueCount: number;
};

const initialState: ProjectActionState = {};

export function ProjectPanel({
  workspaceId,
  workspaceSlug,
  projects,
  selectedProjectKey,
  initialCommand,
}: {
  workspaceId: string;
  workspaceSlug: string;
  projects: ProjectListItem[];
  selectedProjectKey: string | null;
  initialCommand?: string;
}) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(
    initialCommand === "create-project",
  );

  useEffect(() => {
    function openCreateProject() {
      setIsCreating(true);
    }

    window.addEventListener(commandEvents.createProject, openCreateProject);
    return () =>
      window.removeEventListener(commandEvents.createProject, openCreateProject);
  }, []);

  useEffect(() => {
    if (initialCommand !== "create-project") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    params.delete("command");
    router.replace(`${window.location.pathname}?${params.toString()}`, {
      scroll: false,
    });
  }, [initialCommand, router]);

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Projects"
        title="Workspace projects"
        description="Organize related issues into focused workstreams and keep active load visible."
        metadata={
          <span className="flex items-center gap-1.5 font-mono text-[0.68rem] uppercase text-[#62666d]">
            <CountBadge
              count={projects.length}
              label="active project"
              className={plainCountClassName}
            />
            <span>{projects.length === 1 ? "active project" : "active projects"}</span>
          </span>
        }
        actions={
          <Button type="button" onClick={() => setIsCreating(true)}>
            <Plus className="size-4" aria-hidden="true" />
            New project
          </Button>
        }
      />

      {projects.length === 0 ? (
        <AppPanel className="p-3">
          <EmptyState
            icon={<FolderKanban className="size-5" aria-hidden="true" />}
            title="No projects yet"
            description="Add the first project for this workspace. Keep it broad enough to collect related issues later."
            action={
            <Button
              type="button"
              onClick={() => setIsCreating(true)}
            >
              <Plus className="size-4" aria-hidden="true" />
              Create project
            </Button>
            }
          />
        </AppPanel>
      ) : (
        <AppPanel>
          <div className="grid md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project, index) => (
              <ProjectRow
                key={project.id}
                project={project}
                workspaceSlug={workspaceSlug}
                selected={project.key === selectedProjectKey}
                className={cn(
                  index > 0 && "border-t md:border-t-0",
                  index % 2 === 1 && "md:border-l",
                  index >= 2 && "md:border-t xl:border-t-0",
                  index % 3 !== 0 && "xl:border-l",
                )}
              />
            ))}
          </div>
        </AppPanel>
      )}

      <ActionDialog
        title="New project"
        description="Create a focused container for related issues."
        open={isCreating}
        onOpenChange={setIsCreating}
      >
        <CreateProjectForm workspaceId={workspaceId} workspaceSlug={workspaceSlug} />
      </ActionDialog>
    </div>
  );
}

function CreateProjectForm({
  workspaceId,
  workspaceSlug,
}: {
  workspaceId: string;
  workspaceSlug: string;
}) {
  const [state, formAction] = useActionState(createProjectAction, initialState);

  return (
    <form action={formAction} className="grid gap-3">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
      <div className="grid gap-2">
        <label htmlFor="project-name" className="text-xs font-medium text-muted-foreground">
          Project name
        </label>
        <input
          id="project-name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={80}
          placeholder="Launch Website"
          className={inputClassName}
        />
      </div>
      <div className="grid gap-2">
        <label htmlFor="project-description" className="text-xs font-medium text-muted-foreground">
          Description
        </label>
        <textarea
          id="project-description"
          name="description"
          maxLength={500}
          rows={3}
          placeholder="Optional context for the project."
          className="sudo-textarea"
        />
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <ProjectSubmitButton label="Create project" pendingLabel="Creating..." icon={<Plus className="size-4" />} />
    </form>
  );
}

function ProjectRow({
  project,
  workspaceSlug,
  selected,
  className,
}: {
  project: ProjectListItem;
  workspaceSlug: string;
  selected: boolean;
  className?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <article
      className={cn(
        "group relative grid min-h-72 gap-5 border-border p-5 outline-none transition duration-150 hover:z-10 hover:-translate-y-0.5 hover:bg-[#121315] hover:shadow-[0_18px_40px_rgb(0_0_0_/_28%)] focus-within:bg-[#121315]",
        selected &&
          "bg-[#121315] before:absolute before:inset-x-5 before:top-0 before:h-px before:bg-[#5e6ad2]",
        className,
      )}
    >
      {isEditing ? (
        <EditProjectForm
          project={project}
          workspaceSlug={workspaceSlug}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <div className="flex min-h-full min-w-0 flex-col">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-[4px] border border-[#323334] bg-[#161718] px-2 py-1 font-mono text-[0.68rem] text-[#8a8f98]">
                {project.key}
              </span>
              <span className="font-mono text-[0.64rem] uppercase text-[#62666d]">
                <CountBadge
                  count={project.activeIssueCount}
                  label="active issue"
                  showZero
                  className={plainCountClassName}
                />{" "}
                active
              </span>
            </div>
            <h3 className="mt-5 text-lg font-medium tracking-[-0.01em]">{project.name}</h3>
            <p className="mt-2 line-clamp-4 text-sm leading-6 text-[#8a8f98]">
              {project.description || "No project description yet."}
            </p>
            <div className="mt-auto pt-5">
              <p className="font-mono text-[0.64rem] uppercase text-[#62666d]">
                Updated {formatDate(project.updatedAt)}
              </p>
            </div>
            <Link
              href={`/app/issues?workspace=${workspaceSlug}&project=${project.key}`}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[#aeb5ff] transition hover:text-[#c5caff]"
            >
              {selected ? "Selected for issues" : "View issues"}
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
          <div className="flex items-center gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="size-3.5" aria-hidden="true" />
              Edit
            </Button>
            <ArchiveProjectForm projectId={project.id} workspaceSlug={workspaceSlug} />
          </div>
        </>
      )}
    </article>
  );
}

function EditProjectForm({
  project,
  workspaceSlug,
  onCancel,
}: {
  project: ProjectListItem;
  workspaceSlug: string;
  onCancel: () => void;
}) {
  const [state, formAction] = useActionState(updateProjectAction, initialState);

  return (
    <form action={formAction} className="grid gap-4 lg:col-span-2">
      <input type="hidden" name="projectId" value={project.id} />
      <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
      <div className="grid gap-3">
        <div className="grid gap-2">
          <label htmlFor={`project-name-${project.id}`} className="text-xs font-medium text-muted-foreground">
            Project name
          </label>
          <input
            id={`project-name-${project.id}`}
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={80}
            defaultValue={project.name}
            className={inputClassName}
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor={`project-description-${project.id}`} className="text-xs font-medium text-muted-foreground">
            Description
          </label>
          <textarea
            id={`project-description-${project.id}`}
            name="description"
            maxLength={500}
            rows={3}
            defaultValue={project.description ?? ""}
            className="sudo-textarea"
          />
        </div>
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <div className="flex items-center gap-2">
        <ProjectSubmitButton label="Save changes" pendingLabel="Saving..." icon={<Check className="size-4" />} />
        <Button type="button" variant="ghost" onClick={onCancel}>
          <X className="size-4" aria-hidden="true" />
          Cancel
        </Button>
      </div>
    </form>
  );
}

function ArchiveProjectForm({
  projectId,
  workspaceSlug,
}: {
  projectId: string;
  workspaceSlug: string;
}) {
  const [state, formAction] = useActionState(archiveProjectAction, initialState);

  return (
    <form action={formAction} className="contents">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
      <ArchiveButton />
      {state.error ? (
        <p role="alert" className="text-xs text-destructive">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

function ProjectSubmitButton({
  label,
  pendingLabel,
  icon,
}: {
  label: string;
  pendingLabel: string;
  icon: ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? pendingLabel : label}
      {icon}
    </Button>
  );
}

function ArchiveButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="outline"
      size="sm"
      disabled={pending}
      className="text-[#8a8f98] hover:border-destructive/35 hover:text-[#ff8585]"
    >
      <Archive className="size-3.5" aria-hidden="true" />
      {pending ? "Archiving..." : "Archive"}
    </Button>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

const inputClassName = "sudo-input";
const plainCountClassName =
  "h-auto min-w-0 rounded-none border-0 bg-transparent px-0 text-[0.72rem] text-muted-foreground/72";
