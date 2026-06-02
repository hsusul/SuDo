import "server-only";

import type { IssuePriority, IssueStatusType } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import { requireWorkspaceAccess } from "@/lib/workspace";
import {
  createLabelViewDefinition,
  priorityViewDefinitions,
  statusViewDefinitions,
  systemViewDefinitions,
  type BuiltInViewDefinition,
} from "@/lib/view-definitions";

export type ProjectViewSummary = Awaited<ReturnType<typeof getProjectViewSummary>>;

export async function getProjectViewSummary(projectId: string) {
  const project = await getPrisma().project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      key: true,
      name: true,
      workspaceId: true,
      archivedAt: true,
    },
  });

  if (!project || project.archivedAt) {
    throw new Error("Project not found.");
  }

  await requireWorkspaceAccess(project.workspaceId);

  const [issues, labels] = await Promise.all([
    getPrisma().issue.findMany({
      where: {
        projectId,
        archivedAt: null,
      },
      select: {
        id: true,
        priority: true,
        status: {
          select: {
            type: true,
          },
        },
        labels: {
          select: {
            labelId: true,
          },
        },
      },
    }),
    getPrisma().label.findMany({
      where: {
        workspaceId: project.workspaceId,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        color: true,
      },
    }),
  ]);

  return {
    project,
    totalActiveIssues: issues.length,
    systemViews: systemViewDefinitions.map((view) => ({
      ...view,
      count: issues.length,
    })),
    statusViews: statusViewDefinitions.map((view) => ({
      ...view,
      count: countIssues(issues, { status: view.status }),
    })),
    priorityViews: priorityViewDefinitions.map((view) => ({
      ...view,
      count: countIssues(issues, { priority: view.priority }),
    })),
    labelViews: labels.map((label) => ({
      ...createLabelViewDefinition({ id: label.id, name: label.name }),
      color: label.color,
      count: issues.filter((issue) =>
        issue.labels.some((issueLabel) => issueLabel.labelId === label.id),
      ).length,
    })),
  };
}

function countIssues(
  issues: Array<{
    priority: IssuePriority;
    status: { type: IssueStatusType };
  }>,
  filter: Pick<BuiltInViewDefinition, "status" | "priority">,
) {
  return issues.filter((issue) => {
    if (filter.status && issue.status.type !== filter.status) {
      return false;
    }

    if (filter.priority && issue.priority !== filter.priority) {
      return false;
    }

    return true;
  }).length;
}
