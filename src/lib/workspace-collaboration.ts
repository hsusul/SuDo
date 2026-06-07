import "server-only";

import { createHash, randomBytes } from "node:crypto";
import type {
  WorkspaceInvitationStatus,
  WorkspaceRole,
} from "@/generated/prisma/client";
import { activityActions } from "@/lib/activity-events";
import { requireCurrentUser } from "@/lib/auth";
import {
  workspaceInvitationInputSchema,
  type WorkspaceInvitationInput,
} from "@/lib/invitation-validation";
import { assertMutationAllowed } from "@/lib/mutation-rate-limit";
import { getPrisma } from "@/lib/prisma";
import {
  requireWorkspaceAccess,
  requireWorkspaceRole,
} from "@/lib/workspace";
import {
  canChangeWorkspaceMemberRole,
  canManageWorkspaceMembers,
  canRemoveWorkspaceMember,
  WorkspacePermissionError,
} from "@/lib/workspace-permissions";

const INVITATION_LIFETIME_MS = 7 * 24 * 60 * 60_000;

export class WorkspaceCollaborationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkspaceCollaborationError";
  }
}

export async function getWorkspaceMembers(workspaceId: string) {
  await requireWorkspaceAccess(workspaceId);

  return getPrisma().workspaceMember.findMany({
    where: { workspaceId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true,
        },
      },
    },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });
}

export async function getWorkspaceInvitations(workspaceId: string) {
  const access = await requireWorkspaceAccess(workspaceId);

  if (!canManageWorkspaceMembers(access.membership.role)) {
    return [];
  }

  const invitations = await getPrisma().workspaceInvitation.findMany({
    where: { workspaceId },
    include: {
      invitedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });

  return invitations.map((invitation) => ({
    ...invitation,
    effectiveStatus: getEffectiveInvitationStatus(invitation),
  }));
}

export async function createWorkspaceInvitation({
  workspaceId,
  input,
}: {
  workspaceId: string;
  input: WorkspaceInvitationInput;
}) {
  const access = await requireWorkspaceRole(workspaceId, ["owner", "admin"]);
  const data = workspaceInvitationInputSchema.parse(input);
  assertMutationAllowed({
    key: `workspace:invite:${access.user.id}`,
    limit: 20,
    windowMs: 60 * 60_000,
  });

  const existingMember = await getPrisma().workspaceMember.findFirst({
    where: {
      workspaceId,
      user: {
        email: {
          equals: data.email,
          mode: "insensitive",
        },
      },
    },
    select: { id: true },
  });

  if (existingMember) {
    throw new WorkspaceCollaborationError(
      "This email already belongs to a workspace member.",
    );
  }

  const existingInvitation = await getPrisma().workspaceInvitation.findFirst({
    where: {
      workspaceId,
      email: {
        equals: data.email,
        mode: "insensitive",
      },
      status: "pending",
    },
  });

  if (existingInvitation && existingInvitation.expiresAt > new Date()) {
    throw new WorkspaceCollaborationError(
      "A pending invitation already exists for this email.",
    );
  }

  if (existingInvitation) {
    await getPrisma().workspaceInvitation.update({
      where: { id: existingInvitation.id },
      data: { status: "expired" },
    });
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashInvitationToken(token);
  const expiresAt = new Date(Date.now() + INVITATION_LIFETIME_MS);

  try {
    const invitation = await getPrisma().$transaction(async (tx) => {
      const created = await tx.workspaceInvitation.create({
        data: {
          workspaceId,
          email: data.email,
          role: data.role,
          tokenHash,
          invitedById: access.user.id,
          expiresAt,
        },
      });

      await tx.activityLog.create({
        data: {
          workspaceId,
          actorId: access.user.id,
          action: activityActions.memberInvited,
          metadata: {
            email: data.email,
            role: data.role,
          },
        },
      });

      return created;
    });

    return {
      invitation,
      token,
      invitePath: `/app/invitations/${token}`,
    };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new WorkspaceCollaborationError(
        "A pending invitation already exists for this email.",
      );
    }

    throw error;
  }
}

export async function getInvitationPreview(token: string) {
  const user = await requireCurrentUser();
  const invitation = await getPrisma().workspaceInvitation.findUnique({
    where: { tokenHash: hashInvitationToken(token) },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
          archivedAt: true,
        },
      },
      invitedBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  validateInvitationForUser(invitation, user.email);

  return invitation;
}

export async function acceptWorkspaceInvitation(token: string) {
  const user = await requireCurrentUser();
  const tokenHash = hashInvitationToken(token);

  return getPrisma().$transaction(
    async (tx) => {
      const invitation = await tx.workspaceInvitation.findUnique({
        where: { tokenHash },
        include: {
          workspace: true,
        },
      });

      validateInvitationForUser(invitation, user.email);

      const existingMembership = await tx.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: invitation.workspaceId,
            userId: user.id,
          },
        },
      });

      if (!existingMembership) {
        await tx.workspaceMember.create({
          data: {
            workspaceId: invitation.workspaceId,
            userId: user.id,
            role: invitation.role,
          },
        });
      }

      const accepted = await tx.workspaceInvitation.updateMany({
        where: {
          id: invitation.id,
          status: "pending",
        },
        data: {
          status: "accepted",
          acceptedById: user.id,
          acceptedAt: new Date(),
        },
      });

      if (accepted.count !== 1) {
        throw new WorkspaceCollaborationError(
          "This invitation is no longer available.",
        );
      }

      await tx.activityLog.create({
        data: {
          workspaceId: invitation.workspaceId,
          actorId: user.id,
          action: activityActions.memberAccepted,
          metadata: {
            email: user.email,
            role: existingMembership?.role ?? invitation.role,
          },
        },
      });

      return {
        workspaceId: invitation.workspaceId,
        workspaceSlug: invitation.workspace.slug,
      };
    },
    { isolationLevel: "Serializable" },
  );
}

export async function revokeWorkspaceInvitation({
  workspaceId,
  invitationId,
}: {
  workspaceId: string;
  invitationId: string;
}) {
  const access = await requireWorkspaceRole(workspaceId, ["owner", "admin"]);
  const invitation = await getPrisma().workspaceInvitation.findFirst({
    where: {
      id: invitationId,
      workspaceId,
    },
  });

  if (!invitation || getEffectiveInvitationStatus(invitation) !== "pending") {
    throw new WorkspaceCollaborationError(
      "This invitation is no longer pending.",
    );
  }

  await getPrisma().$transaction(async (tx) => {
    await tx.workspaceInvitation.update({
      where: { id: invitation.id },
      data: {
        status: "revoked",
        revokedAt: new Date(),
      },
    });

    await tx.activityLog.create({
      data: {
        workspaceId,
        actorId: access.user.id,
        action: activityActions.invitationRevoked,
        metadata: {
          email: invitation.email,
        },
      },
    });
  });
}

export async function updateWorkspaceMemberRole({
  workspaceId,
  membershipId,
  role,
}: {
  workspaceId: string;
  membershipId: string;
  role: WorkspaceRole;
}) {
  const access = await requireWorkspaceRole(workspaceId, ["owner"]);
  const membership = await getPrisma().workspaceMember.findFirst({
    where: {
      id: membershipId,
      workspaceId,
    },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  if (!membership) {
    throw new WorkspaceCollaborationError("Workspace member not found.");
  }

  if (
    !canChangeWorkspaceMemberRole({
      actorRole: access.membership.role,
      targetRole: membership.role,
      nextRole: role,
    })
  ) {
    throw new WorkspacePermissionError(
      "Only owners can change admin and member roles.",
    );
  }

  if (membership.role === role) {
    return membership;
  }

  return getPrisma().$transaction(async (tx) => {
    const updated = await tx.workspaceMember.update({
      where: { id: membership.id },
      data: { role },
    });

    await tx.activityLog.create({
      data: {
        workspaceId,
        actorId: access.user.id,
        action: activityActions.memberRoleChanged,
        metadata: {
          email: membership.user.email,
          from: membership.role,
          to: role,
        },
      },
    });

    return updated;
  });
}

export async function removeWorkspaceMember({
  workspaceId,
  membershipId,
}: {
  workspaceId: string;
  membershipId: string;
}) {
  const access = await requireWorkspaceRole(workspaceId, ["owner", "admin"]);
  const [membership, ownerCount] = await Promise.all([
    getPrisma().workspaceMember.findFirst({
      where: {
        id: membershipId,
        workspaceId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    getPrisma().workspaceMember.count({
      where: {
        workspaceId,
        role: "owner",
      },
    }),
  ]);

  if (!membership) {
    throw new WorkspaceCollaborationError("Workspace member not found.");
  }

  if (
    !canRemoveWorkspaceMember({
      actorRole: access.membership.role,
      actorUserId: access.user.id,
      targetRole: membership.role,
      targetUserId: membership.userId,
      ownerCount,
    })
  ) {
    throw new WorkspacePermissionError(
      membership.role === "owner"
        ? "The only workspace owner cannot be removed."
        : "You do not have permission to remove this member.",
    );
  }

  await getPrisma().$transaction(async (tx) => {
    const assignedIssues = await tx.issue.findMany({
      where: {
        workspaceId,
        assigneeId: membership.userId,
      },
      select: {
        id: true,
        projectId: true,
      },
    });

    await tx.issue.updateMany({
      where: {
        workspaceId,
        assigneeId: membership.userId,
      },
      data: {
        assigneeId: null,
      },
    });

    if (assignedIssues.length > 0) {
      await tx.activityLog.createMany({
        data: assignedIssues.map((issue) => ({
          workspaceId,
          projectId: issue.projectId,
          issueId: issue.id,
          actorId: access.user.id,
          action: activityActions.issueAssigneeChanged,
          metadata: {
            from: membership.user.name ?? membership.user.email,
            to: null,
          },
        })),
      });
    }

    await tx.workspaceMember.delete({
      where: { id: membership.id },
    });

    await tx.activityLog.create({
      data: {
        workspaceId,
        actorId: access.user.id,
        action: activityActions.memberRemoved,
        metadata: {
          email: membership.user.email,
          name: membership.user.name,
          role: membership.role,
        },
      },
    });
  });
}

export function getEffectiveInvitationStatus(invitation: {
  status: WorkspaceInvitationStatus;
  expiresAt: Date;
}) {
  if (invitation.status === "pending" && invitation.expiresAt <= new Date()) {
    return "expired" as const;
  }

  return invitation.status;
}

export function hashInvitationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function validateInvitationForUser(
  invitation:
    | {
        status: WorkspaceInvitationStatus;
        expiresAt: Date;
        email: string;
        workspace: {
          archivedAt: Date | null;
        };
      }
    | null,
  userEmail: string,
): asserts invitation is NonNullable<typeof invitation> {
  if (!invitation || invitation.workspace.archivedAt) {
    throw new WorkspaceCollaborationError("Invitation not found.");
  }

  if (invitation.status !== "pending") {
    throw new WorkspaceCollaborationError(
      "This invitation is no longer available.",
    );
  }

  if (invitation.expiresAt <= new Date()) {
    throw new WorkspaceCollaborationError("This invitation has expired.");
  }

  if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
    throw new WorkspacePermissionError(
      "Sign in with the email address that received this invitation.",
    );
  }
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}
