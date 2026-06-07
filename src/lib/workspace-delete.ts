import type { WorkspaceRole } from "@/generated/prisma/client";

export const WORKSPACE_DANGER_ZONE_TITLE = "Danger Zone";
export const WORKSPACE_DELETE_BUTTON_LABEL = "Delete workspace";
export const WORKSPACE_DELETE_FINAL_BUTTON_LABEL = "Permanently delete workspace";

export const WORKSPACE_DELETE_WARNING_ITEMS = [
  "projects",
  "issues",
  "comments",
  "labels",
  "filters",
  "views",
  "settings",
] as const;

export class WorkspaceDeleteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkspaceDeleteError";
  }
}

export type WorkspaceDeleteResult = {
  deletedWorkspaceSlug: string;
  redirectTo: string;
};

type WorkspaceDeletionMembership = {
  role: WorkspaceRole;
  workspace: {
    id: string;
    name: string;
    slug: string;
    archivedAt: Date | null;
  };
};

export type WorkspaceDeletionPrisma = {
  workspaceMember: {
    findUnique(args: unknown): Promise<WorkspaceDeletionMembership | null>;
    findFirst(args: unknown): Promise<{ workspace: { slug: string } } | null>;
  };
  $transaction(fn: (tx: WorkspaceDeletionTransaction) => Promise<unknown>): Promise<unknown>;
};

type DeleteManyModel = {
  deleteMany(args: unknown): Promise<unknown>;
};

type WorkspaceDeletionTransaction = {
  workspaceInvitation: DeleteManyModel;
  issueLabel: DeleteManyModel;
  activityLog: DeleteManyModel;
  comment: DeleteManyModel;
  demoReset: DeleteManyModel;
  issue: DeleteManyModel;
  issueStatus: DeleteManyModel;
  label: DeleteManyModel;
  project: DeleteManyModel;
  workspaceMember: DeleteManyModel;
  workspace: {
    delete(args: unknown): Promise<unknown>;
  };
};

export function canDeleteWorkspace(role: WorkspaceRole | null | undefined) {
  return role === "owner";
}

export function isWorkspaceDeleteConfirmationValid({
  workspaceName,
  confirmationName,
}: {
  workspaceName: string;
  confirmationName: string;
}) {
  return confirmationName === workspaceName;
}

export function getWorkspaceDeleteRedirectPath(nextWorkspaceSlug?: string | null) {
  return nextWorkspaceSlug
    ? `/app/issues?workspace=${encodeURIComponent(nextWorkspaceSlug)}`
    : "/app";
}

export async function deleteWorkspaceWithClient({
  prisma,
  userId,
  workspaceId,
  confirmationName,
}: {
  prisma: WorkspaceDeletionPrisma;
  userId: string;
  workspaceId: string;
  confirmationName: string;
}): Promise<WorkspaceDeleteResult> {
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
    include: {
      workspace: true,
    },
  });

  if (!membership || membership.workspace.archivedAt) {
    throw new WorkspaceDeleteError("Workspace access denied.");
  }

  if (!canDeleteWorkspace(membership.role)) {
    throw new WorkspaceDeleteError("Only workspace owners can delete a workspace.");
  }

  if (
    !isWorkspaceDeleteConfirmationValid({
      workspaceName: membership.workspace.name,
      confirmationName,
    })
  ) {
    throw new WorkspaceDeleteError("Type the workspace name exactly to confirm deletion.");
  }

  const nextMembership = await prisma.workspaceMember.findFirst({
    where: {
      userId,
      workspaceId: {
        not: workspaceId,
      },
      workspace: {
        archivedAt: null,
      },
    },
    select: {
      workspace: {
        select: {
          slug: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  await prisma.$transaction(async (tx) => {
    await tx.workspaceInvitation.deleteMany({ where: { workspaceId } });
    await tx.issueLabel.deleteMany({
      where: {
        issue: {
          workspaceId,
        },
      },
    });
    await tx.activityLog.deleteMany({ where: { workspaceId } });
    await tx.comment.deleteMany({ where: { workspaceId } });
    await tx.demoReset.deleteMany({ where: { workspaceId } });
    await tx.issue.deleteMany({ where: { workspaceId } });
    await tx.issueStatus.deleteMany({ where: { workspaceId } });
    await tx.label.deleteMany({ where: { workspaceId } });
    await tx.project.deleteMany({ where: { workspaceId } });
    await tx.workspaceMember.deleteMany({ where: { workspaceId } });
    await tx.workspace.delete({ where: { id: workspaceId } });
  });

  return {
    deletedWorkspaceSlug: membership.workspace.slug,
    redirectTo: getWorkspaceDeleteRedirectPath(nextMembership?.workspace.slug),
  };
}
