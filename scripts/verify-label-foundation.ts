import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { normalizePostgresConnectionString } from "../src/lib/database-url";

type VerificationResult = {
  workspaceCount: number;
  projectCount: number;
  activeIssueCount: number;
  labelCount: number;
  issueLabelCount: number;
  duplicateWorkspaceLabelSlugGroups: number;
  duplicateIssueLabelGroups: number;
  allIssueLabelsLinkCorrectWorkspace: boolean;
  labeledActiveIssueCount: number;
  labelSummaries: Array<{
    labelIndex: number;
    workspaceSlug: string;
    name: string;
    color: string;
    attachedIssueCount: number;
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
      activeIssueCount,
      labels,
      issueLabels,
      duplicateWorkspaceLabelSlugs,
      duplicateIssueLabels,
      labeledActiveIssueCount,
    ] = await Promise.all([
      prisma.workspace.count(),
      prisma.project.count(),
      prisma.issue.count({ where: { archivedAt: null } }),
      prisma.label.findMany({
        select: {
          workspaceId: true,
          name: true,
          color: true,
          workspace: { select: { slug: true } },
          _count: { select: { issues: true } },
        },
        orderBy: [{ workspace: { slug: "asc" } }, { name: "asc" }],
      }),
      prisma.issueLabel.findMany({
        select: {
          issue: { select: { workspaceId: true } },
          label: { select: { workspaceId: true } },
        },
      }),
      prisma.label.groupBy({
        by: ["workspaceId", "slug"],
        _count: { slug: true },
        having: {
          slug: {
            _count: { gt: 1 },
          },
        },
      }),
      prisma.issueLabel.groupBy({
        by: ["issueId", "labelId"],
        _count: { labelId: true },
        having: {
          labelId: {
            _count: { gt: 1 },
          },
        },
      }),
      prisma.issue.count({
        where: {
          archivedAt: null,
          labels: { some: {} },
        },
      }),
    ]);

    const result: VerificationResult = {
      workspaceCount,
      projectCount,
      activeIssueCount,
      labelCount: labels.length,
      issueLabelCount: issueLabels.length,
      duplicateWorkspaceLabelSlugGroups: duplicateWorkspaceLabelSlugs.length,
      duplicateIssueLabelGroups: duplicateIssueLabels.length,
      allIssueLabelsLinkCorrectWorkspace: issueLabels.every(
        (issueLabel) => issueLabel.issue.workspaceId === issueLabel.label.workspaceId,
      ),
      labeledActiveIssueCount,
      labelSummaries: labels.map((label, index) => ({
        labelIndex: index + 1,
        workspaceSlug: label.workspace.slug,
        name: label.name,
        color: label.color,
        attachedIssueCount: label._count.issues,
      })),
    };

    console.log(JSON.stringify(result, null, 2));

    if (
      result.workspaceCount < 1 ||
      result.duplicateWorkspaceLabelSlugGroups > 0 ||
      result.duplicateIssueLabelGroups > 0 ||
      !result.allIssueLabelsLinkCorrectWorkspace
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
