import "server-only";

import { cache } from "react";
import { getDefaultIssueStatusData } from "@/lib/default-issue-statuses";
import { requireCurrentUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { logAuthorizationFailure } from "@/lib/server-logger";
import {
  resolveWorkspaceAccess,
  type WorkspaceAccess,
} from "@/lib/workspace-access";
import { WorkspacePermissionError } from "@/lib/workspace-permissions";
import { slugifyWorkspaceName } from "@/lib/workspace-validation";
import type { WorkspaceRole } from "@/generated/prisma/client";

export type { UserWorkspace, WorkspaceAccess } from "@/lib/workspace-access";

export async function getUserWorkspaces(userId?: string) {
  const resolvedUserId = userId ?? (await requireCurrentUser()).id;

  return getPrisma().workspaceMember.findMany({
    where: {
      userId: resolvedUserId,
      workspace: {
        archivedAt: null,
      },
    },
    include: {
      workspace: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

const requireWorkspaceAccessForRequest = cache(
  async (workspaceId: string): Promise<WorkspaceAccess> => {
    const user = await requireCurrentUser();

    return resolveWorkspaceAccess({
      findMembership: (resolvedWorkspaceId, userId) =>
        getPrisma().workspaceMember.findUnique({
          where: {
            workspaceId_userId: {
              workspaceId: resolvedWorkspaceId,
              userId,
            },
          },
          include: {
            workspace: true,
          },
        }),
      user,
      workspaceId,
    });
  },
);

export async function requireWorkspaceAccess(workspaceId: string): Promise<WorkspaceAccess> {
  return requireWorkspaceAccessForRequest(workspaceId);
}

export async function requireWorkspaceRole(
  workspaceId: string,
  allowedRoles: readonly WorkspaceRole[],
) {
  const access = await requireWorkspaceAccess(workspaceId);

  if (!allowedRoles.includes(access.membership.role)) {
    logAuthorizationFailure("authorization.workspace_role.denied", {
      workspaceId,
      userId: access.user.id,
      role: access.membership.role,
      allowedRoles,
    });
    throw new WorkspacePermissionError();
  }

  return access;
}

export async function createWorkspaceForUser({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) {
  const existingMembership = await getPrisma().workspaceMember.findFirst({
    where: {
      userId,
      workspace: {
        name,
        archivedAt: null,
      },
    },
    include: {
      workspace: true,
    },
  });

  if (existingMembership) {
    return existingMembership.workspace;
  }

  const slug = await getAvailableWorkspaceSlug(name);

  return getPrisma().$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: {
        name,
        slug,
        createdById: userId,
      },
    });

    await tx.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId,
        role: "owner",
      },
    });

    await tx.issueStatus.createMany({
      data: getDefaultIssueStatusData(workspace.id),
    });

    return workspace;
  });
}

async function getAvailableWorkspaceSlug(name: string) {
  const baseSlug = slugifyWorkspaceName(name);

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    const existing = await getPrisma().workspace.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing) {
      return slug;
    }
  }

  return `${baseSlug}-${Date.now().toString(36)}`;
}
