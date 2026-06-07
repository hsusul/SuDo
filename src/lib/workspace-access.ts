import type { User, Workspace, WorkspaceMember } from "@/generated/prisma/client";

export type UserWorkspace = WorkspaceMember & {
  workspace: Workspace;
};

export type WorkspaceAccess = {
  user: User;
  membership: UserWorkspace;
  workspace: Workspace;
};

export class WorkspaceAccessError extends Error {
  constructor(message = "Workspace access denied.") {
    super(message);
    this.name = "WorkspaceAccessError";
  }
}

export async function resolveWorkspaceAccess({
  findMembership,
  user,
  workspaceId,
}: {
  findMembership: (workspaceId: string, userId: string) => Promise<UserWorkspace | null>;
  user: User;
  workspaceId: string;
}): Promise<WorkspaceAccess> {
  const membership = await findMembership(workspaceId, user.id);

  if (!membership || membership.workspace.archivedAt) {
    throw new WorkspaceAccessError();
  }

  return {
    user,
    membership,
    workspace: membership.workspace,
  };
}
