import type { WorkspaceRole } from "@/generated/prisma/client";

export function canManageSavedView({
  role,
  userId,
  creatorId,
}: {
  role: WorkspaceRole;
  userId: string;
  creatorId: string | null;
}) {
  return (
    role === "owner" ||
    role === "admin" ||
    (creatorId !== null && creatorId === userId)
  );
}
