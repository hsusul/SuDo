"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";
import Link from "next/link";
import { Archive, Check, FolderKanban, Pencil, Plus, X } from "lucide-react";
import {
  archiveProjectAction,
  createProjectAction,
  updateProjectAction,
  type ProjectActionState,
} from "@/app/app/projects/actions";
import { ActionDialog } from "@/components/action-dialog";
import { Button } from "@/components/ui/button";
import { CountBadge } from "@/components/ui/count-badge";
import { cn } from "@/lib/utils";

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
}: {
  workspaceId: string;
  workspaceSlug: string;
  projects: ProjectListItem[];
  selectedProjectKey: string | null;
}) {
  const [isCreating, setIsCreating] = useState(false);

  return (
    <section className="overflow-hidden rounded-xl border border-border/70 bg-card/82">
      <div className="flex flex-col gap-4 border-b border-border/55 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground/85">
            Projects
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-normal">
            Workspace projects
          </h2>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <CountBadge count={projects.length} label="active project" />
            <span>{projects.length === 1 ? "active project" : "active projects"}</span>
          </div>
        </div>
        <Button
          type="button"
          size="icon"
          aria-label="Create project"
          title="Create project"
          onClick={() => setIsCreating(true)}
        >
          <Plus className="size-4" aria-hidden="true" />
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="p-6">
          <div className="rounded-lg border border-dashed border-border/55 bg-background/28 p-8 text-center">
            <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-lg border border-border/55 bg-muted/40 text-muted-foreground">
              <FolderKanban className="size-5" aria-hidden="true" />
            </div>
            <h3 className="text-base font-medium">No projects yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Add the first project for this workspace. Keep it broad enough to
              collect related issues later.
            </p>
            <Button
              type="button"
              className="mt-5"
              onClick={() => setIsCreating(true)}
            >
              <Plus className="size-4" aria-hidden="true" />
              Create project
            </Button>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-border/45">
          {projects.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              workspaceSlug={workspaceSlug}
              selected={project.key === selectedProjectKey}
            />
          ))}
        </div>
      )}

      <ActionDialog
        title="New project"
        description="Create a focused container for related issues."
        open={isCreating}
        onOpenChange={setIsCreating}
      >
        <CreateProjectForm workspaceId={workspaceId} workspaceSlug={workspaceSlug} />
      </ActionDialog>
    </section>
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
          className={cn(inputClassName, "h-auto resize-none py-2")}
        />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <ProjectSubmitButton label="Create project" pendingLabel="Creating..." icon={<Plus className="size-4" />} />
    </form>
  );
}

function ProjectRow({
  project,
  workspaceSlug,
  selected,
}: {
  project: ProjectListItem;
  workspaceSlug: string;
  selected: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <article
      className={cn(
        "grid gap-4 p-5 transition duration-200 hover:bg-muted/12 lg:grid-cols-[1fr_auto] lg:items-start",
        selected && "bg-muted/16",
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
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-border/60 bg-background/50 px-2 py-1 font-mono text-xs text-muted-foreground">
                {project.key}
              </span>
              <h3 className="truncate text-base font-medium">{project.name}</h3>
              <CountBadge
                count={project.activeIssueCount}
                label="active issue"
                showZero
                className="ml-0.5"
              />
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {project.description || "No project description yet."}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Updated {formatDate(project.updatedAt)}
            </p>
            <Link
              href={`/app/issues?workspace=${workspaceSlug}&project=${project.key}`}
              className="mt-3 inline-flex text-xs font-medium text-foreground/82 underline-offset-4 transition hover:text-foreground hover:underline"
            >
              {selected ? "Selected for issues" : "View issues"}
            </Link>
          </div>
          <div className="flex items-center gap-2">
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
    <form action={formAction} className="grid gap-3 lg:col-span-2">
      <input type="hidden" name="projectId" value={project.id} />
      <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
      <div className="grid gap-3 sm:grid-cols-[16rem_1fr]">
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
          <input
            id={`project-description-${project.id}`}
            name="description"
            type="text"
            maxLength={500}
            defaultValue={project.description ?? ""}
            className={inputClassName}
          />
        </div>
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
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
      {state.error ? <p className="sr-only">{state.error}</p> : null}
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
    <Button type="submit" variant="destructive" size="sm" disabled={pending}>
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

const inputClassName =
  "h-9 w-full rounded-md border border-input/70 bg-background/58 px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/55 focus:border-ring focus:ring-2 focus:ring-ring/20";
