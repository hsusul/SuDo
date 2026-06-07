"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { CircleDashed, Plus } from "lucide-react";
import {
  createWorkspaceAction,
  type CreateWorkspaceState,
} from "@/app/app/actions";
import { ActionDialog } from "@/components/action-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type WorkspaceSwitcherItem = {
  workspaceId: string;
  workspace: {
    id: string;
    name: string;
    slug: string;
  };
};

const initialState: CreateWorkspaceState = {};

export function WorkspaceSwitcher({
  workspaces,
  currentWorkspaceId,
}: {
  workspaces: WorkspaceSwitcherItem[];
  currentWorkspaceId?: string | null;
}) {
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2 px-1">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[#62666d]">
          Workspaces
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Create workspace"
          title="Create workspace"
          onClick={() => setIsCreating(true)}
        >
          <Plus className="size-3.5" aria-hidden="true" />
        </Button>
      </div>

      <div className="space-y-0.5">
        {workspaces.length > 0 ? (
          workspaces.map((membership) => (
            <Link
              key={membership.workspaceId}
              href={`/app/issues?workspace=${membership.workspace.slug}`}
              className={cn(
                "relative flex h-9 items-center gap-2 rounded-md px-2 text-sm text-[#8a8f98] transition duration-150 hover:bg-[#141517] hover:text-[#d0d6e0]",
                currentWorkspaceId === membership.workspaceId &&
                  "bg-[#161718] text-[#f7f8f8] before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-[#5e6ad2]",
              )}
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-[5px] border border-[#323334] bg-[#111214]">
                <CircleDashed className="size-3 text-[#8f99ff]" aria-hidden="true" />
              </span>
              <span className="truncate">{membership.workspace.name}</span>
            </Link>
          ))
        ) : (
          <p className="px-2 py-2 text-xs text-[#62666d]">No workspace yet</p>
        )}
      </div>

      <ActionDialog
        title="New workspace"
        description="Create a separate space for another project, class, or team."
        open={isCreating}
        onOpenChange={setIsCreating}
      >
        <CreateWorkspaceForm />
      </ActionDialog>
    </div>
  );
}

function CreateWorkspaceForm() {
  const [state, formAction] = useActionState(createWorkspaceAction, initialState);

  return (
    <form action={formAction} className="grid gap-3">
      <input type="hidden" name="redirectTo" value="projects" />
      <div className="grid gap-2">
        <label htmlFor="new-workspace-name" className="text-xs font-medium text-muted-foreground">
          Workspace name
        </label>
        <input
          id="new-workspace-name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={80}
          placeholder="Research Lab"
          className="sudo-input"
        />
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <WorkspaceSubmitButton />
    </form>
  );
}

function WorkspaceSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="justify-self-start">
      {pending ? "Creating..." : "Create workspace"}
      <Plus className="size-4" aria-hidden="true" />
    </Button>
  );
}
