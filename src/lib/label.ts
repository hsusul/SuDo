import "server-only";

import { activityActions } from "@/lib/activity-events";
import { labelInputSchema, slugifyLabelName, type LabelInput } from "@/lib/label-validation";
import { assertMutationAllowed } from "@/lib/mutation-rate-limit";
import { getPrisma } from "@/lib/prisma";
import { requireWorkspaceAccess } from "@/lib/workspace";

export type WorkspaceLabel = Awaited<ReturnType<typeof getWorkspaceLabels>>[number];

export async function getWorkspaceLabels(workspaceId: string) {
  await requireWorkspaceAccess(workspaceId);

  return getPrisma().label.findMany({
    where: { workspaceId },
    orderBy: [{ name: "asc" }],
  });
}

export async function createLabelForWorkspace({
  workspaceId,
  input,
}: {
  workspaceId: string;
  input: LabelInput;
}) {
  const access = await requireWorkspaceAccess(workspaceId);
  const data = labelInputSchema.parse(input);
  const slug = slugifyLabelName(data.name);
  assertMutationAllowed({
    key: `label:create:${access.user.id}`,
    limit: 30,
    windowMs: 60_000,
  });

  return getPrisma().label.upsert({
    where: {
      workspaceId_slug: {
        workspaceId,
        slug,
      },
    },
    create: {
      workspaceId,
      name: data.name,
      slug,
      color: data.color,
    },
    update: {
      name: data.name,
      color: data.color,
    },
  });
}

export async function addLabelToIssue({
  issueId,
  labelId,
}: {
  issueId: string;
  labelId: string;
}) {
  const { issue, label } = await getIssueAndLabelForMutation(issueId, labelId);
  const access = await requireWorkspaceAccess(issue.workspaceId);

  if (label.workspaceId !== issue.workspaceId) {
    throw new Error("Label does not belong to this issue workspace.");
  }

  const existing = await getPrisma().issueLabel.findUnique({
    where: {
      issueId_labelId: {
        issueId,
        labelId,
      },
    },
  });

  if (existing) {
    return existing;
  }

  try {
    return await getPrisma().$transaction(async (tx) => {
      const issueLabel = await tx.issueLabel.create({
        data: {
          issueId,
          labelId,
        },
      });

      await tx.activityLog.create({
        data: {
          workspaceId: issue.workspaceId,
          issueId,
          projectId: issue.projectId,
          actorId: access.user.id,
          action: activityActions.issueLabelAdded,
          metadata: {
            labelId,
            labelName: label.name,
          },
        },
      });

      return issueLabel;
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return getPrisma().issueLabel.findUniqueOrThrow({
        where: {
          issueId_labelId: {
            issueId,
            labelId,
          },
        },
      });
    }

    throw error;
  }
}

export async function removeLabelFromIssue({
  issueId,
  labelId,
}: {
  issueId: string;
  labelId: string;
}) {
  const { issue, label } = await getIssueAndLabelForMutation(issueId, labelId);
  const access = await requireWorkspaceAccess(issue.workspaceId);

  if (label.workspaceId !== issue.workspaceId) {
    throw new Error("Label does not belong to this issue workspace.");
  }

  return getPrisma().$transaction(async (tx) => {
    const removed = await tx.issueLabel.deleteMany({
      where: {
        issueId,
        labelId,
      },
    });

    if (removed.count > 0) {
      await tx.activityLog.create({
        data: {
          workspaceId: issue.workspaceId,
          issueId,
          projectId: issue.projectId,
          actorId: access.user.id,
          action: activityActions.issueLabelRemoved,
          metadata: {
            labelId,
            labelName: label.name,
          },
        },
      });
    }

    return removed;
  });
}

async function getIssueAndLabelForMutation(issueId: string, labelId: string) {
  const [issue, label] = await Promise.all([
    getPrisma().issue.findUnique({
      where: { id: issueId },
      select: {
        id: true,
        workspaceId: true,
        projectId: true,
        archivedAt: true,
        project: {
          select: {
            archivedAt: true,
          },
        },
      },
    }),
    getPrisma().label.findUnique({
      where: { id: labelId },
      select: {
        id: true,
        workspaceId: true,
        name: true,
      },
    }),
  ]);

  if (!issue || issue.archivedAt || issue.project.archivedAt) {
    throw new Error("Issue not found.");
  }

  if (!label) {
    throw new Error("Label not found.");
  }

  return { issue, label };
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}
