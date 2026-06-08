"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSafeActionErrorMessage } from "@/lib/action-error";
import {
  archiveIssue,
  createIssueForProject,
  updateIssue,
} from "@/lib/issue";
import { parseIssueFilters } from "@/lib/issue-filter-validation";
import { buildIssueListPath } from "@/lib/issue-url";
import { parseIssueInput } from "@/lib/issue-validation";
import { logMutationFailure } from "@/lib/server-logger";

export type IssueActionState = {
  error?: string;
};

export async function createIssueAction(
  _previousState: IssueActionState,
  formData: FormData,
): Promise<IssueActionState> {
  const projectId = getRequiredFormString(formData, "projectId");
  const workspaceSlug = getRequiredFormString(formData, "workspaceSlug");
  const projectKey = getRequiredFormString(formData, "projectKey");
  const parsed = parseIssueInput({
    title: formData.get("title"),
    description: formData.get("description"),
    status: formData.get("status"),
    priority: formData.get("priority"),
    assigneeId: formData.get("assigneeId"),
  });

  if (!parsed.success) {
    return { error: getFirstIssueError(parsed.error) };
  }

  try {
    const issue = await createIssueForProject({ projectId, input: parsed.data });
    revalidatePath("/app");
    redirect(buildIssueRedirectPath(formData, workspaceSlug, projectKey, issue.id));
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    logMutationFailure("issue.create", error, { projectId });
    return {
      error: getSafeActionErrorMessage(
        error,
        "Issue could not be created. Check your project access.",
      ),
    };
  }
}

export async function updateIssueAction(
  _previousState: IssueActionState,
  formData: FormData,
): Promise<IssueActionState> {
  const issueId = getRequiredFormString(formData, "issueId");
  const workspaceSlug = getRequiredFormString(formData, "workspaceSlug");
  const projectKey = getRequiredFormString(formData, "projectKey");
  const returnToIssueId = getOptionalFormString(formData, "returnToIssueId");
  const parsed = parseIssueInput({
    title: formData.get("title"),
    description: formData.get("description"),
    status: formData.get("status"),
    priority: formData.get("priority"),
    assigneeId: formData.get("assigneeId"),
  });

  if (!parsed.success) {
    return { error: getFirstIssueError(parsed.error) };
  }

  try {
    await updateIssue({ issueId, input: parsed.data });
    revalidatePath("/app");
    redirect(buildIssueRedirectPath(formData, workspaceSlug, projectKey, returnToIssueId ?? undefined));
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    logMutationFailure("issue.update", error, { issueId });
    return {
      error: getSafeActionErrorMessage(
        error,
        "Issue could not be updated. Check your project access.",
      ),
    };
  }
}

export async function archiveIssueAction(
  _previousState: IssueActionState,
  formData: FormData,
): Promise<IssueActionState> {
  const issueId = getRequiredFormString(formData, "issueId");
  const workspaceSlug = getRequiredFormString(formData, "workspaceSlug");
  const projectKey = getRequiredFormString(formData, "projectKey");

  try {
    await archiveIssue({ issueId });
    revalidatePath("/app");
    redirect(buildIssueRedirectPath(formData, workspaceSlug, projectKey));
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    logMutationFailure("issue.archive", error, { issueId });
    return {
      error: getSafeActionErrorMessage(
        error,
        "Issue could not be archived. Check your project access.",
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

function getOptionalFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" && value.length > 0 ? value : null;
}

function buildIssueRedirectPath(
  formData: FormData,
  workspaceSlug: string,
  projectKey: string,
  issueId?: string,
) {
  return buildIssueListPath({
    workspaceSlug,
    projectKey,
    issueId,
    filters: parseIssueFilters({
      status: formData.get("filterStatus"),
      priority: formData.get("filterPriority"),
      label: formData.get("filterLabel"),
      q: formData.get("filterQ"),
    }),
  });
}

function getFirstIssueError(error: { issues: Array<{ message: string }> }) {
  return error.issues[0]?.message ?? "Enter valid issue details.";
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
