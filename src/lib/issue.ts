import "server-only";

import type { IssueStatusType, Prisma } from "@/generated/prisma/client";
import {
  activityActions,
  buildIssueUpdateActivityEvents,
} from "@/lib/activity-events";
import { resolveWorkspaceAssignee } from "@/lib/assignee";
import { DEFAULT_ISSUE_STATUSES } from "@/lib/default-issue-statuses";
import { runWithIssueNumberRetry } from "@/lib/issue-numbering";
import { getPrisma } from "@/lib/prisma";
import { assertMutationAllowed } from "@/lib/mutation-rate-limit";
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

export type ProjectIssue = Awaited<ReturnType<typeof getProjectIssues>>[number];
export type IssueDetail = NonNullable<Awaited<ReturnType<typeof getIssueForDetail>>>;

export async function getProjectIssues(
  projectId: string,
  filterInput: IssueFilterInput = {},
) {
  const project = await getActiveProject(projectId);
  await requireWorkspaceAccess(project.workspaceId);
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
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true,
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
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true,
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
  assertMutationAllowed({
    key: `issue:create:${access.user.id}`,
    limit: 30,
    windowMs: 60_000,
  });
  const statuses = await ensureDefaultIssueStatusesForWrite(project.workspaceId);
  const status = getStatusOrThrow(statuses, data.status);
  const assignee = await resolveWorkspaceAssignee({
    workspaceId: project.workspaceId,
    assigneeId: data.assigneeId,
    findMembership: findAssigneeMembership,
  });

  return runWithIssueNumberRetry(() =>
    getPrisma().$transaction(
      async (tx) => {
        const aggregate = await tx.issue.aggregate({
          where: { projectId },
          _max: { issueNumber: true },
        });
        const issueNumber = (aggregate._max.issueNumber ?? 0) + 1;
        const issueKey = `${project.key}-${issueNumber}`;

        const issue = await tx.issue.create({
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
            assigneeId: assignee?.id ?? null,
            completedAt: data.status === "done" ? new Date() : null,
          },
          include: {
            status: true,
            labels: {
              include: {
                label: true,
              },
            },
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
                imageUrl: true,
              },
            },
          },
        });

        await tx.activityLog.create({
          data: {
            workspaceId: project.workspaceId,
            issueId: issue.id,
            projectId,
            actorId: access.user.id,
            action: activityActions.issueCreated,
            metadata: {
              issueKey,
              title: issue.title,
              status: data.status,
              priority: data.priority,
              assignee: assignee?.name ?? assignee?.email ?? null,
            },
          },
        });

        return issue;
      },
      { isolationLevel: "Serializable" },
    ),
  );
}

export async function updateIssue({
  issueId,
  input,
}: {
  issueId: string;
  input: IssueInput;
}) {
  const issue = await getActiveIssueForMutation(issueId);
  const access = await requireWorkspaceAccess(issue.workspaceId);
  const data = issueInputSchema.parse(input);
  const statuses = await ensureDefaultIssueStatusesForWrite(issue.workspaceId);
  const status = getStatusOrThrow(statuses, data.status);
  const assignee = await resolveWorkspaceAssignee({
    workspaceId: issue.workspaceId,
    assigneeId: data.assigneeId,
    findMembership: findAssigneeMembership,
  });
  const activityEvents = buildIssueUpdateActivityEvents({
    previous: {
      title: issue.title,
      description: issue.description,
      status: issue.status.type,
      priority: issue.priority,
      assigneeId: issue.assignee?.id ?? null,
      assigneeName: issue.assignee?.name ?? issue.assignee?.email ?? null,
    },
    next: {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assigneeId: assignee?.id ?? null,
      assigneeName: assignee?.name ?? assignee?.email ?? null,
    },
  });

  return getPrisma().$transaction(async (tx) => {
    const updatedIssue = await tx.issue.update({
      where: { id: issueId },
      data: {
        title: data.title,
        description: data.description,
        statusId: status.id,
        priority: data.priority,
        assigneeId: assignee?.id ?? null,
        completedAt:
          data.status === "done" ? (issue.completedAt ?? new Date()) : null,
      },
      include: {
        status: true,
        labels: {
          include: {
            label: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
      },
    });

    if (activityEvents.length > 0) {
      await tx.activityLog.createMany({
        data: activityEvents.map((event) => ({
          workspaceId: issue.workspaceId,
          issueId,
          projectId: issue.projectId,
          actorId: access.user.id,
          action: event.action,
          metadata: event.metadata,
        })),
      });
    }

    return updatedIssue;
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
      title: true,
      description: true,
      priority: true,
      completedAt: true,
      archivedAt: true,
      status: {
        select: {
          type: true,
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!issue || issue.archivedAt) {
    throw new Error("Issue not found.");
  }

  return issue;
}

function findAssigneeMembership(workspaceId: string, userId: string) {
  return getPrisma().workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
    include: {
      user: true,
    },
  });
}

async function ensureDefaultIssueStatusesForWrite(workspaceId: string) {
  await getPrisma().$transaction(
    DEFAULT_ISSUE_STATUSES.map((status) =>
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
