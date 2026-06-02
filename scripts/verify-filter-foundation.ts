import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { normalizePostgresConnectionString } from "../src/lib/database-url";
import { parseIssueFilters } from "../src/lib/issue-filter-validation";

type VerificationResult = {
  workspaceCount: number;
  activeProjectCount: number;
  activeIssueCount: number;
  checkedProject: {
    workspaceSlug: string;
    projectKey: string;
  } | null;
  statusFilterCount: number | null;
  priorityFilterCount: number | null;
  labelFilterCount: number | null;
  searchFilterCount: number | null;
  invalidFiltersIgnored: boolean;
  labelFilterStaysInWorkspace: boolean;
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
    const [workspaceCount, activeProjectCount, activeIssueCount, project] =
      await Promise.all([
        prisma.workspace.count(),
        prisma.project.count({ where: { archivedAt: null } }),
        prisma.issue.count({ where: { archivedAt: null } }),
        prisma.project.findFirst({
          where: {
            archivedAt: null,
            issues: {
              some: {
                archivedAt: null,
              },
            },
          },
          select: {
            id: true,
            key: true,
            workspaceId: true,
            workspace: { select: { slug: true } },
            issues: {
              where: { archivedAt: null },
              select: {
                issueKey: true,
                title: true,
                status: { select: { type: true } },
                priority: true,
                labels: {
                  select: {
                    labelId: true,
                    label: { select: { workspaceId: true } },
                  },
                },
              },
              take: 1,
            },
          },
        }),
      ]);

    const sampleIssue = project?.issues[0] ?? null;
    const sampleLabel = sampleIssue?.labels[0] ?? null;

    const [statusFilterCount, priorityFilterCount, labelFilterCount, searchFilterCount] =
      project && sampleIssue
        ? await Promise.all([
            prisma.issue.count({
              where: {
                projectId: project.id,
                archivedAt: null,
                status: { type: sampleIssue.status.type },
              },
            }),
            prisma.issue.count({
              where: {
                projectId: project.id,
                archivedAt: null,
                priority: sampleIssue.priority,
              },
            }),
            sampleLabel
              ? prisma.issue.count({
                  where: {
                    projectId: project.id,
                    archivedAt: null,
                    labels: {
                      some: {
                        labelId: sampleLabel.labelId,
                        label: { workspaceId: project.workspaceId },
                      },
                    },
                  },
                })
              : Promise.resolve(null),
            prisma.issue.count({
              where: {
                projectId: project.id,
                archivedAt: null,
                OR: [
                  { issueKey: { contains: sampleIssue.issueKey, mode: "insensitive" } },
                  { title: { contains: sampleIssue.title, mode: "insensitive" } },
                ],
              },
            }),
          ])
        : [null, null, null, null];

    const result: VerificationResult = {
      workspaceCount,
      activeProjectCount,
      activeIssueCount,
      checkedProject: project
        ? {
            workspaceSlug: project.workspace.slug,
            projectKey: project.key,
          }
        : null,
      statusFilterCount,
      priorityFilterCount,
      labelFilterCount,
      searchFilterCount,
      invalidFiltersIgnored:
        Object.keys(parseIssueFilters({ status: "blocked", priority: "critical" })).length === 0,
      labelFilterStaysInWorkspace: sampleLabel
        ? sampleLabel.label.workspaceId === project?.workspaceId
        : true,
    };

    console.log(JSON.stringify(result, null, 2));

    if (
      result.workspaceCount < 1 ||
      !result.invalidFiltersIgnored ||
      !result.labelFilterStaysInWorkspace
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
