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
      <div className="flex items-center justify-between gap-2 px-2 pb-2">
        <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-sidebar-foreground/38">
          Workspace
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

      <div className="space-y-1">
        {workspaces.length > 0 ? (
          workspaces.map((membership) => (
            <Link
              key={membership.workspaceId}
              href={`/app/issues?workspace=${membership.workspace.slug}`}
              className={cn(
                "flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm text-sidebar-foreground/65 transition-colors hover:bg-sidebar-accent/62 hover:text-sidebar-accent-foreground",
                currentWorkspaceId === membership.workspaceId &&
                  "bg-sidebar-accent/78 text-sidebar-accent-foreground",
              )}
            >
              <CircleDashed className="size-4" aria-hidden="true" />
              <span className="truncate">{membership.workspace.name}</span>
            </Link>
          ))
        ) : (
          <p className="px-2 text-sm text-sidebar-foreground/45">No workspace yet</p>
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
          className="h-9 w-full rounded-md border border-input/70 bg-background/58 px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/55 focus:border-ring focus:ring-2 focus:ring-ring/20"
        />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
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
