import "server-only";

import { requireCurrentUser } from "@/lib/auth";
import { commentInputSchema, type CommentInput } from "@/lib/comment-validation";
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
  const user = await requireCurrentUser();
  const issue = await getActiveIssueForComment(issueId);
  const access = await requireWorkspaceAccess(issue.workspaceId);
  const data = commentInputSchema.parse(input);

  return getPrisma().comment.create({
    data: {
      workspaceId: access.workspace.id,
      issueId: issue.id,
      authorId: user.id,
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
}

async function getActiveIssueForComment(issueId: string) {
  const issue = await getPrisma().issue.findUnique({
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
  });

  if (!issue || issue.archivedAt || issue.project.archivedAt) {
    throw new Error("Issue not found.");
  }

  return issue;
}
