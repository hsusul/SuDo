import "server-only";

import { getPrisma } from "@/lib/prisma";
import { requireWorkspaceAccess } from "@/lib/workspace";

export async function getIssueActivity(issueId: string) {
  const issue = await getPrisma().issue.findUnique({
    where: { id: issueId },
    select: {
      id: true,
      workspaceId: true,
      archivedAt: true,
      project: {
        select: {
          archivedAt: true,
        },
      },
    },
  });

  if (!issue || issue.archivedAt || issue.project.archivedAt) {
    throw new Error("Issue not found.");
  }

  await requireWorkspaceAccess(issue.workspaceId);

  return getPrisma().activityLog.findMany({
    where: { issueId },
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}
