import {
  formatIssueStatus,
  issueStatusValues,
  type IssuePriorityValue,
  type IssueStatusValue,
} from "./issue-validation";

export type BuiltInViewDefinition = {
  id: string;
  title: string;
  description: string;
  group: "status" | "priority" | "label" | "system";
  status?: IssueStatusValue;
  priority?: IssuePriorityValue;
  labelId?: string;
};

export const statusViewDefinitions: BuiltInViewDefinition[] = issueStatusValues.map((status) => ({
  id: `status-${status}`,
  title: formatIssueStatus(status),
  description: `Active ${formatIssueStatus(status).toLowerCase()} issues in this project.`,
  group: "status",
  status,
}));

export const priorityViewDefinitions: BuiltInViewDefinition[] = [
  {
    id: "priority-high",
    title: "High priority",
    description: "Work that should stay near the top of the list.",
    group: "priority",
    priority: "high",
  },
  {
    id: "priority-urgent",
    title: "Urgent",
    description: "The highest-pressure issues in this project.",
    group: "priority",
    priority: "urgent",
  },
];

export const systemViewDefinitions: BuiltInViewDefinition[] = [
  {
    id: "all-active",
    title: "All active issues",
    description: "Every non-archived issue in the selected project.",
    group: "system",
  },
  {
    id: "recently-updated",
    title: "Recently updated",
    description: "The issue list already sorts active work by latest update.",
    group: "system",
  },
];

export function createLabelViewDefinition({
  id,
  name,
}: {
  id: string;
  name: string;
}): BuiltInViewDefinition {
  return {
    id: `label-${id}`,
    title: name,
    description: `Issues tagged ${name}.`,
    group: "label",
    labelId: id,
  };
}

export function buildIssueViewHref({
  workspaceSlug,
  projectKey,
  status,
  priority,
  labelId,
}: {
  workspaceSlug: string;
  projectKey?: string | null;
  status?: IssueStatusValue;
  priority?: IssuePriorityValue;
  labelId?: string;
}) {
  const params = new URLSearchParams({ workspace: workspaceSlug });

  if (projectKey) {
    params.set("project", projectKey);
  }

  if (status) {
    params.set("status", status);
  }

  if (priority) {
    params.set("priority", priority);
  }

  if (labelId) {
    params.set("label", labelId);
  }

  return `/app/issues?${params.toString()}`;
}
