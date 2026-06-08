"use server";

import type { WorkspaceRole } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { getSafeActionErrorMessage } from "@/lib/action-error";
import { parseWorkspaceInvitationInput } from "@/lib/invitation-validation";
import { logMutationFailure } from "@/lib/server-logger";
import {
  createWorkspaceInvitation,
  removeWorkspaceMember,
  revokeWorkspaceInvitation,
  updateWorkspaceMemberRole,
  WorkspaceCollaborationError,
} from "@/lib/workspace-collaboration";
import { WorkspacePermissionError } from "@/lib/workspace-permissions";

export type CollaborationActionState = {
  error?: string;
  invitePath?: string;
};

export async function createWorkspaceInvitationAction(
  _previousState: CollaborationActionState,
  formData: FormData,
): Promise<CollaborationActionState> {
  try {
    const workspaceId = getRequiredFormString(formData, "workspaceId");
    const parsed = parseWorkspaceInvitationInput({
      email: formData.get("email"),
      role: formData.get("role"),
    });

    if (!parsed.success) {
      return {
        error:
          parsed.error.issues[0]?.message ?? "Enter valid invitation details.",
      };
    }

    const result = await createWorkspaceInvitation({
      workspaceId,
      input: parsed.data,
    });
    revalidateSettings();

    return {
      invitePath: result.invitePath,
    };
  } catch (error) {
    logMutationFailure("workspace.invitation.create", error);
    return {
      error: getCollaborationError(
        error,
        "Invitation could not be created.",
      ),
    };
  }
}

export async function revokeWorkspaceInvitationAction(
  _previousState: CollaborationActionState,
  formData: FormData,
): Promise<CollaborationActionState> {
  try {
    await revokeWorkspaceInvitation({
      workspaceId: getRequiredFormString(formData, "workspaceId"),
      invitationId: getRequiredFormString(formData, "invitationId"),
    });
    revalidateSettings();
    return {};
  } catch (error) {
    logMutationFailure("workspace.invitation.revoke", error);
    return {
      error: getCollaborationError(
        error,
        "Invitation could not be revoked.",
      ),
    };
  }
}

export async function updateWorkspaceMemberRoleAction(
  _previousState: CollaborationActionState,
  formData: FormData,
): Promise<CollaborationActionState> {
  try {
    await updateWorkspaceMemberRole({
      workspaceId: getRequiredFormString(formData, "workspaceId"),
      membershipId: getRequiredFormString(formData, "membershipId"),
      role: getMemberRole(formData.get("role")),
    });
    revalidateSettings();
    return {};
  } catch (error) {
    logMutationFailure("workspace.member.role_update", error);
    return {
      error: getCollaborationError(
        error,
        "Member role could not be updated.",
      ),
    };
  }
}

export async function removeWorkspaceMemberAction(
  _previousState: CollaborationActionState,
  formData: FormData,
): Promise<CollaborationActionState> {
  try {
    await removeWorkspaceMember({
      workspaceId: getRequiredFormString(formData, "workspaceId"),
      membershipId: getRequiredFormString(formData, "membershipId"),
    });
    revalidateSettings();
    return {};
  } catch (error) {
    logMutationFailure("workspace.member.remove", error);
    return {
      error: getCollaborationError(
        error,
        "Workspace member could not be removed.",
      ),
    };
  }
}

function getMemberRole(value: FormDataEntryValue | null): WorkspaceRole {
  if (value === "admin" || value === "member") {
    return value;
  }

  throw new WorkspaceCollaborationError("Choose a valid member role.");
}

function getRequiredFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.length === 0) {
    throw new WorkspaceCollaborationError(`${key} is required.`);
  }

  return value;
}

function getCollaborationError(error: unknown, fallback: string) {
  if (
    error instanceof WorkspaceCollaborationError ||
    error instanceof WorkspacePermissionError
  ) {
    return error.message;
  }

  return getSafeActionErrorMessage(error, fallback);
}

function revalidateSettings() {
  revalidatePath("/app");
  revalidatePath("/app/settings");
  revalidatePath("/app/issues");
}
