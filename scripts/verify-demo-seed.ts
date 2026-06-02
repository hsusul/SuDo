import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { normalizePostgresConnectionString } from "../src/lib/database-url";

type VerificationResult = {
  demoWorkspaceCount: number;
  demoWorkspaceSummaries: Array<{
    workspaceIndex: number;
    workspaceSlug: string;
    projectCount: number;
    issueCount: number;
    labelCount: number;
    commentCount: number;
    ownerMembershipCount: number;
    hasProjects: boolean;
    hasIssues: boolean;
    hasLabels: boolean;
    hasComments: boolean;
    allProjectsInWorkspace: boolean;
    allIssuesLinkExpectedProjectWorkspace: boolean;
    allIssueLabelsLinkCorrectWorkspace: boolean;
    allCommentsLinkCorrectWorkspaceIssueAndAuthor: boolean;
    duplicateProjectIssueNumberGroups: number;
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
    const demoWorkspaces = await prisma.workspace.findMany({
      where: {
        isDemo: true,
        archivedAt: null,
      },
      select: {
        id: true,
        slug: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const demoWorkspaceSummaries = await Promise.all(
      demoWorkspaces.map(async (workspace, index) => {
        const [
          projectCount,
          issueCount,
          labelCount,
          commentCount,
          ownerMembershipCount,
          projects,
          issues,
          issueLabels,
          comments,
          duplicateProjectIssueNumbers,
        ] = await Promise.all([
          prisma.project.count({ where: { workspaceId: workspace.id } }),
          prisma.issue.count({ where: { workspaceId: workspace.id } }),
          prisma.label.count({ where: { workspaceId: workspace.id } }),
          prisma.comment.count({ where: { workspaceId: workspace.id } }),
          prisma.workspaceMember.count({
            where: {
              workspaceId: workspace.id,
              role: "owner",
            },
          }),
          prisma.project.findMany({
            where: { workspaceId: workspace.id },
            select: { workspaceId: true },
          }),
          prisma.issue.findMany({
            where: { workspaceId: workspace.id },
            select: {
              workspaceId: true,
              project: { select: { workspaceId: true } },
              status: { select: { workspaceId: true } },
            },
          }),
          prisma.issueLabel.findMany({
            where: {
              issue: { workspaceId: workspace.id },
            },
            select: {
              issue: { select: { workspaceId: true } },
              label: { select: { workspaceId: true } },
            },
          }),
          prisma.comment.findMany({
            where: { workspaceId: workspace.id },
            select: {
              workspaceId: true,
              issue: { select: { workspaceId: true } },
              author: {
                select: {
                  memberships: {
                    where: { workspaceId: workspace.id },
                    select: { id: true },
                  },
                },
              },
            },
          }),
          prisma.issue.groupBy({
            by: ["projectId", "issueNumber"],
            where: { workspaceId: workspace.id },
            _count: { issueNumber: true },
            having: {
              issueNumber: {
                _count: { gt: 1 },
              },
            },
          }),
        ]);

        return {
          workspaceIndex: index + 1,
          workspaceSlug: workspace.slug,
          projectCount,
          issueCount,
          labelCount,
          commentCount,
          ownerMembershipCount,
          hasProjects: projectCount >= 2,
          hasIssues: issueCount >= 6,
          hasLabels: labelCount >= 4,
          hasComments: commentCount >= 3,
          allProjectsInWorkspace: projects.every(
            (project) => project.workspaceId === workspace.id,
          ),
          allIssuesLinkExpectedProjectWorkspace: issues.every(
            (issue) =>
              issue.workspaceId === workspace.id &&
              issue.project.workspaceId === workspace.id &&
              issue.status.workspaceId === workspace.id,
          ),
          allIssueLabelsLinkCorrectWorkspace: issueLabels.every(
            (issueLabel) =>
              issueLabel.issue.workspaceId === workspace.id &&
              issueLabel.label.workspaceId === workspace.id,
          ),
          allCommentsLinkCorrectWorkspaceIssueAndAuthor: comments.every(
            (comment) =>
              comment.workspaceId === workspace.id &&
              comment.issue.workspaceId === workspace.id &&
              comment.author.memberships.length > 0,
          ),
          duplicateProjectIssueNumberGroups: duplicateProjectIssueNumbers.length,
        };
      }),
    );

    const result: VerificationResult = {
      demoWorkspaceCount: demoWorkspaces.length,
      demoWorkspaceSummaries,
    };

    console.log(JSON.stringify(result, null, 2));

    if (
      result.demoWorkspaceCount < 1 ||
      result.demoWorkspaceSummaries.some(
        (summary) =>
          !summary.hasProjects ||
          !summary.hasIssues ||
          !summary.hasLabels ||
          !summary.hasComments ||
          summary.ownerMembershipCount < 1 ||
          !summary.allProjectsInWorkspace ||
          !summary.allIssuesLinkExpectedProjectWorkspace ||
          !summary.allIssueLabelsLinkCorrectWorkspace ||
          !summary.allCommentsLinkCorrectWorkspaceIssueAndAuthor ||
          summary.duplicateProjectIssueNumberGroups > 0,
      )
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
