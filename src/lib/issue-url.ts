import type { IssueFilters } from "@/lib/issue-filter-validation";

export function buildIssueListPath({
  workspaceSlug,
  projectKey,
  issueId,
  filters,
}: {
  workspaceSlug: string;
  projectKey: string;
  issueId?: string;
  filters?: IssueFilters;
}) {
  const params = new URLSearchParams({
    workspace: workspaceSlug,
    project: projectKey,
  });

  if (filters?.status) {
    params.set("status", filters.status);
  }

  if (filters?.priority) {
    params.set("priority", filters.priority);
  }

  if (filters?.labelId) {
    params.set("label", filters.labelId);
  }

  if (filters?.query) {
    params.set("q", filters.query);
  }

  if (issueId) {
    params.set("issue", issueId);
  }

  return `/app/issues?${params.toString()}`;
}
