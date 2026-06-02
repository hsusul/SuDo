import "server-only";

import type { IssueStatusType, Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import { requireWorkspaceAccess } from "@/lib/workspace";
import {
  issueInputSchema,
  type IssueInput,
  type IssueStatusValue,
} from "@/lib/issue-validation";
import {
  parseIssueFilters,
  type IssueFilterInput,
} from "@/lib/issue-filter-validation";

const DEFAULT_STATUSES: Array<{
  type: IssueStatusValue;
  name: string;
  color: string;
  sortOrder: number;
  isDefault: boolean;
}> = [
  { type: "backlog", name: "Backlog", color: "#737373", sortOrder: 0, isDefault: true },
  { type: "todo", name: "Todo", color: "#a3a3a3", sortOrder: 1, isDefault: false },
  {
    type: "in_progress",
    name: "In Progress",
    color: "#5eead4",
    sortOrder: 2,
    isDefault: false,
  },
  { type: "done", name: "Done", color: "#86efac", sortOrder: 3, isDefault: false },
];

export type ProjectIssue = Awaited<ReturnType<typeof getProjectIssues>>[number];
export type IssueDetail = NonNullable<Awaited<ReturnType<typeof getIssueForDetail>>>;

export async function getProjectIssues(
  projectId: string,
  filterInput: IssueFilterInput = {},
) {
  const project = await getActiveProject(projectId);
  await requireWorkspaceAccess(project.workspaceId);
  await ensureDefaultIssueStatuses(project.workspaceId);
  const filters = parseIssueFilters(filterInput);
  const where: Prisma.IssueWhereInput = {
    projectId,
    archivedAt: null,
  };

  if (filters.status) {
    where.status = {
      type: filters.status as IssueStatusType,
    };
  }

  if (filters.priority) {
    where.priority = filters.priority;
  }

  if (filters.labelId) {
    where.labels = {
      some: {
        labelId: filters.labelId,
        label: {
          workspaceId: project.workspaceId,
        },
      },
    };
  }

  if (filters.query) {
    const numericIssueNumber = Number(filters.query);
    const numberFilter = Number.isInteger(numericIssueNumber)
      ? [{ issueNumber: numericIssueNumber }]
      : [];

    where.OR = [
      { issueKey: { contains: filters.query, mode: "insensitive" } },
      { title: { contains: filters.query, mode: "insensitive" } },
      { description: { contains: filters.query, mode: "insensitive" } },
      ...numberFilter,
    ];
  }

  return getPrisma().issue.findMany({
    where,
    include: {
      status: true,
      labels: {
        include: {
          label: true,
        },
        orderBy: {
          label: {
            name: "asc",
          },
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }, { issueNumber: "desc" }],
  });
}

export async function getIssueForDetail(issueId: string) {
  const issue = await getPrisma().issue.findUnique({
    where: { id: issueId },
    include: {
      status: true,
      project: {
        select: {
          id: true,
          key: true,
          name: true,
          archivedAt: true,
        },
      },
      labels: {
        include: {
          label: true,
        },
        orderBy: {
          label: {
            name: "asc",
          },
        },
      },
    },
  });

  if (!issue || issue.archivedAt || issue.project.archivedAt) {
    return null;
  }

  await requireWorkspaceAccess(issue.workspaceId);

  return issue;
}

export async function createIssueForProject({
  projectId,
  input,
}: {
  projectId: string;
  input: IssueInput;
}) {
  const project = await getActiveProject(projectId);
  const access = await requireWorkspaceAccess(project.workspaceId);
  const data = issueInputSchema.parse(input);
  const statuses = await ensureDefaultIssueStatuses(project.workspaceId);
  const status = getStatusOrThrow(statuses, data.status);

  return getPrisma().$transaction(async (tx) => {
    const aggregate = await tx.issue.aggregate({
      where: { projectId },
      _max: { issueNumber: true },
    });
    const issueNumber = (aggregate._max.issueNumber ?? 0) + 1;
    const issueKey = `${project.key}-${issueNumber}`;

    return tx.issue.create({
      data: {
        workspaceId: project.workspaceId,
        projectId,
        statusId: status.id,
        creatorId: access.user.id,
        issueNumber,
        issueKey,
        title: data.title,
        description: data.description,
        priority: data.priority,
        completedAt: data.status === "done" ? new Date() : null,
      },
      include: {
        status: true,
        labels: {
          include: {
            label: true,
          },
        },
      },
    });
  });
}

export async function updateIssue({
  issueId,
  input,
}: {
  issueId: string;
  input: IssueInput;
}) {
  const issue = await getActiveIssueForMutation(issueId);
  await requireWorkspaceAccess(issue.workspaceId);
  const data = issueInputSchema.parse(input);
  const statuses = await ensureDefaultIssueStatuses(issue.workspaceId);
  const status = getStatusOrThrow(statuses, data.status);

  return getPrisma().issue.update({
    where: { id: issueId },
    data: {
      title: data.title,
      description: data.description,
      statusId: status.id,
      priority: data.priority,
      completedAt: data.status === "done" ? (issue.completedAt ?? new Date()) : null,
    },
    include: {
      status: true,
      labels: {
        include: {
          label: true,
        },
      },
    },
  });
}

export async function archiveIssue({ issueId }: { issueId: string }) {
  const issue = await getActiveIssueForMutation(issueId);
  await requireWorkspaceAccess(issue.workspaceId);

  return getPrisma().issue.update({
    where: { id: issueId },
    data: {
      archivedAt: new Date(),
    },
  });
}

async function getActiveProject(projectId: string) {
  const project = await getPrisma().project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      key: true,
      workspaceId: true,
      archivedAt: true,
    },
  });

  if (!project || project.archivedAt) {
    throw new Error("Project not found.");
  }

  return project;
}

async function getActiveIssueForMutation(issueId: string) {
  const issue = await getPrisma().issue.findUnique({
    where: { id: issueId },
    select: {
      id: true,
      workspaceId: true,
      projectId: true,
      statusId: true,
      completedAt: true,
      archivedAt: true,
    },
  });

  if (!issue || issue.archivedAt) {
    throw new Error("Issue not found.");
  }

  return issue;
}

async function ensureDefaultIssueStatuses(workspaceId: string) {
  await getPrisma().$transaction(
    DEFAULT_STATUSES.map((status) =>
      getPrisma().issueStatus.upsert({
        where: {
          workspaceId_type: {
            workspaceId,
            type: status.type as IssueStatusType,
          },
        },
        create: {
          workspaceId,
          name: status.name,
          type: status.type as IssueStatusType,
          color: status.color,
          sortOrder: status.sortOrder,
          isDefault: status.isDefault,
        },
        update: {},
      }),
    ),
  );

  return getPrisma().issueStatus.findMany({
    where: { workspaceId },
    orderBy: { sortOrder: "asc" },
  });
}

function getStatusOrThrow(
  statuses: Array<{ id: string; type: IssueStatusType }>,
  type: IssueStatusValue,
) {
  const status = statuses.find((item) => item.type === type);

  if (!status) {
    throw new Error("Issue status is not configured for this workspace.");
  }

  return status;
}
