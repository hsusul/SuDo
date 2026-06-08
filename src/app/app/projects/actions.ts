"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSafeActionErrorMessage } from "@/lib/action-error";
import {
  archiveProject,
  createProjectForWorkspace,
  updateProject,
} from "@/lib/project";
import { parseProjectInput } from "@/lib/project-validation";
import { logMutationFailure } from "@/lib/server-logger";

export type ProjectActionState = {
  error?: string;
};

export async function createProjectAction(
  _previousState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const workspaceId = getRequiredFormString(formData, "workspaceId");
  const workspaceSlug = getRequiredFormString(formData, "workspaceSlug");
  const parsed = parseProjectInput({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: getFirstProjectError(parsed.error) };
  }

  try {
    await createProjectForWorkspace({ workspaceId, input: parsed.data });
    revalidatePath("/app");
    redirect(`/app/projects?workspace=${workspaceSlug}`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    logMutationFailure("project.create", error, { workspaceId });
    return {
      error: getSafeActionErrorMessage(
        error,
        "Project could not be created. Check your workspace access.",
      ),
    };
  }
}

export async function updateProjectAction(
  _previousState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const projectId = getRequiredFormString(formData, "projectId");
  const workspaceSlug = getRequiredFormString(formData, "workspaceSlug");
  const parsed = parseProjectInput({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: getFirstProjectError(parsed.error) };
  }

  try {
    await updateProject({ projectId, input: parsed.data });
    revalidatePath("/app");
    redirect(`/app/projects?workspace=${workspaceSlug}`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    logMutationFailure("project.update", error, { projectId });
    return {
      error: getSafeActionErrorMessage(
        error,
        "Project could not be updated. Check your workspace access.",
      ),
    };
  }
}

export async function archiveProjectAction(
  _previousState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const projectId = getRequiredFormString(formData, "projectId");
  const workspaceSlug = getRequiredFormString(formData, "workspaceSlug");

  try {
    await archiveProject({ projectId });
    revalidatePath("/app");
    redirect(`/app/projects?workspace=${workspaceSlug}`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    logMutationFailure("project.archive", error, { projectId });
    return {
      error: getSafeActionErrorMessage(
        error,
        "Project could not be archived. Check your workspace access.",
      ),
    };
  }
}

function getRequiredFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${key} is required.`);
  }

  return value;
}

function getFirstProjectError(error: { issues: Array<{ message: string }> }) {
  return error.issues[0]?.message ?? "Enter valid project details.";
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
