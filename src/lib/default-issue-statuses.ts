import type { IssueStatusType } from "@/generated/prisma/client";

export const DEFAULT_ISSUE_STATUSES = [
  {
    type: "backlog",
    name: "Backlog",
    color: "#737373",
    sortOrder: 0,
    isDefault: true,
  },
  {
    type: "todo",
    name: "Todo",
    color: "#a3a3a3",
    sortOrder: 1,
    isDefault: false,
  },
  {
    type: "in_progress",
    name: "In Progress",
    color: "#5eead4",
    sortOrder: 2,
    isDefault: false,
  },
  {
    type: "done",
    name: "Done",
    color: "#86efac",
    sortOrder: 3,
    isDefault: false,
  },
] as const satisfies ReadonlyArray<{
  type: IssueStatusType;
  name: string;
  color: string;
  sortOrder: number;
  isDefault: boolean;
}>;

export function getDefaultIssueStatusData(workspaceId: string) {
  return DEFAULT_ISSUE_STATUSES.map((status) => ({
    workspaceId,
    ...status,
  }));
}
