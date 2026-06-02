import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { normalizePostgresConnectionString } from "../src/lib/database-url";

loadEnv({ path: ".env", quiet: true });
loadEnv({ path: ".env.local", override: true, quiet: true });

type ProjectCountSummary = {
  workspaceSlug: string;
  projectKey: string;
  activeIssueCount: number;
};

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
    const workspaces = await prisma.workspace.findMany({
      where: { archivedAt: null },
      select: {
        id: true,
        slug: true,
        projects: {
          where: { archivedAt: null },
          select: {
            id: true,
            key: true,
            _count: {
              select: {
                issues: {
                  where: { archivedAt: null },
                },
              },
            },
          },
          orderBy: { key: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const activeWorkspaceIssueCounts = await Promise.all(
      workspaces.map((workspace) =>
        prisma.issue.count({
          where: {
            workspaceId: workspace.id,
            archivedAt: null,
            project: { archivedAt: null },
          },
        }),
      ),
    );

    const projectSummaries: ProjectCountSummary[] = workspaces.flatMap((workspace) =>
      workspace.projects.map((project) => ({
        workspaceSlug: workspace.slug,
        projectKey: project.key,
        activeIssueCount: project._count.issues,
      })),
    );

    const projectCountsMatchWorkspaceTotals = workspaces.every((workspace, index) => {
      const projectIssueTotal = workspace.projects.reduce(
        (sum, project) => sum + project._count.issues,
        0,
      );

      return projectIssueTotal === activeWorkspaceIssueCounts[index];
    });

    const result = {
      workspaceCount: workspaces.length,
      activeProjectCount: workspaces.reduce(
        (sum, workspace) => sum + workspace.projects.length,
        0,
      ),
      activeIssueCount: activeWorkspaceIssueCounts.reduce((sum, count) => sum + count, 0),
      projectCountsMatchWorkspaceTotals,
      allProjectCountsAreNonNegative: projectSummaries.every(
        (project) => project.activeIssueCount >= 0,
      ),
      projectSummaries,
    };

    console.log(JSON.stringify(result, null, 2));

    if (!result.projectCountsMatchWorkspaceTotals || !result.allProjectCountsAreNonNegative) {
      process.exitCode = 1;
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

