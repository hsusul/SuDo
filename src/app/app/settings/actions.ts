"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSafeActionErrorMessage } from "@/lib/action-error";
import { requireCurrentUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { assertMutationAllowed } from "@/lib/mutation-rate-limit";
import { logMutationFailure, logServerEvent } from "@/lib/server-logger";
import {
  deleteWorkspaceWithClient,
  type WorkspaceDeletionPrisma,
  WorkspaceDeleteError,
} from "@/lib/workspace-delete";

export type DeleteWorkspaceState = {
  error?: string;
};

export async function deleteWorkspaceAction(
  _previousState: DeleteWorkspaceState,
  formData: FormData,
): Promise<DeleteWorkspaceState> {
  let redirectTo = "/app";
  let workspaceId: string | undefined;
  let userId: string | undefined;

  try {
    workspaceId = getRequiredFormString(formData, "workspaceId");
    const confirmationName = getRequiredFormString(formData, "confirmationName");
    const user = await requireCurrentUser();
    userId = user.id;
    logServerEvent("warn", "workspace.delete.attempted", {
      workspaceId,
      userId,
    });
    assertMutationAllowed({
      key: `workspace:delete:${user.id}`,
      limit: 5,
      windowMs: 60 * 60_000,
    });
    const result = await deleteWorkspaceWithClient({
      prisma: getPrisma() as unknown as WorkspaceDeletionPrisma,
      userId: user.id,
      workspaceId,
      confirmationName,
    });

    redirectTo = result.redirectTo;
    logServerEvent("warn", "workspace.delete.succeeded", {
      workspaceId,
      userId,
    });
    revalidatePath("/app");
    revalidatePath("/app/projects");
    revalidatePath("/app/issues");
    revalidatePath("/app/views");
    revalidatePath("/app/settings");
  } catch (error) {
    logMutationFailure("workspace.delete", error, {
      workspaceId,
      userId,
    });
    return {
      error: error instanceof WorkspaceDeleteError
        ? error.message
        : getSafeActionErrorMessage(
            error,
            "Workspace could not be deleted. Check your workspace access.",
          ),
    };
  }

  redirect(redirectTo);
}

function getRequiredFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.length === 0) {
    throw new WorkspaceDeleteError(`${key} is required.`);
  }

  return value;
}
