import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { normalizePostgresConnectionString } from "../src/lib/database-url";

type VerificationResult = {
  workspaceCount: number;
  projectCount: number;
  activeIssueCount: number;
  archivedIssueCount: number;
  commentCount: number;
  deletedCommentCount: number;
  allCommentsLinkCorrectWorkspaceIssueAndAuthor: boolean;
  activeIssueWithCommentsCount: number;
  commentSummaries: Array<{
    commentIndex: number;
    workspaceSlug: string;
    projectKey: string;
    issueKey: string;
    authorPresent: boolean;
    deleted: boolean;
  }>;
};

loadEnv({ path: ".env", quiet: true });
loadEnv({ path: ".env.local", override: true, quiet: true });

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: normalizePostgresConnectionString(connectionString),
    }),
  });

  try {
    const [workspaceCount, projectCount, activeIssueCount, archivedIssueCount, comments] =
      await Promise.all([
        prisma.workspace.count(),
        prisma.project.count(),
        prisma.issue.count({ where: { archivedAt: null } }),
        prisma.issue.count({ where: { archivedAt: { not: null } } }),
        prisma.comment.findMany({
          select: {
            workspaceId: true,
            issueId: true,
            authorId: true,
            deletedAt: true,
            workspace: { select: { slug: true } },
            issue: {
              select: {
                workspaceId: true,
                issueKey: true,
                project: { select: { key: true } },
              },
            },
            author: { select: { id: true } },
          },
          orderBy: { createdAt: "asc" },
        }),
      ]);

    const result: VerificationResult = {
      workspaceCount,
      projectCount,
      activeIssueCount,
      archivedIssueCount,
      commentCount: comments.length,
      deletedCommentCount: comments.filter((comment) => comment.deletedAt).length,
      allCommentsLinkCorrectWorkspaceIssueAndAuthor: comments.every(
        (comment) =>
          comment.workspaceId === comment.issue.workspaceId &&
          comment.issueId.length > 0 &&
          comment.authorId === comment.author.id,
      ),
      activeIssueWithCommentsCount: await prisma.issue.count({
        where: {
          archivedAt: null,
          comments: {
            some: {
              deletedAt: null,
            },
          },
        },
      }),
      commentSummaries: comments.map((comment, index) => ({
        commentIndex: index + 1,
        workspaceSlug: comment.workspace.slug,
        projectKey: comment.issue.project.key,
        issueKey: comment.issue.issueKey,
        authorPresent: Boolean(comment.author.id),
        deleted: Boolean(comment.deletedAt),
      })),
    };

    console.log(JSON.stringify(result, null, 2));

    if (
      result.workspaceCount < 1 ||
      result.projectCount < 1 ||
      !result.allCommentsLinkCorrectWorkspaceIssueAndAuthor
    ) {
      process.exitCode = 1;
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
