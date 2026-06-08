"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSafeActionErrorMessage } from "@/lib/action-error";
import {
  createSavedView,
  deleteSavedView,
  renameSavedView,
  SavedViewError,
} from "@/lib/saved-view";
import { parseSavedViewInput } from "@/lib/saved-view-validation";
import { logMutationFailure } from "@/lib/server-logger";

export type SavedViewActionState = {
  error?: string;
};

export async function createSavedViewAction(
  _previousState: SavedViewActionState,
  formData: FormData,
): Promise<SavedViewActionState> {
  try {
    const workspaceId = getRequiredFormString(formData, "workspaceId");
    const workspaceSlug = getRequiredFormString(formData, "workspaceSlug");
    const projectKey = getRequiredFormString(formData, "projectKey");
    const parsed = parseSavedViewInput({
      name: formData.get("name"),
      projectId: formData.get("projectId"),
      filters: {
        status: formData.get("status"),
        priority: formData.get("priority"),
        labelId: formData.get("labelId"),
        query: formData.get("query"),
      },
    });

    if (!parsed.success) {
      return {
        error:
          parsed.error.issues[0]?.message ?? "Enter valid saved view details.",
      };
    }

    await createSavedView({
      workspaceId,
      input: parsed.data,
    });
    revalidateViews();
    redirect(
      `/app/views?workspace=${encodeURIComponent(workspaceSlug)}&project=${encodeURIComponent(projectKey)}`,
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    logMutationFailure("saved_view.create", error);
    return {
      error: getSavedViewActionError(
        error,
        "Saved view could not be created.",
      ),
    };
  }
}

export async function renameSavedViewAction(
  _previousState: SavedViewActionState,
  formData: FormData,
): Promise<SavedViewActionState> {
  let redirectTo = "/app/views";

  try {
    const workspaceSlug = getRequiredFormString(formData, "workspaceSlug");
    await renameSavedView({
      workspaceId: getRequiredFormString(formData, "workspaceId"),
      savedViewId: getRequiredFormString(formData, "savedViewId"),
      name: formData.get("name"),
    });
    revalidateViews();
    redirectTo = `/app/views?workspace=${encodeURIComponent(workspaceSlug)}`;
  } catch (error) {
    logMutationFailure("saved_view.rename", error);
    return {
      error: getSavedViewActionError(
        error,
        "Saved view could not be renamed.",
      ),
    };
  }

  redirect(redirectTo);
}

export async function deleteSavedViewAction(
  _previousState: SavedViewActionState,
  formData: FormData,
): Promise<SavedViewActionState> {
  let redirectTo = "/app/views";

  try {
    const workspaceSlug = getRequiredFormString(formData, "workspaceSlug");
    await deleteSavedView({
      workspaceId: getRequiredFormString(formData, "workspaceId"),
      savedViewId: getRequiredFormString(formData, "savedViewId"),
    });
    revalidateViews();
    redirectTo = `/app/views?workspace=${encodeURIComponent(workspaceSlug)}`;
  } catch (error) {
    logMutationFailure("saved_view.delete", error);
    return {
      error: getSavedViewActionError(
        error,
        "Saved view could not be deleted.",
      ),
    };
  }

  redirect(redirectTo);
}

function getRequiredFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.length === 0) {
    throw new SavedViewError(`${key} is required.`);
  }

  return value;
}

function getSavedViewActionError(error: unknown, fallback: string) {
  return error instanceof SavedViewError
    ? error.message
    : getSafeActionErrorMessage(error, fallback);
}

function revalidateViews() {
  revalidatePath("/app");
  revalidatePath("/app/issues");
  revalidatePath("/app/views");
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
