"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSafeActionErrorMessage } from "@/lib/action-error";
import {
  addLabelToIssue,
  createLabelForWorkspace,
  removeLabelFromIssue,
} from "@/lib/label";
import { parseIssueFilters } from "@/lib/issue-filter-validation";
import { buildIssueListPath } from "@/lib/issue-url";
import { parseLabelInput } from "@/lib/label-validation";

export type LabelActionState = {
  error?: string;
};

export async function createLabelAction(
  _previousState: LabelActionState,
  formData: FormData,
): Promise<LabelActionState> {
  const workspaceId = getRequiredFormString(formData, "workspaceId");
  const issueId = getRequiredFormString(formData, "issueId");
  const workspaceSlug = getRequiredFormString(formData, "workspaceSlug");
  const projectKey = getRequiredFormString(formData, "projectKey");
  const parsed = parseLabelInput({
    name: formData.get("name"),
    color: formData.get("color"),
  });

  if (!parsed.success) {
    return { error: getFirstLabelError(parsed.error) };
  }

  try {
    const label = await createLabelForWorkspace({ workspaceId, input: parsed.data });
    await addLabelToIssue({ issueId, labelId: label.id });
    revalidatePath("/app");
    redirect(buildIssueRedirectPath(formData, workspaceSlug, projectKey, issueId));
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return {
      error: getSafeActionErrorMessage(
        error,
        "Label could not be created. Check your issue access.",
      ),
    };
  }
}

export async function addLabelToIssueAction(
  _previousState: LabelActionState,
  formData: FormData,
): Promise<LabelActionState> {
  const issueId = getRequiredFormString(formData, "issueId");
  const labelId = getRequiredFormString(formData, "labelId");
  const workspaceSlug = getRequiredFormString(formData, "workspaceSlug");
  const projectKey = getRequiredFormString(formData, "projectKey");

  try {
    await addLabelToIssue({ issueId, labelId });
    revalidatePath("/app");
    redirect(buildIssueRedirectPath(formData, workspaceSlug, projectKey, issueId));
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return {
      error: getSafeActionErrorMessage(
        error,
        "Label could not be attached. Check your issue access.",
      ),
    };
  }
}

export async function removeLabelFromIssueAction(
  _previousState: LabelActionState,
  formData: FormData,
): Promise<LabelActionState> {
  const issueId = getRequiredFormString(formData, "issueId");
  const labelId = getRequiredFormString(formData, "labelId");
  const workspaceSlug = getRequiredFormString(formData, "workspaceSlug");
  const projectKey = getRequiredFormString(formData, "projectKey");

  try {
    await removeLabelFromIssue({ issueId, labelId });
    revalidatePath("/app");
    redirect(buildIssueRedirectPath(formData, workspaceSlug, projectKey, issueId));
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return {
      error: getSafeActionErrorMessage(
        error,
        "Label could not be removed. Check your issue access.",
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

function getFirstLabelError(error: { issues: Array<{ message: string }> }) {
  return error.issues[0]?.message ?? "Enter a valid label.";
}

function buildIssueRedirectPath(
  formData: FormData,
  workspaceSlug: string,
  projectKey: string,
  issueId: string,
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

function isRedirectError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof error.digest === "string" &&
    error.digest.startsWith("NEXT_REDIRECT")
  );
}
