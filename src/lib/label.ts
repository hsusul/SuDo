import "server-only";

import { labelInputSchema, slugifyLabelName, type LabelInput } from "@/lib/label-validation";
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
  await requireWorkspaceAccess(workspaceId);
  const data = labelInputSchema.parse(input);
  const slug = slugifyLabelName(data.name);

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
  await requireWorkspaceAccess(issue.workspaceId);

  if (label.workspaceId !== issue.workspaceId) {
    throw new Error("Label does not belong to this issue workspace.");
  }

  return getPrisma().issueLabel.upsert({
    where: {
      issueId_labelId: {
        issueId,
        labelId,
      },
    },
    create: {
      issueId,
      labelId,
    },
    update: {},
  });
}

export async function removeLabelFromIssue({
  issueId,
  labelId,
}: {
  issueId: string;
  labelId: string;
}) {
  const { issue, label } = await getIssueAndLabelForMutation(issueId, labelId);
  await requireWorkspaceAccess(issue.workspaceId);

  if (label.workspaceId !== issue.workspaceId) {
    throw new Error("Label does not belong to this issue workspace.");
  }

  return getPrisma().issueLabel.deleteMany({
    where: {
      issueId,
      labelId,
    },
  });
}

async function getIssueAndLabelForMutation(issueId: string, labelId: string) {
  const [issue, label] = await Promise.all([
    getPrisma().issue.findUnique({
      where: { id: issueId },
      select: {
        id: true,
        workspaceId: true,
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
