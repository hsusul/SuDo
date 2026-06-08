"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  Bookmark,
  Check,
  CircleDot,
  Clock3,
  MessageSquare,
  Plus,
  Search,
  Send,
  Tag,
  UserRound,
  X,
} from "lucide-react";
import {
  createCommentAction,
  type CommentActionState,
} from "@/app/app/comments/actions";
import {
  addLabelToIssueAction,
  createLabelAction,
  removeLabelFromIssueAction,
  type LabelActionState,
} from "@/app/app/labels/actions";
import {
  archiveIssueAction,
  createIssueAction,
  updateIssueAction,
  type IssueActionState,
} from "@/app/app/issues/actions";
import {
  createSavedViewAction,
  type SavedViewActionState,
} from "@/app/app/views/actions";
import { ActionDialog } from "@/components/action-dialog";
import { AppPanel } from "@/components/ui/app-panel";
import { Button } from "@/components/ui/button";
import { CountBadge } from "@/components/ui/count-badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  FormSelect,
  type FormSelectOption,
} from "@/components/ui/form-select";
import {
  LabelChip,
  PriorityBadge as PriorityTag,
  StatusBadge as StatusTag,
} from "@/components/ui/issue-badges";
import { PageHeader } from "@/components/ui/page-header";
import {
  formatIssuePriority,
  formatIssueStatus,
  issuePriorityValues,
  issueStatusValues,
  type IssuePriorityValue,
  type IssueStatusValue,
} from "@/lib/issue-validation";
import {
  hasIssueFilters,
  type IssueFilters,
} from "@/lib/issue-filter-validation";
import { buildIssueListPath } from "@/lib/issue-url";
import { labelColorValues } from "@/lib/label-validation";
import { cn } from "@/lib/utils";
import { commandEvents } from "@/lib/command-events";

export type IssueListItem = {
  id: string;
  issueKey: string;
  title: string;
  description: string | null;
  status: IssueStatusValue;
  priority: IssuePriorityValue;
  updatedAt: string;
  createdAt: string;
  labels: IssueLabelItem[];
  assignee: IssueAssigneeItem | null;
};

export type SelectedIssueProject = {
  id: string;
  key: string;
  name: string;
};

export type IssueDetailItem = IssueListItem & {
  issueNumber: number;
  project: SelectedIssueProject;
  comments: IssueCommentItem[];
  activity: IssueActivityItem[];
};

export type IssueLabelItem = {
  id: string;
  name: string;
  color: string;
};

export type IssueCommentItem = {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string | null;
    imageUrl: string | null;
  };
};

export type IssueAssigneeItem = {
  id: string;
  name: string | null;
  email: string;
  imageUrl: string | null;
};

export type WorkspaceIssueMember = {
  id: string;
  role: "owner" | "admin" | "member";
  user: IssueAssigneeItem;
};

export type IssueActivityItem = {
  id: string;
  action: string;
  metadata: Record<string, string | string[] | null> | null;
  createdAt: string;
  actor: IssueAssigneeItem | null;
};

const initialState: IssueActionState = {};
const initialCommentState: CommentActionState = {};
const initialLabelState: LabelActionState = {};
const initialSavedViewState: SavedViewActionState = {};

export function IssuePanel({
  workspaceSlug,
  workspaceId,
  project,
  projects = [],
  issues,
  workspaceLabels,
  workspaceMembers,
  filters,
  selectedIssue,
  initialCommand,
}: {
  workspaceSlug: string;
  workspaceId: string;
  project: SelectedIssueProject | null;
  projects?: SelectedIssueProject[];
  issues: IssueListItem[];
  workspaceLabels: IssueLabelItem[];
  workspaceMembers: WorkspaceIssueMember[];
  filters: IssueFilters;
  selectedIssue?: IssueDetailItem | null;
  initialCommand?: string;
}) {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isCreating, setIsCreating] = useState(
    initialCommand === "create-issue",
  );
  const [isSavingView, setIsSavingView] = useState(
    initialCommand === "save-view",
  );
  const [editingIssue, setEditingIssue] = useState<IssueListItem | null>(null);
  const hasActiveFilters = hasIssueFilters(filters);

  useEffect(() => {
    function openCreateIssue() {
      setIsCreating(true);
    }

    function openSaveView() {
      setIsSavingView(true);
    }

    function focusIssueSearch() {
      searchInputRef.current?.focus();
    }

    window.addEventListener(commandEvents.createIssue, openCreateIssue);
    window.addEventListener(commandEvents.saveView, openSaveView);
    window.addEventListener(commandEvents.searchIssues, focusIssueSearch);

    return () => {
      window.removeEventListener(commandEvents.createIssue, openCreateIssue);
      window.removeEventListener(commandEvents.saveView, openSaveView);
      window.removeEventListener(commandEvents.searchIssues, focusIssueSearch);
    };
  }, []);

  useEffect(() => {
    if (!initialCommand) {
      return;
    }

    if (initialCommand === "search-issues") {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    } else if (
      initialCommand !== "create-issue" &&
      initialCommand !== "save-view"
    ) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    params.delete("command");
    router.replace(`${window.location.pathname}?${params.toString()}`, {
      scroll: false,
    });
  }, [initialCommand, router]);

  if (!project) {
    return (
      <AppPanel className="p-3">
        <EmptyState
          icon={<CircleDot className="size-5" aria-hidden="true" />}
          title="Create a project to track issues"
          description="Issues are scoped to projects. Add an active project first, then capture the first task here."
          action={
            <Button asChild>
              <Link href={`/app/projects?workspace=${workspaceSlug}`}>
                <Plus className="size-4" aria-hidden="true" />
                Create project
              </Link>
            </Button>
          }
        />
      </AppPanel>
    );
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Issues"
        title={project.name}
        description="Scan the active pipeline, narrow the list, and open an issue for full context."
        metadata={
          <>
            <span className="rounded-[4px] border border-[#323334] bg-[#161718] px-2 py-1 font-mono text-[0.68rem] text-[#8a8f98]">
              {project.key}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[0.66rem] uppercase text-[#62666d]">
              <CountBadge
                count={issues.length}
                label={hasActiveFilters ? "matching issue" : "active issue"}
                className={plainCountClassName}
              />
              <span>
                {hasActiveFilters
                  ? issues.length === 1
                    ? "matching issue"
                    : "matching issues"
                  : issues.length === 1
                    ? "active issue"
                    : "active issues"}
              </span>
            </span>
          </>
        }
        actions={
          <Button type="button" onClick={() => setIsCreating(true)}>
            <Plus className="size-4" aria-hidden="true" />
            New issue
          </Button>
        }
      />

      {projects.length > 1 ? (
        <div className="flex gap-1 overflow-x-auto border-b border-border pb-3">
            {projects.map((item) => (
              <Link
                key={item.id}
                href={`/app/issues?workspace=${workspaceSlug}&project=${item.key}`}
                className={cn(
                  "shrink-0 rounded-md border px-3 py-2 text-xs transition duration-150",
                  item.id === project.id
                    ? "border-[#323334] bg-[#161718] text-foreground"
                    : "border-transparent text-[#8a8f98] hover:bg-[#141517] hover:text-[#d0d6e0]",
                )}
              >
                <span className="mr-2 font-mono text-[#62666d]">{item.key}</span>
                {item.name}
              </Link>
            ))}
          </div>
      ) : null}

      <AppPanel>
        <IssueFilterBar
          workspaceSlug={workspaceSlug}
          projectKey={project.key}
          filters={filters}
          workspaceLabels={workspaceLabels}
          onSaveView={() => setIsSavingView(true)}
          searchInputRef={searchInputRef}
        />

        {issues.length === 0 ? (
          <div className="p-3">
            <EmptyState
              icon={<CircleDot className="size-5" aria-hidden="true" />}
              title={hasActiveFilters ? "No matching issues" : "No issues in this project"}
              description={
                hasActiveFilters
                ? "Try a different search or clear filters to return to the active issue list."
                : "Create the first issue with a clear title, starting status, and priority."
              }
              action={
                hasActiveFilters ? (
                  <Button asChild variant="outline">
                    <Link href={buildIssueListPath({ workspaceSlug, projectKey: project.key })}>
                      Clear filters
                    </Link>
                  </Button>
                ) : (
                  <Button type="button" onClick={() => setIsCreating(true)}>
                    <Plus className="size-4" aria-hidden="true" />
                    Create issue
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <>
            <div className="hidden grid-cols-[5rem_minmax(13rem,1fr)_8rem_6rem_7rem_7rem_5rem] border-b border-border bg-[#0c0d0e] px-5 py-2.5 font-mono text-[0.6rem] uppercase text-[#62666d] lg:grid">
              <span>ID</span>
              <span>Issue</span>
              <span>Status</span>
              <span>Priority</span>
              <span>Assignee</span>
              <span>Updated</span>
              <span className="text-right">Action</span>
            </div>
            <div className="divide-y divide-border">
              {issues.map((issue) => (
                <IssueRow
                  key={issue.id}
                  issue={issue}
                  workspaceSlug={workspaceSlug}
                  projectKey={project.key}
                  filters={filters}
                  selected={issue.id === selectedIssue?.id}
                  onEditIssue={setEditingIssue}
                />
              ))}
            </div>
          </>
        )}
      </AppPanel>

      <ActionDialog
        title="Save current view"
        description="Create a workspace-shared shortcut from this project and filter set."
        open={isSavingView}
        onOpenChange={setIsSavingView}
      >
        <CreateSavedViewForm
          workspaceId={workspaceId}
          workspaceSlug={workspaceSlug}
          project={project}
          filters={filters}
        />
      </ActionDialog>

      <ActionDialog
        title="New issue"
        description={`Create an issue in ${project.name}.`}
        open={isCreating}
        onOpenChange={setIsCreating}
      >
        <CreateIssueForm
          workspaceSlug={workspaceSlug}
          project={project}
          filters={filters}
          workspaceMembers={workspaceMembers}
        />
      </ActionDialog>

      <ActionDialog
        title="Edit issue"
        description="Double-click an issue row to update it without leaving the list."
        open={editingIssue !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingIssue(null);
          }
        }}
      >
        {editingIssue ? (
          <EditIssueForm
            issue={editingIssue}
            workspaceSlug={workspaceSlug}
            projectKey={project.key}
            filters={filters}
            workspaceMembers={workspaceMembers}
            onCancel={() => setEditingIssue(null)}
          />
        ) : null}
      </ActionDialog>

      {selectedIssue ? (
        <IssueDetailDrawer
          issue={selectedIssue}
          workspaceId={workspaceId}
          workspaceLabels={workspaceLabels}
          workspaceSlug={workspaceSlug}
          filters={filters}
        />
      ) : null}
    </div>
  );
}

function IssueFilterBar({
  workspaceSlug,
  projectKey,
  filters,
  workspaceLabels,
  onSaveView,
  searchInputRef,
}: {
  workspaceSlug: string;
  projectKey: string;
  filters: IssueFilters;
  workspaceLabels: IssueLabelItem[];
  onSaveView: () => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const selectedLabel = workspaceLabels.find((label) => label.id === filters.labelId);
  const activeFilters = [
    filters.status ? `Status: ${formatIssueStatus(filters.status)}` : null,
    filters.priority ? `Priority: ${formatIssuePriority(filters.priority)}` : null,
    selectedLabel ? `Label: ${selectedLabel.name}` : null,
    filters.query ? `Search: ${filters.query}` : null,
  ].filter(Boolean);
  const hasActiveFilters = hasIssueFilters(filters);

  return (
    <div className="grid gap-3 border-b border-border bg-[#0c0d0e] p-4 sm:p-5">
      <form
        action="/app/issues"
        method="get"
        className="grid gap-2 lg:grid-cols-[minmax(12rem,1fr)_10rem_10rem_10rem_auto] lg:items-end"
      >
        <input type="hidden" name="workspace" value={workspaceSlug} />
        <input type="hidden" name="project" value={projectKey} />
        <div className="grid gap-1.5">
          <label htmlFor="issue-filter-query" className="text-xs font-medium text-muted-foreground">
            Search
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              ref={searchInputRef}
              id="issue-filter-query"
              name="q"
              type="search"
              maxLength={120}
              defaultValue={filters.query ?? ""}
              placeholder="Title, description, or key"
              className={cn(inputClassName, "!pl-9")}
            />
          </div>
        </div>
        <FilterSelect
          name="status"
          label="Status"
          defaultValue={filters.status ?? ""}
          options={[
            { value: "", label: "Any status" },
            ...issueStatusValues.map((status) => ({
              value: status,
              label: formatIssueStatus(status),
              swatch: getStatusFilterColor(status),
            })),
          ]}
        />
        <FilterSelect
          name="priority"
          label="Priority"
          defaultValue={filters.priority ?? ""}
          options={[
            { value: "", label: "Any priority" },
            ...issuePriorityValues.map((priority) => ({
              value: priority,
              label: formatIssuePriority(priority),
              swatch: getPriorityFilterColor(priority),
            })),
          ]}
        />
        <FilterSelect
          name="label"
          label="Label"
          defaultValue={filters.labelId ?? ""}
          options={[
            { value: "", label: "Any label" },
            ...workspaceLabels.map((label) => ({
              value: label.id,
              label: label.name,
              swatch: getLabelHex(label.color),
            })),
          ]}
        />
        <div className="flex items-center gap-1">
          <Button type="submit" variant="outline">
            Apply
          </Button>
          <Button type="button" variant="ghost" onClick={onSaveView}>
            <Bookmark className="size-3.5" aria-hidden="true" />
            Save view
          </Button>
          {hasActiveFilters ? (
            <Button asChild variant="ghost">
              <Link href={buildIssueListPath({ workspaceSlug, projectKey })}>
                Clear
              </Link>
            </Button>
          ) : null}
        </div>
      </form>
      {activeFilters.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((label) => (
            <span key={label} className="rounded-[4px] border border-[#323334] bg-[#161718] px-2 py-1 text-xs text-[#8a8f98]">
              {label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CreateSavedViewForm({
  workspaceId,
  workspaceSlug,
  project,
  filters,
}: {
  workspaceId: string;
  workspaceSlug: string;
  project: SelectedIssueProject;
  filters: IssueFilters;
}) {
  const [state, formAction] = useActionState(
    createSavedViewAction,
    initialSavedViewState,
  );

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
      <input type="hidden" name="projectId" value={project.id} />
      <input type="hidden" name="projectKey" value={project.key} />
      <input type="hidden" name="status" value={filters.status ?? ""} />
      <input type="hidden" name="priority" value={filters.priority ?? ""} />
      <input type="hidden" name="labelId" value={filters.labelId ?? ""} />
      <input type="hidden" name="query" value={filters.query ?? ""} />
      <div className="grid gap-2">
        <label
          htmlFor="saved-view-name"
          className="text-xs font-medium text-muted-foreground"
        >
          View name
        </label>
        <input
          id="saved-view-name"
          name="name"
          required
          minLength={2}
          maxLength={80}
          placeholder="Launch blockers"
          className="sudo-input"
        />
      </div>
      <div className="rounded-md border border-[#323334] bg-[#0c0d0e] px-3 py-2.5">
        <p className="font-mono text-[0.6rem] uppercase text-[#62666d]">
          Project
        </p>
        <p className="mt-1 text-sm text-[#d0d6e0]">
          {project.name} ({project.key})
        </p>
        <p className="mt-2 text-xs text-[#8a8f98]">
          {describeSavedViewFilters(filters)}
        </p>
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <SavedViewSubmitButton />
    </form>
  );
}

function SavedViewSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      <Bookmark className="size-4" aria-hidden="true" />
      {pending ? "Saving..." : "Save current view"}
    </Button>
  );
}

function describeSavedViewFilters(filters: IssueFilters) {
  const parts = [
    filters.status ? `Status ${formatIssueStatus(filters.status)}` : null,
    filters.priority
      ? `Priority ${formatIssuePriority(filters.priority)}`
      : null,
    filters.labelId ? "Label filter" : null,
    filters.query ? `Search "${filters.query}"` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : "All active issues";
}

function FilterSelect({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue: string;
  options: FormSelectOption[];
}) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={`issue-filter-${name}`} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <FormSelect
        id={`issue-filter-${name}`}
        name={name}
        defaultValue={defaultValue}
        options={options}
      />
    </div>
  );
}

function CreateIssueForm({
  workspaceSlug,
  project,
  filters,
  workspaceMembers,
}: {
  workspaceSlug: string;
  project: SelectedIssueProject;
  filters: IssueFilters;
  workspaceMembers: WorkspaceIssueMember[];
}) {
  const [state, formAction] = useActionState(createIssueAction, initialState);

  return (
    <form action={formAction} className="grid gap-3">
      <input type="hidden" name="projectId" value={project.id} />
      <input type="hidden" name="projectKey" value={project.key} />
      <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
      <IssueFilterHiddenFields filters={filters} />
      <div className="grid gap-2">
        <label htmlFor="issue-title" className="text-xs font-medium text-muted-foreground">
          Issue title
        </label>
        <input
          id="issue-title"
          name="title"
          type="text"
          required
          minLength={2}
          maxLength={140}
          placeholder="Add deployment checklist"
          className={inputClassName}
        />
      </div>
      <div className="grid gap-2">
        <label htmlFor="issue-description" className="text-xs font-medium text-muted-foreground">
          Description
        </label>
        <textarea
          id="issue-description"
          name="description"
          maxLength={2000}
          rows={3}
          placeholder="Optional implementation notes."
          className="sudo-textarea"
        />
      </div>
      <IssueSelectGrid workspaceMembers={workspaceMembers} />
      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <IssueSubmitButton label="Create issue" pendingLabel="Creating..." icon={<Plus className="size-4" />} />
    </form>
  );
}

function IssueRow({
  issue,
  workspaceSlug,
  projectKey,
  filters,
  selected,
  onEditIssue,
}: {
  issue: IssueListItem;
  workspaceSlug: string;
  projectKey: string;
  filters: IssueFilters;
  selected: boolean;
  onEditIssue: (issue: IssueListItem) => void;
}) {
  const router = useRouter();
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const detailHref = buildIssueListPath({
    workspaceSlug,
    projectKey,
    issueId: issue.id,
    filters,
  });

  function clearPendingNavigation() {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
  }

  function handleRowClick(event: MouseEvent<HTMLDivElement>) {
    clearPendingNavigation();
    if (event.detail > 1) {
      onEditIssue(issue);
      return;
    }

    clickTimerRef.current = setTimeout(() => {
      router.push(detailHref);
      clickTimerRef.current = null;
    }, 180);
  }

  return (
    <article
      data-testid="issue-row"
      data-issue-key={issue.issueKey}
      className={cn(
        "group relative px-5 py-3 transition duration-150 hover:bg-[#141517]",
        selected &&
          "bg-[#121315] before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-[#5e6ad2]",
      )}
    >
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_5rem] lg:items-center">
        <div
          role="link"
          tabIndex={0}
          onClick={handleRowClick}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              router.push(detailHref);
            }
          }}
          className="grid min-w-0 cursor-pointer gap-2 rounded-md outline-none transition focus-visible:ring-2 focus-visible:ring-ring/30 lg:grid-cols-[5rem_minmax(0,1fr)_8rem_6rem_7rem_7rem] lg:items-center"
        >
          <span className="font-mono text-[0.68rem] text-[#62666d]">
            {issue.issueKey}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium text-[#d0d6e0]">{issue.title}</h3>
            <p className="mt-0.5 truncate text-xs text-[#62666d]">
              {issue.description || "No description yet."}
            </p>
            {issue.labels.length > 0 ? (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {issue.labels.map((label) => (
                  <LabelPill key={label.id} label={label} />
                ))}
              </div>
            ) : null}
          </div>
          <StatusTag status={issue.status} label={formatIssueStatus(issue.status)} />
          <PriorityTag priority={issue.priority} label={formatIssuePriority(issue.priority)} />
          <AssigneeSummary assignee={issue.assignee} />
          <p className="font-mono text-[0.64rem] text-[#62666d]">
            {formatDate(issue.updatedAt)}
          </p>
        </div>
        <div className="flex items-center justify-end gap-2" onClick={clearPendingNavigation}>
          <ArchiveIssueForm
            issueId={issue.id}
            workspaceSlug={workspaceSlug}
            projectKey={projectKey}
            filters={filters}
          />
        </div>
      </div>
    </article>
  );
}

function EditIssueForm({
  issue,
  workspaceSlug,
  projectKey,
  filters,
  onCancel,
  returnToIssueId,
  workspaceMembers,
}: {
  issue: IssueListItem;
  workspaceSlug: string;
  projectKey: string;
  filters: IssueFilters;
  onCancel: () => void;
  returnToIssueId?: string;
  workspaceMembers: WorkspaceIssueMember[];
}) {
  const [state, formAction] = useActionState(updateIssueAction, initialState);

  return (
    <form action={formAction} className="grid gap-3">
      <input type="hidden" name="issueId" value={issue.id} />
      <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
      <input type="hidden" name="projectKey" value={projectKey} />
      <IssueFilterHiddenFields filters={filters} />
      {returnToIssueId ? (
        <input type="hidden" name="returnToIssueId" value={returnToIssueId} />
      ) : null}
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_11rem_9rem_12rem]">
        <div className="grid gap-2">
          <label htmlFor={`issue-title-${issue.id}`} className="text-xs font-medium text-muted-foreground">
            Issue title
          </label>
          <input
            id={`issue-title-${issue.id}`}
            name="title"
            type="text"
            required
            minLength={2}
            maxLength={140}
            defaultValue={issue.title}
            className={inputClassName}
          />
        </div>
        <SelectField name="status" label="Status" defaultValue={issue.status}>
          {issueStatusValues.map((status) => (
            <option key={status} value={status}>
              {formatIssueStatus(status)}
            </option>
          ))}
        </SelectField>
        <SelectField name="priority" label="Priority" defaultValue={issue.priority}>
          {issuePriorityValues.map((priority) => (
            <option key={priority} value={priority}>
              {formatIssuePriority(priority)}
            </option>
          ))}
        </SelectField>
        <SelectField
          name="assigneeId"
          label="Assignee"
          defaultValue={issue.assignee?.id ?? ""}
        >
          <option value="">Unassigned</option>
          {workspaceMembers.map((membership) => (
            <option key={membership.user.id} value={membership.user.id}>
              {membership.user.name ?? membership.user.email}
            </option>
          ))}
        </SelectField>
      </div>
      <div className="grid gap-2">
        <label htmlFor={`issue-description-${issue.id}`} className="text-xs font-medium text-muted-foreground">
          Description
        </label>
        <textarea
          id={`issue-description-${issue.id}`}
          name="description"
          maxLength={2000}
          rows={3}
          defaultValue={issue.description ?? ""}
          className="sudo-textarea"
        />
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <div className="flex items-center gap-2">
        <IssueSubmitButton label="Save issue" pendingLabel="Saving..." icon={<Check className="size-4" />} />
        <Button type="button" variant="ghost" onClick={onCancel}>
          <X className="size-4" aria-hidden="true" />
          Cancel
        </Button>
      </div>
    </form>
  );
}

function IssueDetailDrawer({
  issue,
  workspaceId,
  workspaceLabels,
  workspaceSlug,
  filters,
}: {
  issue: IssueDetailItem;
  workspaceId: string;
  workspaceLabels: IssueLabelItem[];
  workspaceSlug: string;
  filters: IssueFilters;
}) {
  const closeHref = buildIssueListPath({
    workspaceSlug,
    projectKey: issue.project.key,
    filters,
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/55 backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in-0">
      <Link href={closeHref} className="absolute inset-0" aria-label="Close issue detail" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="issue-detail-title"
        className="relative flex h-full w-full max-w-[42rem] flex-col overflow-hidden border-l border-[#323334] bg-[#0f1011] shadow-[-30px_0_90px_rgb(0_0_0_/_48%)] motion-safe:animate-in motion-safe:slide-in-from-right-8"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border bg-[#121315] px-5 py-5 sm:px-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-[4px] border border-[#323334] bg-[#161718] px-2 py-1 font-mono text-[0.68rem] text-[#8a8f98]">
                {issue.issueKey}
              </span>
              <StatusTag status={issue.status} label={formatIssueStatus(issue.status)} />
              <PriorityTag priority={issue.priority} label={formatIssuePriority(issue.priority)} />
            </div>
            <h2 id="issue-detail-title" className="mt-3 text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
              {issue.title}
            </h2>
          </div>
          <Button asChild variant="ghost" size="icon-sm" aria-label="Close issue detail">
            <Link href={closeHref}>
              <X className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid gap-6">
            <section>
              <p className="sudo-kicker">Description</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground/85">
                {issue.description || "No description yet."}
              </p>
            </section>

            <dl className="grid gap-0 overflow-hidden rounded-md border border-border bg-[#0c0d0e] sm:grid-cols-2">
              <DetailMeta label="Project" value={`${issue.project.name} (${issue.project.key})`} />
              <DetailMeta label="Issue number" value={String(issue.issueNumber)} />
              <DetailMeta label="Status" value={formatIssueStatus(issue.status)} />
              <DetailMeta label="Priority" value={formatIssuePriority(issue.priority)} />
              <DetailMeta
                label="Assignee"
                value={issue.assignee?.name ?? issue.assignee?.email ?? "Unassigned"}
              />
              <DetailMeta label="Activity" value={String(issue.activity.length)} />
              <DetailMeta label="Created" value={formatDate(issue.createdAt)} />
              <DetailMeta label="Updated" value={formatDate(issue.updatedAt)} />
            </dl>

            <IssueLabelsSection
              issue={issue}
              workspaceId={workspaceId}
              workspaceLabels={workspaceLabels}
              workspaceSlug={workspaceSlug}
              filters={filters}
            />

            <IssueActivitySection activity={issue.activity} />

            <IssueCommentsSection issue={issue} workspaceSlug={workspaceSlug} filters={filters} />
          </div>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-border bg-[#121315] px-5 py-4 sm:px-6">
          <p className="text-xs text-[#62666d]">
            Double-click an issue row to edit fields.
          </p>
          <ArchiveIssueForm
            issueId={issue.id}
            workspaceSlug={workspaceSlug}
            projectKey={issue.project.key}
            filters={filters}
          />
        </footer>
      </aside>
    </div>
  );
}

function IssueLabelsSection({
  issue,
  workspaceId,
  workspaceLabels,
  workspaceSlug,
  filters,
}: {
  issue: IssueDetailItem;
  workspaceId: string;
  workspaceLabels: IssueLabelItem[];
  workspaceSlug: string;
  filters: IssueFilters;
}) {
  const attachedIds = new Set(issue.labels.map((label) => label.id));
  const availableLabels = workspaceLabels.filter((label) => !attachedIds.has(label.id));

  return (
    <section className="grid gap-4 border-t border-border/50 pt-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="sudo-kicker">Labels</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {issue.labels.length === 0
              ? "No labels yet"
              : `${issue.labels.length} ${issue.labels.length === 1 ? "label" : "labels"}`}
          </p>
        </div>
        <div className="flex size-9 items-center justify-center rounded-md border border-border/55 bg-background/45 text-muted-foreground">
          <Tag className="size-4" aria-hidden="true" />
        </div>
      </div>

      {issue.labels.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/55 bg-background/32 px-4 py-4 text-sm text-muted-foreground">
          Labels keep issue lists scannable without adding workflow complexity.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {issue.labels.map((label) => (
            <RemoveLabelForm
              key={label.id}
              issueId={issue.id}
              label={label}
              projectKey={issue.project.key}
              workspaceSlug={workspaceSlug}
              filters={filters}
            />
          ))}
        </div>
      )}

      <div className="grid gap-3 rounded-md border border-border bg-[#0c0d0e] p-3">
        <AttachExistingLabelForm
          availableLabels={availableLabels}
          issueId={issue.id}
          projectKey={issue.project.key}
          workspaceSlug={workspaceSlug}
          filters={filters}
        />
        <CreateLabelForm
          issueId={issue.id}
          projectKey={issue.project.key}
          workspaceId={workspaceId}
          workspaceSlug={workspaceSlug}
          filters={filters}
        />
      </div>
    </section>
  );
}

function AttachExistingLabelForm({
  availableLabels,
  issueId,
  projectKey,
  workspaceSlug,
  filters,
}: {
  availableLabels: IssueLabelItem[];
  issueId: string;
  projectKey: string;
  workspaceSlug: string;
  filters: IssueFilters;
}) {
  const [state, formAction] = useActionState(addLabelToIssueAction, initialLabelState);

  return (
    <form action={formAction} className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
      <input type="hidden" name="issueId" value={issueId} />
      <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
      <input type="hidden" name="projectKey" value={projectKey} />
      <IssueFilterHiddenFields filters={filters} />
      <div className="grid gap-2">
        <label htmlFor={`attach-label-${issueId}`} className="text-xs font-medium text-muted-foreground">
          Attach existing label
        </label>
        <select
          id={`attach-label-${issueId}`}
          name="labelId"
          required
          disabled={availableLabels.length === 0}
          className={inputClassName}
          defaultValue=""
        >
          <option value="" disabled>
            {availableLabels.length === 0 ? "No unattached labels" : "Choose label"}
          </option>
          {availableLabels.map((label) => (
            <option key={label.id} value={label.id}>
              {label.name}
            </option>
          ))}
        </select>
      </div>
      <LabelSubmitButton label="Attach" pendingLabel="Attaching..." disabled={availableLabels.length === 0} />
      {state.error ? (
        <p role="alert" className="text-sm text-destructive sm:col-span-2">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

function CreateLabelForm({
  issueId,
  projectKey,
  workspaceId,
  workspaceSlug,
  filters,
}: {
  issueId: string;
  projectKey: string;
  workspaceId: string;
  workspaceSlug: string;
  filters: IssueFilters;
}) {
  const [state, formAction] = useActionState(createLabelAction, initialLabelState);

  return (
    <form action={formAction} className="grid gap-2 border-t border-border/50 pt-3">
      <input type="hidden" name="issueId" value={issueId} />
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
      <input type="hidden" name="projectKey" value={projectKey} />
      <IssueFilterHiddenFields filters={filters} />
      <div className="grid gap-2 sm:grid-cols-[1fr_8rem_auto] sm:items-end">
        <div className="grid gap-2">
          <label htmlFor={`new-label-${issueId}`} className="text-xs font-medium text-muted-foreground">
            New label
          </label>
          <input
            id={`new-label-${issueId}`}
            name="name"
            type="text"
            required
            maxLength={32}
            placeholder="Frontend"
            className={inputClassName}
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor={`new-label-color-${issueId}`} className="text-xs font-medium text-muted-foreground">
            Color
          </label>
          <select
            id={`new-label-color-${issueId}`}
            name="color"
            defaultValue="gray"
            className={inputClassName}
          >
            {labelColorValues.map((color) => (
              <option key={color} value={color}>
                {formatLabelColor(color)}
              </option>
            ))}
          </select>
        </div>
        <LabelSubmitButton label="Create" pendingLabel="Creating..." />
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

function RemoveLabelForm({
  issueId,
  label,
  projectKey,
  workspaceSlug,
  filters,
}: {
  issueId: string;
  label: IssueLabelItem;
  projectKey: string;
  workspaceSlug: string;
  filters: IssueFilters;
}) {
  const [state, formAction] = useActionState(removeLabelFromIssueAction, initialLabelState);

  return (
    <form action={formAction} className="contents">
      <input type="hidden" name="issueId" value={issueId} />
      <input type="hidden" name="labelId" value={label.id} />
      <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
      <input type="hidden" name="projectKey" value={projectKey} />
      <IssueFilterHiddenFields filters={filters} />
      <RemoveLabelButton label={label} />
      {state.error ? (
        <span role="alert" className="text-xs text-destructive">
          {state.error}
        </span>
      ) : null}
    </form>
  );
}

function RemoveLabelButton({ label }: { label: IssueLabelItem }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-xs transition hover:brightness-110 disabled:opacity-60",
        getLabelColorClass(label.color),
      )}
      aria-label={`Remove ${label.name} label`}
      title={`Remove ${label.name}`}
    >
      {label.name}
      <X className="size-3" aria-hidden="true" />
    </button>
  );
}

function LabelSubmitButton({
  label,
  pendingLabel,
  disabled = false,
}: {
  label: string;
  pendingLabel: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="sm" disabled={pending || disabled}>
      {pending ? pendingLabel : label}
    </Button>
  );
}

function IssueActivitySection({
  activity,
}: {
  activity: IssueActivityItem[];
}) {
  return (
    <section
      data-testid="issue-activity"
      className="grid gap-4 border-t border-border/50 pt-5"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="sudo-kicker">Activity</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {activity.length === 0
              ? "No recorded changes yet"
              : `${activity.length} recorded ${activity.length === 1 ? "event" : "events"}`}
          </p>
        </div>
        <div className="flex size-9 items-center justify-center rounded-md border border-border/55 bg-background/45 text-muted-foreground">
          <Clock3 className="size-4" aria-hidden="true" />
        </div>
      </div>

      {activity.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/55 bg-background/32 px-4 py-4 text-sm text-muted-foreground">
          New issue changes and collaboration events will appear here.
        </div>
      ) : (
        <ol className="relative grid gap-3 before:absolute before:bottom-3 before:left-[0.95rem] before:top-3 before:w-px before:bg-border">
          {activity.map((event) => (
            <li
              key={event.id}
              className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-3"
            >
              <AuthorAvatar
                name={event.actor?.name ?? event.actor?.email ?? null}
                imageUrl={event.actor?.imageUrl ?? null}
              />
              <div className="min-w-0 rounded-md border border-border bg-[#0c0d0e] px-3 py-2.5">
                <p className="text-sm leading-5 text-[#d0d6e0]">
                  <span className="font-medium">
                    {event.actor?.name ?? event.actor?.email ?? "System"}
                  </span>{" "}
                  <span className="text-[#8a8f98]">
                    {formatActivityEvent(event)}
                  </span>
                </p>
                <time
                  dateTime={event.createdAt}
                  className="mt-1 block font-mono text-[0.62rem] text-[#62666d]"
                >
                  {formatDateTime(event.createdAt)}
                </time>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function IssueCommentsSection({
  issue,
  workspaceSlug,
  filters,
}: {
  issue: IssueDetailItem;
  workspaceSlug: string;
  filters: IssueFilters;
}) {
  return (
    <section
      data-testid="issue-comments"
      className="grid gap-4 border-t border-border/50 pt-5"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="sudo-kicker">Comments</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {issue.comments.length === 0
              ? "No comments yet"
              : `${issue.comments.length} ${issue.comments.length === 1 ? "comment" : "comments"}`}
          </p>
        </div>
        <div className="flex size-9 items-center justify-center rounded-md border border-border/55 bg-background/45 text-muted-foreground">
          <MessageSquare className="size-4" aria-hidden="true" />
        </div>
      </div>

      {issue.comments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/55 bg-background/32 px-4 py-5 text-sm text-muted-foreground">
          No comments yet. Add the first note to keep discussion attached to this issue.
        </div>
      ) : (
        <ol className="grid gap-3">
          {issue.comments.map((comment) => (
            <li
              key={comment.id}
              className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 rounded-md border border-border bg-[#0c0d0e] p-3"
            >
              <AuthorAvatar
                name={comment.author.name}
                imageUrl={comment.author.imageUrl}
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="text-sm font-medium">
                    {comment.author.name || "SuDo user"}
                  </p>
                  <time
                    dateTime={comment.createdAt}
                    className="text-xs text-muted-foreground"
                  >
                    {formatDateTime(comment.createdAt)}
                  </time>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/85">
                  {comment.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}

      <CommentComposer
        issueId={issue.id}
        workspaceSlug={workspaceSlug}
        projectKey={issue.project.key}
        filters={filters}
      />
    </section>
  );
}

function AssigneeSummary({
  assignee,
}: {
  assignee: IssueAssigneeItem | null;
}) {
  return (
    <span className="flex min-w-0 items-center gap-1.5 text-xs text-[#8a8f98]">
      <UserRound className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">
        {assignee?.name ?? assignee?.email ?? "Unassigned"}
      </span>
    </span>
  );
}

function formatActivityEvent(event: IssueActivityItem) {
  const metadata = event.metadata;

  switch (event.action) {
    case "issue.created":
      return "created the issue";
    case "issue.updated": {
      const fields = metadata?.fields;
      return Array.isArray(fields) && fields.length > 0
        ? `updated ${fields.join(" and ")}`
        : "updated the issue";
    }
    case "issue.status_changed":
      return `changed status from ${formatActivityValue(metadata?.from)} to ${formatActivityValue(metadata?.to)}`;
    case "issue.priority_changed":
      return `changed priority from ${formatActivityValue(metadata?.from)} to ${formatActivityValue(metadata?.to)}`;
    case "issue.assignee_changed":
      return metadata?.to
        ? `assigned the issue to ${metadata.to}`
        : "cleared the assignee";
    case "issue.label_added":
      return `added the ${formatActivityValue(metadata?.labelName)} label`;
    case "issue.label_removed":
      return `removed the ${formatActivityValue(metadata?.labelName)} label`;
    case "issue.comment_added":
      return "added a comment";
    default:
      return "updated the issue";
  }
}

function formatActivityValue(value: string | string[] | null | undefined) {
  if (!value) {
    return "none";
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return value.replaceAll("_", " ");
}

function CommentComposer({
  issueId,
  workspaceSlug,
  projectKey,
  filters,
}: {
  issueId: string;
  workspaceSlug: string;
  projectKey: string;
  filters: IssueFilters;
}) {
  const [state, formAction] = useActionState(createCommentAction, initialCommentState);

  return (
    <form action={formAction} className="grid gap-3">
      <input type="hidden" name="issueId" value={issueId} />
      <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
      <input type="hidden" name="projectKey" value={projectKey} />
      <IssueFilterHiddenFields filters={filters} />
      <div className="grid gap-2">
        <label htmlFor={`comment-body-${issueId}`} className="text-xs font-medium text-muted-foreground">
          Add comment
        </label>
        <textarea
          id={`comment-body-${issueId}`}
          name="body"
          required
          maxLength={2000}
          rows={3}
          placeholder="Leave a concise update..."
          className="sudo-textarea"
        />
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <div className="flex justify-end">
        <CommentSubmitButton />
      </div>
    </form>
  );
}

function CommentSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Posting..." : "Post comment"}
      <Send className="size-3.5" aria-hidden="true" />
    </Button>
  );
}

function AuthorAvatar({
  name,
  imageUrl,
}: {
  name: string | null;
  imageUrl: string | null;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt=""
        className="size-8 rounded-full border border-border/55 object-cover"
      />
    );
  }

  return (
    <div className="flex size-8 items-center justify-center rounded-full border border-border/55 bg-muted/55 text-xs font-medium text-muted-foreground">
      {getInitials(name)}
    </div>
  );
}

function getInitials(name: string | null) {
  if (!name) {
    return "SU";
  }

  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function DetailMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border p-3 last:border-b-0 sm:border-r sm:[&:nth-last-child(-n+2)]:border-b-0 sm:[&:nth-child(2n)]:border-r-0">
      <dt className="font-mono text-[0.6rem] uppercase text-[#62666d]">{label}</dt>
      <dd className="mt-1.5 text-sm font-medium text-[#d0d6e0]">{value}</dd>
    </div>
  );
}

function IssueSelectGrid({
  workspaceMembers,
}: {
  workspaceMembers: WorkspaceIssueMember[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <SelectField name="status" label="Status" defaultValue="todo">
        {issueStatusValues.map((status) => (
          <option key={status} value={status}>
            {formatIssueStatus(status)}
          </option>
        ))}
      </SelectField>
      <SelectField name="priority" label="Priority" defaultValue="medium">
        {issuePriorityValues.map((priority) => (
          <option key={priority} value={priority}>
            {formatIssuePriority(priority)}
          </option>
        ))}
      </SelectField>
      <SelectField name="assigneeId" label="Assignee" defaultValue="">
        <option value="">Unassigned</option>
        {workspaceMembers.map((membership) => (
          <option key={membership.user.id} value={membership.user.id}>
            {membership.user.name ?? membership.user.email}
          </option>
        ))}
      </SelectField>
    </div>
  );
}

function SelectField({
  name,
  label,
  defaultValue,
  children,
}: {
  name: string;
  label: string;
  defaultValue: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={`${name}-${defaultValue}`} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <select
        id={`${name}-${defaultValue}`}
        name={name}
        defaultValue={defaultValue}
        className={inputClassName}
      >
        {children}
      </select>
    </div>
  );
}

function ArchiveIssueForm({
  issueId,
  workspaceSlug,
  projectKey,
  filters,
}: {
  issueId: string;
  workspaceSlug: string;
  projectKey: string;
  filters: IssueFilters;
}) {
  const [state, formAction] = useActionState(archiveIssueAction, initialState);

  return (
    <form action={formAction} className="contents">
      <input type="hidden" name="issueId" value={issueId} />
      <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
      <input type="hidden" name="projectKey" value={projectKey} />
      <IssueFilterHiddenFields filters={filters} />
      <ArchiveButton />
      {state.error ? (
        <span role="alert" className="text-xs text-destructive">
          {state.error}
        </span>
      ) : null}
    </form>
  );
}

function IssueFilterHiddenFields({ filters }: { filters: IssueFilters }) {
  return (
    <>
      {filters.status ? <input type="hidden" name="filterStatus" value={filters.status} /> : null}
      {filters.priority ? (
        <input type="hidden" name="filterPriority" value={filters.priority} />
      ) : null}
      {filters.labelId ? <input type="hidden" name="filterLabel" value={filters.labelId} /> : null}
      {filters.query ? <input type="hidden" name="filterQ" value={filters.query} /> : null}
    </>
  );
}

function IssueSubmitButton({
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

function LabelPill({ label }: { label: IssueLabelItem }) {
  return <LabelChip name={label.name} color={getLabelHex(label.color)} />;
}

function getStatusFilterColor(status: IssueStatusValue) {
  switch (status) {
    case "backlog":
      return "#62666d";
    case "todo":
      return "#5e6ad2";
    case "in_progress":
      return "#02b8cc";
    case "done":
      return "#27a644";
  }
}

function getPriorityFilterColor(priority: IssuePriorityValue) {
  switch (priority) {
    case "low":
      return "#62666d";
    case "medium":
      return "#02b8cc";
    case "high":
      return "#e4f222";
    case "urgent":
      return "#eb5757";
  }
}

function getLabelColorClass(color: string) {
  switch (color) {
    case "red":
      return "border-red-400/25 bg-red-400/10 text-red-100";
    case "orange":
      return "border-orange-400/25 bg-orange-400/10 text-orange-100";
    case "yellow":
      return "border-yellow-300/25 bg-yellow-300/10 text-yellow-100";
    case "green":
      return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
    case "blue":
      return "border-sky-300/25 bg-sky-300/10 text-sky-100";
    case "purple":
      return "border-violet-300/25 bg-violet-300/10 text-violet-100";
    case "pink":
      return "border-pink-300/25 bg-pink-300/10 text-pink-100";
    case "gray":
    default:
      return "border-white/10 bg-white/[0.055] text-muted-foreground";
  }
}

function formatLabelColor(color: string) {
  return color.charAt(0).toUpperCase() + color.slice(1);
}

function getLabelHex(color: string) {
  switch (color) {
    case "red":
      return "#eb5757";
    case "orange":
      return "#f2994a";
    case "yellow":
      return "#e4f222";
    case "green":
      return "#27a644";
    case "blue":
      return "#02b8cc";
    case "purple":
      return "#8f99ff";
    case "pink":
      return "#ec6fb5";
    default:
      return "#62666d";
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

const inputClassName = "sudo-input";
const plainCountClassName =
  "h-auto min-w-0 rounded-none border-0 bg-transparent px-0 text-[0.72rem] text-muted-foreground/72";
