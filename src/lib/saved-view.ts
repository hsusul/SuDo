import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { assertMutationAllowed } from "@/lib/mutation-rate-limit";
import { getPrisma } from "@/lib/prisma";
import { canManageSavedView } from "@/lib/saved-view-permissions";
import {
  parseSavedViewName,
  parseStoredSavedViewFilters,
  savedViewInputSchema,
  type SavedViewInput,
} from "@/lib/saved-view-validation";
import { requireWorkspaceAccess } from "@/lib/workspace";

export class SavedViewError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SavedViewError";
  }
}

export async function getWorkspaceSavedViews(workspaceId: string) {
  await requireWorkspaceAccess(workspaceId);

  const views = await getPrisma().savedView.findMany({
    where: {
      workspaceId,
      project: {
        archivedAt: null,
      },
    },
    include: {
      project: {
        select: {
          id: true,
          key: true,
          name: true,
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
  });

  return views.map((view) => ({
    ...view,
    filters: parseStoredSavedViewFilters(view.filters),
  }));
}

export async function getSavedView({
  workspaceId,
  savedViewId,
}: {
  workspaceId: string;
  savedViewId: string;
}) {
  await requireWorkspaceAccess(workspaceId);

  const view = await getPrisma().savedView.findFirst({
    where: {
      id: savedViewId,
      workspaceId,
      project: {
        archivedAt: null,
      },
    },
    include: {
      project: {
        select: {
          id: true,
          key: true,
          name: true,
        },
      },
    },
  });

  if (!view) {
    throw new SavedViewError("Saved view not found.");
  }

  return {
    ...view,
    filters: parseStoredSavedViewFilters(view.filters),
  };
}

export async function createSavedView({
  workspaceId,
  input,
}: {
  workspaceId: string;
  input: SavedViewInput;
}) {
  const access = await requireWorkspaceAccess(workspaceId);
  const data = savedViewInputSchema.parse(input);
  assertMutationAllowed({
    key: `saved-view:create:${access.user.id}`,
    limit: 30,
    windowMs: 60_000,
  });

  await validateSavedViewScope({
    workspaceId,
    projectId: data.projectId,
    labelId: data.filters.labelId,
  });

  try {
    return await getPrisma().savedView.create({
      data: {
        workspaceId,
        projectId: data.projectId,
        creatorId: access.user.id,
        name: data.name,
        filters: data.filters as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new SavedViewError(
        "A saved view with this name already exists in the workspace.",
      );
    }

    throw error;
  }
}

export async function renameSavedView({
  workspaceId,
  savedViewId,
  name,
}: {
  workspaceId: string;
  savedViewId: string;
  name: unknown;
}) {
  const access = await requireWorkspaceAccess(workspaceId);
  const parsedName = parseSavedViewName(name);

  if (!parsedName.success) {
    throw new SavedViewError(
      parsedName.error.issues[0]?.message ?? "Enter a valid view name.",
    );
  }

  const view = await getManageableSavedView({
    workspaceId,
    savedViewId,
    userId: access.user.id,
    role: access.membership.role,
  });

  try {
    return await getPrisma().savedView.update({
      where: { id: view.id },
      data: { name: parsedName.data },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new SavedViewError(
        "A saved view with this name already exists in the workspace.",
      );
    }

    throw error;
  }
}

export async function deleteSavedView({
  workspaceId,
  savedViewId,
}: {
  workspaceId: string;
  savedViewId: string;
}) {
  const access = await requireWorkspaceAccess(workspaceId);
  const view = await getManageableSavedView({
    workspaceId,
    savedViewId,
    userId: access.user.id,
    role: access.membership.role,
  });

  return getPrisma().savedView.delete({
    where: { id: view.id },
  });
}

async function validateSavedViewScope({
  workspaceId,
  projectId,
  labelId,
}: {
  workspaceId: string;
  projectId: string;
  labelId?: string;
}) {
  const [project, label] = await Promise.all([
    getPrisma().project.findFirst({
      where: {
        id: projectId,
        workspaceId,
        archivedAt: null,
      },
      select: { id: true },
    }),
    labelId
      ? getPrisma().label.findFirst({
          where: {
            id: labelId,
            workspaceId,
          },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  if (!project) {
    throw new SavedViewError("Project does not belong to this workspace.");
  }

  if (labelId && !label) {
    throw new SavedViewError("Label does not belong to this workspace.");
  }
}

async function getManageableSavedView({
  workspaceId,
  savedViewId,
  userId,
  role,
}: {
  workspaceId: string;
  savedViewId: string;
  userId: string;
  role: "owner" | "admin" | "member";
}) {
  const view = await getPrisma().savedView.findFirst({
    where: {
      id: savedViewId,
      workspaceId,
    },
  });

  if (!view) {
    throw new SavedViewError("Saved view not found.");
  }

  if (
    !canManageSavedView({
      role,
      userId,
      creatorId: view.creatorId,
    })
  ) {
    throw new SavedViewError(
      "Only the creator or a workspace manager can change this saved view.",
    );
  }

  return view;
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}
