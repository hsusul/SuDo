import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { normalizePostgresConnectionString } from "../src/lib/database-url";

type VerificationResult = {
  workspaceCount: number;
  projectCount: number;
  activeProjectCount: number;
  statusCount: number;
  activeIssueCount: number;
  archivedIssueCount: number;
  duplicateIssueKeyGroups: number;
  duplicateProjectIssueNumberGroups: number;
  allIssuesLinkCorrectWorkspaceAndProject: boolean;
  issueSummaries: Array<{
    issueIndex: number;
    workspaceSlug: string;
    projectKey: string;
    issueKey: string;
    status: string;
    priority: string;
    archived: boolean;
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
    const [
      workspaceCount,
      projectCount,
      activeProjectCount,
      statusCount,
      issues,
      duplicateIssueKeys,
      duplicateProjectIssueNumbers,
    ] = await Promise.all([
      prisma.workspace.count(),
      prisma.project.count(),
      prisma.project.count({ where: { archivedAt: null } }),
      prisma.issueStatus.count(),
      prisma.issue.findMany({
        select: {
          workspaceId: true,
          projectId: true,
          issueKey: true,
          priority: true,
          archivedAt: true,
          status: { select: { type: true, workspaceId: true } },
          workspace: { select: { slug: true } },
          project: { select: { key: true, workspaceId: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.issue.groupBy({
        by: ["workspaceId", "issueKey"],
        _count: { issueKey: true },
        having: {
          issueKey: {
            _count: { gt: 1 },
          },
        },
      }),
      prisma.issue.groupBy({
        by: ["projectId", "issueNumber"],
        _count: { issueNumber: true },
        having: {
          issueNumber: {
            _count: { gt: 1 },
          },
        },
      }),
    ]);

    const result: VerificationResult = {
      workspaceCount,
      projectCount,
      activeProjectCount,
      statusCount,
      activeIssueCount: issues.filter((issue) => !issue.archivedAt).length,
      archivedIssueCount: issues.filter((issue) => issue.archivedAt).length,
      duplicateIssueKeyGroups: duplicateIssueKeys.length,
      duplicateProjectIssueNumberGroups: duplicateProjectIssueNumbers.length,
      allIssuesLinkCorrectWorkspaceAndProject: issues.every(
        (issue) =>
          issue.workspaceId === issue.project.workspaceId &&
          issue.workspaceId === issue.status.workspaceId,
      ),
      issueSummaries: issues.map((issue, index) => ({
        issueIndex: index + 1,
        workspaceSlug: issue.workspace.slug,
        projectKey: issue.project.key,
        issueKey: issue.issueKey,
        status: issue.status.type,
        priority: issue.priority,
        archived: Boolean(issue.archivedAt),
      })),
    };

    console.log(JSON.stringify(result, null, 2));

    if (
      result.workspaceCount < 1 ||
      result.duplicateIssueKeyGroups > 0 ||
      result.duplicateProjectIssueNumberGroups > 0 ||
      !result.allIssuesLinkCorrectWorkspaceAndProject
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
