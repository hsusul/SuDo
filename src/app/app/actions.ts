"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSafeActionErrorMessage } from "@/lib/action-error";
import { requireCurrentUser } from "@/lib/auth";
import { createDemoWorkspaceForUser } from "@/lib/demo-seed";
import { assertMutationAllowed } from "@/lib/mutation-rate-limit";
import { getPrisma } from "@/lib/prisma";
import { logMutationFailure } from "@/lib/server-logger";
import { createWorkspaceForUser } from "@/lib/workspace";
import { parseWorkspaceName } from "@/lib/workspace-validation";

export type CreateWorkspaceState = {
  error?: string;
};

export async function createWorkspaceAction(
  _previousState: CreateWorkspaceState,
  formData: FormData,
): Promise<CreateWorkspaceState> {
  const parsedName = parseWorkspaceName(formData.get("name"));
  const redirectTo = formData.get("redirectTo");

  if (!parsedName.success) {
    return {
      error: parsedName.error.issues[0]?.message ?? "Enter a valid workspace name.",
    };
  }

  try {
    const user = await requireCurrentUser();
    assertMutationAllowed({
      key: `workspace:create:${user.id}`,
      limit: 10,
      windowMs: 60 * 60_000,
    });
    const workspace = await createWorkspaceForUser({
      userId: user.id,
      name: parsedName.data,
    });

    revalidatePath("/app");
    revalidatePath("/app/projects");

    if (redirectTo === "projects") {
      redirect(`/app/projects?workspace=${workspace.slug}`);
    }

    redirect(`/app?workspace=${workspace.slug}`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    logMutationFailure("workspace.create", error);
    return {
      error: getSafeActionErrorMessage(
        error,
        "Workspace could not be created. Check your auth and database setup.",
      ),
    };
  }
}

export async function createDemoWorkspaceAction(
  _previousState: CreateWorkspaceState,
): Promise<CreateWorkspaceState> {
  void _previousState;

  try {
    const user = await requireCurrentUser();
    assertMutationAllowed({
      key: `workspace:demo:${user.id}`,
      limit: 3,
      windowMs: 60 * 60_000,
    });
    const demo = await createDemoWorkspaceForUser({
      prisma: getPrisma(),
      userId: user.id,
    });

    revalidatePath("/app");

    if (demo.firstProjectKey) {
      redirect(`/app/issues?workspace=${demo.workspaceSlug}&project=${demo.firstProjectKey}`);
    }

    redirect(`/app?workspace=${demo.workspaceSlug}`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    logMutationFailure("workspace.demo.create", error);
    return {
      error: getSafeActionErrorMessage(
        error,
        "Demo workspace could not be created. Check your auth and database setup.",
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
