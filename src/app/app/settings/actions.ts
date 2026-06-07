"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSafeActionErrorMessage } from "@/lib/action-error";
import { requireCurrentUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { assertMutationAllowed } from "@/lib/mutation-rate-limit";
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

  try {
    const workspaceId = getRequiredFormString(formData, "workspaceId");
    const confirmationName = getRequiredFormString(formData, "confirmationName");
    const user = await requireCurrentUser();
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
    revalidatePath("/app");
    revalidatePath("/app/projects");
    revalidatePath("/app/issues");
    revalidatePath("/app/views");
    revalidatePath("/app/settings");
  } catch (error) {
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
