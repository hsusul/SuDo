import type { User } from "@/generated/prisma/client";

type AssigneeMembership = {
  user: User;
};

export class AssigneeError extends Error {
  constructor(message = "Assignee must be an active member of this workspace.") {
    super(message);
    this.name = "AssigneeError";
  }
}

export async function resolveWorkspaceAssignee({
  workspaceId,
  assigneeId,
  findMembership,
}: {
  workspaceId: string;
  assigneeId: string | null;
  findMembership: (
    workspaceId: string,
    userId: string,
  ) => Promise<AssigneeMembership | null>;
}) {
  if (!assigneeId) {
    return null;
  }

  const membership = await findMembership(workspaceId, assigneeId);

  if (!membership) {
    throw new AssigneeError();
  }

  return membership.user;
}
