import { MutationRateLimitError } from "@/lib/mutation-rate-limit";

const safeActionErrorNames = new Set([
  "AssigneeError",
  "CurrentUserError",
  "InvitationError",
  "LabelError",
  "ProjectError",
  "SavedViewError",
  "WorkspaceAccessError",
  "WorkspaceCollaborationError",
  "WorkspaceDeleteError",
  "WorkspacePermissionError",
]);

export function getSafeActionErrorMessage(error: unknown, fallback: string) {
  if (error instanceof MutationRateLimitError) {
    return error.message;
  }

  if (isPrismaError(error)) {
    return fallback;
  }

  return error instanceof Error && safeActionErrorNames.has(error.name)
    ? error.message
    : fallback;
}

function isPrismaError(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string" &&
    /^P\d{4}$/.test(error.code)
  );
}
