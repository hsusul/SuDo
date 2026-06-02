import "server-only";

import { getPrisma } from "@/lib/prisma";
import { requireWorkspaceAccess } from "@/lib/workspace";

export type WorkspaceNavigationCounts = {
  activeProjectCount: number;
  activeIssueCount: number;
};

export async function getWorkspaceNavigationCounts(
  workspaceId: string,
): Promise<WorkspaceNavigationCounts> {
  await requireWorkspaceAccess(workspaceId);

  const [activeProjectCount, activeIssueCount] = await Promise.all([
    getPrisma().project.count({
      where: {
        workspaceId,
        archivedAt: null,
      },
    }),
    getPrisma().issue.count({
      where: {
        workspaceId,
        archivedAt: null,
        project: {
          archivedAt: null,
        },
      },
    }),
  ]);

  return {
    activeProjectCount,
    activeIssueCount,
  };
}

