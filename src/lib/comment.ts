import "server-only";

import { activityActions } from "@/lib/activity-events";
import { commentInputSchema, type CommentInput } from "@/lib/comment-validation";
import { assertMutationAllowed } from "@/lib/mutation-rate-limit";
import { getPrisma } from "@/lib/prisma";
import { requireWorkspaceAccess } from "@/lib/workspace";

export type IssueComment = Awaited<ReturnType<typeof getIssueComments>>[number];

export async function getIssueComments(issueId: string) {
  const issue = await getActiveIssueForComment(issueId);
  await requireWorkspaceAccess(issue.workspaceId);

  return getPrisma().comment.findMany({
    where: {
      issueId,
      deletedAt: null,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function createCommentForIssue({
  issueId,
  input,
}: {
  issueId: string;
  input: CommentInput;
}) {
  const issue = await getActiveIssueForComment(issueId);
  const access = await requireWorkspaceAccess(issue.workspaceId);
  const data = commentInputSchema.parse(input);
  assertMutationAllowed({
    key: `comment:create:${access.user.id}`,
    limit: 30,
    windowMs: 60_000,
  });

  return getPrisma().$transaction(async (tx) => {
    const comment = await tx.comment.create({
      data: {
        workspaceId: access.workspace.id,
        issueId: issue.id,
        authorId: access.user.id,
        body: data.body,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    await tx.activityLog.create({
      data: {
        workspaceId: access.workspace.id,
        issueId: issue.id,
        projectId: issue.projectId,
        actorId: access.user.id,
        action: activityActions.issueCommentAdded,
        metadata: {
          commentId: comment.id,
        },
      },
    });

    return comment;
  });
}

async function getActiveIssueForComment(issueId: string) {
  const issue = await getPrisma().issue.findUnique({
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
  });

  if (!issue || issue.archivedAt || issue.project.archivedAt) {
    throw new Error("Issue not found.");
  }

  return issue;
}
