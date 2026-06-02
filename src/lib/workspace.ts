import "server-only";

import type { Workspace, WorkspaceMember } from "@/generated/prisma/client";
import { requireCurrentUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { slugifyWorkspaceName } from "@/lib/workspace-validation";

export type UserWorkspace = WorkspaceMember & {
  workspace: Workspace;
};

export type WorkspaceAccess = {
  user: Awaited<ReturnType<typeof requireCurrentUser>>;
  membership: UserWorkspace;
  workspace: Workspace;
};

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

export async function requireWorkspaceAccess(workspaceId: string): Promise<WorkspaceAccess> {
  const user = await requireCurrentUser();

  const membership = await getPrisma().workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: user.id,
      },
    },
    include: {
      workspace: true,
    },
  });

  if (!membership || membership.workspace.archivedAt) {
    throw new Error("Workspace access denied.");
  }

  return {
    user,
    membership,
    workspace: membership.workspace,
  };
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
