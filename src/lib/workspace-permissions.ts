import type { WorkspaceRole } from "@/generated/prisma/client";

export class WorkspacePermissionError extends Error {
  constructor(message = "You do not have permission to manage this workspace.") {
    super(message);
    this.name = "WorkspacePermissionError";
  }
}

export function canManageWorkspaceMembers(role: WorkspaceRole) {
  return role === "owner" || role === "admin";
}

export function canInviteWorkspaceRole(
  actorRole: WorkspaceRole,
  invitationRole: WorkspaceRole,
) {
  return canManageWorkspaceMembers(actorRole) && invitationRole !== "owner";
}

export function canChangeWorkspaceMemberRole({
  actorRole,
  targetRole,
  nextRole,
}: {
  actorRole: WorkspaceRole;
  targetRole: WorkspaceRole;
  nextRole: WorkspaceRole;
}) {
  return (
    actorRole === "owner" &&
    targetRole !== "owner" &&
    nextRole !== "owner"
  );
}

export function canRemoveWorkspaceMember({
  actorRole,
  actorUserId,
  targetRole,
  targetUserId,
  ownerCount,
}: {
  actorRole: WorkspaceRole;
  actorUserId: string;
  targetRole: WorkspaceRole;
  targetUserId: string;
  ownerCount: number;
}) {
  if (!canManageWorkspaceMembers(actorRole)) {
    return false;
  }

  if (targetRole === "owner") {
    return actorRole === "owner" && actorUserId !== targetUserId && ownerCount > 1;
  }

  if (actorRole === "admin" && targetRole !== "member") {
    return false;
  }

  return actorUserId !== targetUserId;
}
