"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, Bookmark, Check, Pencil, Trash2, X } from "lucide-react";
import {
  deleteSavedViewAction,
  renameSavedViewAction,
  type SavedViewActionState,
} from "@/app/app/views/actions";
import { ActionDialog } from "@/components/action-dialog";
import { AppPanel, AppPanelHeader } from "@/components/ui/app-panel";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { IssueFilters } from "@/lib/issue-filter-validation";
import { buildIssueListPath } from "@/lib/issue-url";

export type SavedViewListItem = {
  id: string;
  name: string;
  filters: IssueFilters;
  updatedAt: string;
  canManage: boolean;
  project: {
    id: string;
    key: string;
    name: string;
  };
  creator: {
    name: string | null;
    email: string;
  } | null;
};

const initialState: SavedViewActionState = {};

export function SavedViewsPanel({
  workspaceId,
  workspaceSlug,
  savedViews,
}: {
  workspaceId: string;
  workspaceSlug: string;
  savedViews: SavedViewListItem[];
}) {
  return (
    <AppPanel>
      <AppPanelHeader className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[#d0d6e0]">
          <Bookmark className="size-4 text-[#e4f222]" aria-hidden="true" />
          <div>
            <h2 className="text-sm font-medium">Saved views</h2>
            <p className="mt-1 text-xs text-[#8a8f98]">
              Shared filter sets for this workspace.
            </p>
          </div>
        </div>
        <span className="font-mono text-[0.62rem] uppercase text-[#62666d]">
          {savedViews.length} saved
        </span>
      </AppPanelHeader>

      {savedViews.length === 0 ? (
        <div className="p-3">
          <EmptyState
            icon={<Bookmark className="size-5" aria-hidden="true" />}
            title="No saved views"
            description="Open an issue list, apply useful filters, then choose Save current view or use the command menu."
          />
        </div>
      ) : (
        <div className="divide-y divide-border">
          {savedViews.map((view) => (
            <SavedViewRow
              key={view.id}
              workspaceId={workspaceId}
              workspaceSlug={workspaceSlug}
              view={view}
            />
          ))}
        </div>
      )}
    </AppPanel>
  );
}

function SavedViewRow({
  workspaceId,
  workspaceSlug,
  view,
}: {
  workspaceId: string;
  workspaceSlug: string;
  view: SavedViewListItem;
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const filterSummary = describeFilters(view.filters);

  return (
    <div
      data-testid="saved-view-row"
      className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6"
    >
      <Link
        href={buildIssueListPath({
          workspaceSlug,
          projectKey: view.project.key,
          filters: view.filters,
        })}
        className="group min-w-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#5e6ad2]/35"
      >
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-[#d0d6e0]">
            {view.name}
          </span>
          <span className="shrink-0 rounded-[4px] border border-[#323334] bg-[#161718] px-1.5 py-0.5 font-mono text-[0.6rem] text-[#8a8f98]">
            {view.project.key}
          </span>
        </div>
        <p className="mt-1 truncate text-xs text-[#8a8f98]">
          {filterSummary}
        </p>
        <p className="mt-1 font-mono text-[0.6rem] text-[#62666d]">
          {view.creator
            ? `Saved by ${view.creator.name ?? view.creator.email}`
            : "Workspace saved view"}
        </p>
      </Link>

      <div className="flex items-center justify-end gap-1">
        {view.canManage ? (
          <>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              onClick={() => setIsRenaming(true)}
              aria-label={`Rename ${view.name}`}
              title="Rename saved view"
            >
              <Pencil className="size-3.5" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              onClick={() => setIsDeleting(true)}
              className="hover:text-destructive"
              aria-label={`Delete ${view.name}`}
              title="Delete saved view"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
            </Button>
          </>
        ) : null}
        <Button asChild type="button" size="icon-sm" variant="ghost">
          <Link
            href={buildIssueListPath({
              workspaceSlug,
              projectKey: view.project.key,
              filters: view.filters,
            })}
            aria-label={`Open ${view.name}`}
            title="Open saved view"
          >
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </Button>
      </div>

      <ActionDialog
        title="Rename saved view"
        description="Names are unique inside this workspace."
        open={isRenaming}
        onOpenChange={setIsRenaming}
      >
        <RenameSavedViewForm
          workspaceId={workspaceId}
          workspaceSlug={workspaceSlug}
          savedViewId={view.id}
          currentName={view.name}
          onCancel={() => setIsRenaming(false)}
        />
      </ActionDialog>

      <ActionDialog
        title="Delete saved view"
        description="This removes the shortcut only. Issues and filters are not changed."
        open={isDeleting}
        onOpenChange={setIsDeleting}
      >
        <DeleteSavedViewForm
          workspaceId={workspaceId}
          workspaceSlug={workspaceSlug}
          savedViewId={view.id}
          name={view.name}
          onCancel={() => setIsDeleting(false)}
        />
      </ActionDialog>
    </div>
  );
}

function RenameSavedViewForm({
  workspaceId,
  workspaceSlug,
  savedViewId,
  currentName,
  onCancel,
}: {
  workspaceId: string;
  workspaceSlug: string;
  savedViewId: string;
  currentName: string;
  onCancel: () => void;
}) {
  const [state, formAction] = useActionState(
    renameSavedViewAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
      <input type="hidden" name="savedViewId" value={savedViewId} />
      <div className="grid gap-2">
        <label
          htmlFor={`saved-view-name-${savedViewId}`}
          className="text-xs font-medium text-muted-foreground"
        >
          View name
        </label>
        <input
          id={`saved-view-name-${savedViewId}`}
          name="name"
          required
          minLength={2}
          maxLength={80}
          defaultValue={currentName}
          className="sudo-input"
        />
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <div className="flex items-center gap-2">
        <RenameSubmitButton />
        <Button type="button" variant="ghost" onClick={onCancel}>
          <X className="size-4" aria-hidden="true" />
          Cancel
        </Button>
      </div>
    </form>
  );
}

function RenameSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      <Check className="size-4" aria-hidden="true" />
      {pending ? "Saving..." : "Save name"}
    </Button>
  );
}

function DeleteSavedViewForm({
  workspaceId,
  workspaceSlug,
  savedViewId,
  name,
  onCancel,
}: {
  workspaceId: string;
  workspaceSlug: string;
  savedViewId: string;
  name: string;
  onCancel: () => void;
}) {
  const [state, formAction] = useActionState(
    deleteSavedViewAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
      <input type="hidden" name="savedViewId" value={savedViewId} />
      <p className="text-sm leading-6 text-[#8a8f98]">
        Delete <span className="font-medium text-[#d0d6e0]">{name}</span> from
        this workspace?
      </p>
      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <div className="flex items-center gap-2">
        <DeleteSubmitButton />
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function DeleteSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="destructive" disabled={pending}>
      <Trash2 className="size-4" aria-hidden="true" />
      {pending ? "Deleting..." : "Delete view"}
    </Button>
  );
}

function describeFilters(filters: IssueFilters) {
  const parts = [
    filters.status ? `status ${filters.status.replaceAll("_", " ")}` : null,
    filters.priority ? `${filters.priority} priority` : null,
    filters.labelId ? "one label" : null,
    filters.query ? `search "${filters.query}"` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : "All active issues";
}
