"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createCommentForIssue } from "@/lib/comment";
import { parseCommentInput } from "@/lib/comment-validation";
import { parseIssueFilters } from "@/lib/issue-filter-validation";
import { buildIssueListPath } from "@/lib/issue-url";

export type CommentActionState = {
  error?: string;
};

export async function createCommentAction(
  _previousState: CommentActionState,
  formData: FormData,
): Promise<CommentActionState> {
  const issueId = getRequiredFormString(formData, "issueId");
  const workspaceSlug = getRequiredFormString(formData, "workspaceSlug");
  const projectKey = getRequiredFormString(formData, "projectKey");
  const parsed = parseCommentInput({ body: formData.get("body") });

  if (!parsed.success) {
    return { error: getFirstCommentError(parsed.error) };
  }

  try {
    await createCommentForIssue({ issueId, input: parsed.data });
    revalidatePath("/app");
    redirect(
      buildIssueListPath({
        workspaceSlug,
        projectKey,
        issueId,
        filters: parseIssueFilters({
          status: formData.get("filterStatus"),
          priority: formData.get("filterPriority"),
          label: formData.get("filterLabel"),
          q: formData.get("filterQ"),
        }),
      }),
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return {
      error:
        error instanceof Error
          ? error.message
          : "Comment could not be added. Check your issue access.",
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

function getFirstCommentError(error: { issues: Array<{ message: string }> }) {
  return error.issues[0]?.message ?? "Enter a valid comment.";
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
