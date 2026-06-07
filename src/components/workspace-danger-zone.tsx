"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertTriangle, Trash2 } from "lucide-react";
import {
  deleteWorkspaceAction,
  type DeleteWorkspaceState,
} from "@/app/app/settings/actions";
import { ActionDialog } from "@/components/action-dialog";
import { Button } from "@/components/ui/button";
import {
  isWorkspaceDeleteConfirmationValid,
  WORKSPACE_DANGER_ZONE_TITLE,
  WORKSPACE_DELETE_BUTTON_LABEL,
  WORKSPACE_DELETE_FINAL_BUTTON_LABEL,
  WORKSPACE_DELETE_WARNING_ITEMS,
} from "@/lib/workspace-delete";

const initialState: DeleteWorkspaceState = {};

export function WorkspaceDangerZone({
  workspace,
}: {
  workspace: {
    id: string;
    name: string;
  };
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="relative overflow-hidden rounded-xl border border-destructive/35 bg-[#120d0e] p-5 shadow-[0_20px_60px_rgb(0_0_0_/_20%)] sm:p-6">
      <div className="absolute inset-y-0 left-0 w-0.5 bg-destructive" aria-hidden="true" />
      <div className="relative">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-4" aria-hidden="true" />
            <h3 className="text-sm font-medium text-foreground">
              {WORKSPACE_DANGER_ZONE_TITLE}
            </h3>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Permanently delete this workspace and all data that belongs to it. This
            action cannot be undone.
          </p>
        </div>
        <Button
          type="button"
          variant="destructive"
          className="self-start"
          onClick={() => setIsOpen(true)}
        >
          {WORKSPACE_DELETE_BUTTON_LABEL}
          <Trash2 className="size-4" aria-hidden="true" />
        </Button>
      </div>
      </div>

      <ActionDialog
        title="Delete workspace"
        description="This is a permanent action. Confirm the exact workspace name before deleting."
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <DeleteWorkspaceForm workspace={workspace} />
      </ActionDialog>
    </section>
  );
}

function DeleteWorkspaceForm({
  workspace,
}: {
  workspace: {
    id: string;
    name: string;
  };
}) {
  const [state, formAction] = useActionState(deleteWorkspaceAction, initialState);
  const [confirmationName, setConfirmationName] = useState("");
  const canSubmit = isWorkspaceDeleteConfirmationValid({
    workspaceName: workspace.name,
    confirmationName,
  });
  const warningText = useMemo(
    () => WORKSPACE_DELETE_WARNING_ITEMS.join(", ").replace(/, ([^,]*)$/, ", and $1"),
    [],
  );

  return (
    <form action={formAction} className="grid gap-5">
      <input type="hidden" name="workspaceId" value={workspace.id} />
      <div className="rounded-md border border-destructive/25 bg-destructive/[0.07] p-4">
        <p className="text-sm font-medium text-foreground">
          Deleting <span className="font-semibold">{workspace.name}</span> will
          permanently delete associated workspace data.
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          This includes {warningText}. Existing users are not deleted, but this
          workspace and its records are removed.
        </p>
      </div>

      <div className="grid gap-2">
        <label
          htmlFor="delete-workspace-confirmation"
          className="text-xs font-medium text-muted-foreground"
        >
          Type <span className="text-foreground">{workspace.name}</span> to confirm
        </label>
        <input
          id="delete-workspace-confirmation"
          name="confirmationName"
          type="text"
          autoComplete="off"
          value={confirmationName}
          onChange={(event) => setConfirmationName(event.target.value)}
          className="sudo-input"
        />
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <SubmitDeleteWorkspaceButton enabled={canSubmit} />
      </div>
    </form>
  );
}

function SubmitDeleteWorkspaceButton({ enabled }: { enabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="destructive"
      disabled={!enabled || pending}
    >
      {pending ? "Deleting..." : WORKSPACE_DELETE_FINAL_BUTTON_LABEL}
      <Trash2 className="size-4" aria-hidden="true" />
    </Button>
  );
}
