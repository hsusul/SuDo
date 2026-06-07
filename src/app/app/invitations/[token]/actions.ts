"use server";

import { redirect } from "next/navigation";
import { getSafeActionErrorMessage } from "@/lib/action-error";
import {
  acceptWorkspaceInvitation,
  WorkspaceCollaborationError,
} from "@/lib/workspace-collaboration";
import { WorkspacePermissionError } from "@/lib/workspace-permissions";

export type AcceptInvitationState = {
  error?: string;
};

export async function acceptWorkspaceInvitationAction(
  _previousState: AcceptInvitationState,
  formData: FormData,
): Promise<AcceptInvitationState> {
  const token = formData.get("token");

  if (typeof token !== "string" || token.length === 0) {
    return { error: "Invitation token is required." };
  }

  try {
    const result = await acceptWorkspaceInvitation(token);
    redirect(
      `/app/issues?workspace=${encodeURIComponent(result.workspaceSlug)}`,
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return {
      error:
        error instanceof WorkspaceCollaborationError ||
        error instanceof WorkspacePermissionError
          ? error.message
          : getSafeActionErrorMessage(
              error,
              "Invitation could not be accepted.",
            ),
    };
  }
}

function isRedirectError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof error.digest === "string" &&
    error.digest.startsWith("NEXT_REDIRECT")
  );
}
